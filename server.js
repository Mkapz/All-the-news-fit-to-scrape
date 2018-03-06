
var express = require('express');
var app = express();
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var request = require('request'); 
var cheerio = require('cheerio');


app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));


app.use(express.static('public'));



var connection;

connection = mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/'); 


var db = mongoose.connection;


db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});


db.once('open', function() {
  console.log('Mongoose connection successful.');
});



var Note = require('./models/Note.js');
var Article = require('./models/Article.js');


app.get('/', function(req, res) {
  res.send(index.html);
});


app.get('/scrape', function(req, res) {
	
  request('http://www.politico.com/', function(error, response, html) {
  	console.log("html", html);
  	// then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // now, we grab every h2 within an article tag, and do the following:
    $('article h2').each(function(i, element) {

    		// save an empty result object
				var result = {};

				// add the text and href of every link, 
				// and save them as properties of the result obj
				result.title = $(this).children('a').text();
				result.link = $(this).children('a').attr('href');

				// using our Article model, create a new entry.
				// Notice the (result):
				// This effectively passes the result object to the entry (and the title and link)
				var entry = new Article (result);

				// now, save that entry to the db
				entry.save(function(err, doc) {
					// log any errors
				  if (err) {
				    console.log(err);
				  } 
				  // or log the doc
				  else {
				    console.log(doc);
				  }
				});


    });
  });

  res.send("Scrape Complete");
});


app.get('/articles', function(req, res){
	Article.find({}, function(err, doc){
		if (err){
			console.log(err);
		} 
		
		else {
			res.json(doc);
		}
	});
});


app.get('/articles/:id', function(req, res){

	Article.findOne({'_id': req.params.id})
	
	.populate('note')

	.exec(function(err, doc){
	
		if (err){
			console.log(err);
		} 
		
		else {
			res.json(doc);
		}
	});
});


/
app.post('/articles/:id', function(req, res){
	
	var newNote = new Note(req.body);

	
	newNote.save(function(err, doc){
	
		if(err){
			console.log(err);
		} 
	
		else {
		
			Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
			
			.exec(function(err, doc){
				
				if (err){
					console.log(err);
				} else {
					
					res.send(doc);
				}
			});
		}
	});
});


var PORT = process.env.PORT || 3000; // Sets an initial port.

  console.log('Port connected as id ' + connection.threadId);
  app.listen(PORT, function() {
	console.log("Server App listening on PORT: " + PORT);
});
