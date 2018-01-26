//this file implements simple API interface for client Application

var fs = require('fs');
var multer = require('multer');
var express = require('express');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;

var app = express();
var voyagedb;

var contentdb;

var upload = multer({dest: 'Uploads/'});

//connect to the database
// mongoClient.connect('mongodb://localhost:27017/voyage', function(err, db) {
// 	if(err) throw err;
// 	voyagedb = db;
// });

//connect to the database
// mongoClient.connect('mongodb://localhost:27017/ugcontent', function(err, db) {
// 	if(err) throw err;
// 	contentdb = db;
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

//the methods to handle incoming requests

app.get('/', function(req, res) {
	res.sendFile('/home/anish/Documents/ExpressAPI/index.html');
});

app.get('/images', function(req, res) {
	var images = [];
	var queryTags = req.body.tags.split(",");
	// var img1 = fs.readFileSync("/home/anish/Pictures/gatesian.jpg");
	// var img2 = fs.readFileSync("/home/anish/Pictures/warrenwork.jpg");

	for(let tag of queryTags) {
		// get file names based on tags and send those files
	}

	res.writeHead(200, {'Content-Type': 'image/jpg'});
	res.write(img1);
	res.write(img2);
	res.end();
});

app.get('/getSites', function(req, res) {
	voyagedb.collection('Sites').find().toArray(function(err, sitesArray) {
		res.send(sitesArray);
	});
});

app.post('/upload', upload.single('photo'), function(req, res) {
	contentdb.collection('ImageData').insertOne({
		fileName : req.file.filename,
		originalName : req.file.originalName,
		tags : req.body.tags.split(",")
	});

	res.send('image saved');
});

// when the server closes use contentdb.close();

// db.inventory.find( { tags: "red" } ); tags is an array of tags - to match the documents containing the "red" tag
// db.inventory.find( { tags: ["red", "blank"] } ); - to match the documents containg the "red" and "blank" tags

app.listen(8000);