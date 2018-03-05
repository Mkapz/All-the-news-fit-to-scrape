var express= require("express");
var bodyParser= require("body-parser");
var mongoose= require("mongoose");
var cheerio= require("cheerio");
var path= require("path");
var logger= require("morgan");
var Note= require("./models/Note.js");
var article= require("./models/article.js");
var request= require("request");

var PORT= 3000;
var app= express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
	extended: false
}));


app.use(express.static("public"));

mongoose.connect()
var db= mongoose.connection;

db.on("error", function(error){
	console.log("Mongoose Error: ", error);
});

db.on("open", function(){
	console.log("mongoose connection successful");
});



