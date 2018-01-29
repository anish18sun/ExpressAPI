// file implements simple API interface for client Application

const fs = require('fs');
const multer = require('multer');
const express = require('express');
const bodyParser = require('body-parser');
const elasticsearch = require('elasticsearch');
const vision = require('@google-cloud/vision');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use('/assets', express.static('assets'));
app.use('/imageassets', express.static('Uploads'));

const upload = multer({dest: 'Uploads/'});

const elasticClient = new elasticsearch.Client({
	host: 'localhost:9200'
});
const gvisionClient = new vision.ImageAnnotatorClient();

// the methods to handle incoming requests

app.get('/', function(req, res) {
	res.sendFile('/home/anish/Documents/ExpressAPI/index.html');
});

app.get('/images', function(req, res) {
	const queryTags = req.query.tags;
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
		const imgSrcArr = [];
		if(response.hits) {
			for(let doc of response.hits.hits) {
				imgSrcArr.push(doc._id);
			}
		}
		res.send(imgSrcArr.join());
	});
});

app.get('/more', function(req, res) {
	const queryTags = req.query.tags;
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
		const imgSrcArr = [];
		if(response.hits.hits.length > 0) {
			for(let doc of response.hits.hits) {
				imgSrcArr.push(doc._id);
			}
			res.send(imgSrcArr.join());
		} else {
			// please put image file 'nosugg.jpg' in Uploads folder
			res.send("nosugg.jpg");		
		}
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

app.post('/uploadTagged', upload.single('photo'), function(req, res) {
	const gTagsArr = [];
	const fileName = req.file.filename;
	gvisionClient.labelDetection("/home/anish/Documents/ExpressAPI/Uploads/" + fileName)
		.then(results => {
			const labels = results[0].labelAnnotations;
			labels.forEach(label => gTagsArr.push(label.description));

			elasticClient.index({
				index: 'imageindex',
				type: 'imagedata',
				id: fileName,
				body: {
					name: req.file.originalname,
					tags: req.body.tags + " " + gTagsArr.join(" ")
				}
			}, function(error, response) {
				if(error) {
					console.log('error:' + error);
				}
				console.log('image tags(ES scope): ' + gTagsArr.join(","));
			});
		})
		.catch(err => {
			console.log('error: ' + err);
		});

	console.log(req.file);
	console.log(req.body);
	res.send('image saved');
});

app.listen(8000);