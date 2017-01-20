//this file implements simple API interface for client Application

var express = require('express');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;

var app = express();
var voyagedb;

//connect to the database
mongoClient.connect('mongodb://localhost:27017/voyage', function(err, db) {
	if(err) throw err;
	voyagedb = db;
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

//the methods to handle incoming requests

app.get('/getSites', function(req, res) {
	voyagedb.collection('Sites').find().toArray(function(err, sitesArray) {
		res.send(sitesArray);
	});
});

app.get('/getRating', function(req, res) {
	voyagedb.collection('RatingMatrix').find().toArray(function(err, ratingMatrix) {
		res.send(ratingMatrix);
	});
});

app.get('/getContext', function(req, res) {
	voyagedb.collection('ContextMatrix').find().toArray(function(err, contextMatrix) {
		res.send(contextMatrix);
	});
});

app.put('/updateUser', function(req, res) {
	//update the current user to save the results after more searches of observation sites
});

app.put('/updateRating', function(req, res) {
	//update prototype here
});

app.put('/updateContext', function(req, res) {
	// voyagedb.collection('ContextMatrix').update();
});

app.post('/insertUser', function(req, res) {
	voyagedb.collection('Users').insertOne({
		userId : req.body.userId,
		country : req.body.country,
		siteSearches : req.body.searches
	});
});

app.post('/insertRating', function(req, res) {
	voyagedb.collection('RatingMatrix').insertOne({
		userId : req.body.userId,
		siteId : req.body.siteId,
		rating : req.body.rating
	});
});

app.post('/insertContext', function(req, res) {
	voyagedb.collection('ContextMatrix').insertOne({
		userId : req.body.userId,
		siteId : req.body.siteId,
		contxt : req.body.contxt
	});
});

app.listen(8000);