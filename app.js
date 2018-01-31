// file implements simple API interface for client Application

const cmd = require('node-cmd');
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

const ROOT_DIR = '/home/anish/Documents/ExpressAPI/';

const storage = multer.diskStorage({
	destination: ROOT_DIR + 'Uploads',
	filename: function(req, file, cb) {
		const dotIndex = file.originalname.lastIndexOf('.');
		const ext = file.originalname.substring(dotIndex);
		cb(null, Date.now() + ext);
	}
});

const upload = multer({ storage: storage });

const elasticClient = new elasticsearch.Client({
	host: 'localhost:9200'
});
const gvisionClient = new vision.ImageAnnotatorClient();

// the methods to handle incoming requests

app.get('/', function(req, res) {
	res.sendFile(ROOT_DIR + 'index.html');
});

app.get('/images', function(req, res) {
	const queryTags = req.query.tags;
	console.log('queryTags: ' + queryTags);

	elasticClient.search({
		index: 'imageindex',
		body: {
			query: {
				match: {
					tags: {
						query: queryTags,
						analyzer: 'english',
						fuzziness: 'AUTO'
					}
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
	const fileId = req.query.fileid;
	cmd.get(`
		cd ImageSearch
		python search.py --index index.csv --query ../Uploads/${fileId} --result-path ../Uploads
		`,
		function(err, data, stderr) {
			res.send(data);
		});
});

app.post('/upload', upload.single('photo'), function(req, res) {
	res.send('image saved');
});

app.post('/uploadGif', upload.single('photo'), function(req, res) {
	const gTagsArr = [];
	const fileName = req.file.filename;
	gvisionClient.labelDetection(ROOT_DIR + "Uploads/" + fileName)
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
				console.log(req.file);
				console.log(req.body);
				console.log('image tags(ES scope): ' + gTagsArr.join(","));

				res.send('gif saved');
			});
		})
		.catch(err => {
			console.log('error: ' + err);
		});
});

app.post('/uploadImg', upload.single('photo'), function(req, res) {
	cmd.get(`
		cd ImageSearch
		python index.py --dataset ../Uploads --index index.csv
		`,
	 	function(err, data, stderr) {
	 		console.log('The error in image indexing : ' + err);
	 });

	const gTagsArr = [];
	const fileName = req.file.filename;
	gvisionClient.labelDetection(ROOT_DIR + "/Uploads/" + fileName)
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
				console.log(req.file);
				console.log(req.body);
				console.log('image tags(ES scope): ' + gTagsArr.join(","));

				res.send('image saved');
			});
		})
		.catch(err => {
			console.log('error: ' + err);
		});
});

app.listen(8000);