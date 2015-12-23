//Initialize modules
var express = require('express');
var _ = require('underscore');
var path = require('path');
var db = require('./db.js');
var bodyParser = require('body-parser')

var app = express();
var PORT = process.env.PORT || 3000;

//For parsing from body
app.use(bodyParser.json());

//For public asset
app.use(express.static(__dirname + '/public'));

//Content
var subjects = [];
var courses = [];

//Send index html when request from browser
app.get('/', function (req, res){
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

//Get all subjects
app.get('/subjects', function (req, res){

	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('q') && query.q.length > 0){
		where.subjectName = {
			$like : '%' + query.q + '%'
		};
	}

	db.subject.findAll({where: where}).then(function (subjects){
		res.json(subjects);
	}, function (e) {
		res.status(500).send();
	});
});

//Get subjects by ID
app.get('/subjects/:id', function (req,res){
	var subjectID = parseInt(req.params.id, 10);

	db.subject.findById(subjectID).then(function (subject){
		if (!!subject){
			res.json(subject.toJSON());
		} else {
			res.status(404).send();
		}
	}, function (e){
		res.status(500).send();
	});
});

//Add subjects
app.post('/subjects', function (req,res){
	var body = _.pick(req.body, 'subjectName');

	db.subject.create(body).then(function (subject){
		res.json(subject.toJSON());
	}, function (e){
		res.status(400).json(e);
	});
});


//Sync data to database
db.sequelize.sync().then(function (){
	app.listen(PORT, function(){
		console.log('Express listening on port ' + PORT + '.');
	});
});