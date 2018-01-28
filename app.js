//this file implements simple API interface for client Application

var fs = require('fs');
var multer = require('multer');
var express = require('express');
var bodyParser = require('body-parser');
var elasticsearch = require('elasticsearch');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use('/assets', express.static('assets'));
app.use('/imageassets', express.static('Uploads'));

var upload = multer({dest: 'Uploads/'});

var elasticClient = new elasticsearch.Client({
	host: 'localhost:9200'
});

// the methods to handle incoming requests

app.get('/', function(req, res) {
	res.sendFile('/home/anish/Documents/ExpressAPI/index.html');
});

app.get('/images', function(req, res) {
	var queryTags = req.query.tags;
	console.log('queryTags: ' + queryTags);

	elasticClient.search({
		index: 'imageindex',
		body: {
			query: {
				match: {
					tags: queryTags
				}
			}
		}
	}, function(error, response) {
		console.log('error: ' + error);
		let imgSrcArr = [];
		if(response.hits) {
			for(let doc of response.hits.hits) {
				imgSrcArr.push(doc._id);
			}
		}
		res.send(imgSrcArr.join());
	});
});

app.get('/more', function(req, res) {
	var queryTags = req.query.tags;
	console.log('queryTags:' + queryTags);
	
	elasticClient.search({
		index: 'imageindex',
		body: {
			query: {
				more_like_this : {
					fields : ["tags"],
					like: queryTags
				}
			}
		}
	}, function(error, response) {
		console.log('error: ' + error);
		let imgSrcArr = [];
		if(response.hits) {
			for(let doc of response.hits.hits) {
				imgSrcArr.push(doc._id);
			}
		}
		res.send(imgSrcArr.join());
	});
});

app.post('/upload', upload.single('photo'), function(req, res) {
	elasticClient.index({
		index: 'imageindex',
		type: 'imagedata',
		id: req.file.filename,
		body: {
			name: req.file.originalname,
			tags: req.body.tags
		}
	}, function(error, response) {
		if(error) {
			console.log('error:' + error);
		}
	});

	console.log(req.file);
	console.log(req.body);
	res.send('image saved');
});

app.listen(8000);