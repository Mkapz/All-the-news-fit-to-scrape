var mongoose= require("mongoose");

mongoose.connect(mongodb, function(err){
	if(err) throw err;
	console.log("database connected");
});