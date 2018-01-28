//this file implements simple API interface for client Application

var fs = require('fs');
var multer = require('multer');
var express = require('express');
var bodyParser = require('body-parser');
var elasticsearch = require('elasticsearch');

var app = express();
var upload = multer({dest: 'Uploads/'});

var elasticClient = new elasticsearch.Client({
	host: 'localhost:9200'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

// the methods to handle incoming requests

app.get('/', function(req, res) {
	res.sendFile('/home/anish/Documents/ExpressAPI/index.html');
});

app.get('/images', function(req, res) {
	var queryTags = req.query.tags;
	console.log('queryTags: ' + queryTags);
	res.writeHead(200, {'Content-Type': 'text/html'});

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

		if(response.hits) {
			for(let doc of response.hits.hits) {
				let imgId = doc._id;
				res.write("/home/anish/Documents/ExpressAPI/Uploads/" + imgId);
			}
		}
		res.end();
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