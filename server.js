
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var request = require("request");
var cheerio = require("cheerio");
var port = process.env.PORT || 3000;
mongoose.Promise = Promise;


var app = express();


app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));


app.use(express.static("public"));


mongoose.connect("mongodb:/");
var db = mongoose.connection;


db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});


db.once("open", function() {
  console.log("Mongoose connection successful.");
});



app.get("/scrape", function(req, res) {
  request("https://www.politico.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("article.tease-row header").each(function(i, element) {
      var result = {};

      result.title = $(this).find("a").text();
      result.summary = $(this).find("p").text();
      result.link = $(this).find("a").attr("href");
      var entry = new Article(result);
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });
    });
  });
  res.send("Just scraped from politico");
});

app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

app.get("/articles/:id", function(req, res) {
  Article.findOne({"_id": req.params.id})
  .populate("note")
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

app.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({"_id": req.params.id}, {"note": doc._id})
      .exec(function(error, doc) {
        if (error) {
          console.log(error);
        }
        else {
          res.send(doc);
        }
      })
    }
  })
})


app.listen(3000, function() {
  console.log("App running on port 3000!");
});