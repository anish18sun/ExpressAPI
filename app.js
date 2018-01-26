//this file implements simple API interface for client Application

var fs = require('fs');
var multer = require('multer');
var express = require('express');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;

var contentdb;
var app = express();
var upload = multer({dest: 'Uploads/'});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

// connect to the database; the database(and collection) must exist(pre-created)

// mongoClient.connect('mongodb://localhost:27017/ugcontent', function(err, db) {
// 	if(err) throw err;
// 	contentdb = db;
// });

/*			INSTRUCTIONS 
 * To hit the api from your localhost, go the project directory in terminal and
 * type 'node app.js' - this will start the node server. Now to make get request
 * to the base url(index.html), in browser type 'localhost:8000/', similarly
 * for other types of requests 'localhost:8000/images'
*/

//the methods to handle incoming requests

app.get('/', function(req, res) {
	res.sendFile('/home/anish/Documents/ExpressAPI/index.html');
});

// the index.html(ajax) will hit this url-path with tag request
app.get('/images', function(req, res) {
	var images = [];
	var queryTags = req.body.tags.split(",");

	// uncomment the lines below to load any image files from the filesystem, can be used for testing
	// load any file from your filesystem, change the directory path
	// var img1 = fs.readFileSync("/home/anish/Pictures/gatesian.jpg");
	// var img2 = fs.readFileSync("/home/anish/Pictures/warrenwork.jpg");

	console.log(queryTags);

	res.writeHead(200, {'Content-Type': 'image/jpg'});
	res.write(img1);	// send the 1st image
	res.write(img2);	// send the 2nd image
	res.end();
});

app.post('/upload', upload.single('photo'), function(req, res) {
	// contentdb.collection('ImageData').insertOne({
	// 	fileName : req.file.filename,
	// 	originalName : req.file.originalName,
	// 	tags : req.body.tags.split(",")
	// });
	
	// only multipart/form-data type requests are allowed

	console.log(req.file);
	console.log(req.body);
	res.send('image saved');
});

// when the server closes use contentdb.close();

app.listen(8000);