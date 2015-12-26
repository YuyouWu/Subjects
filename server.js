//Initialize modules
var express = require('express');
var _ = require('underscore');
var path = require('path');
var db = require('./db.js');
var bodyParser = require('body-parser');
var middleware = require('./middleware.js')(db);

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

///////////////
//Subject API// 
///////////////

//Get all subjects
app.get('/subjects', function (req, res){

	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('q') && query.q.length > 0){
		where.subjectName = {
			$like : '%' + query.q + '%'
		};
	}

	db.subject.findAll({where: where}).then(function (subject){
		res.json(subject);
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
app.post('/subjects', middleware.requireAuthentication, function (req,res){
	var body = _.pick(req.body, 'subjectName');

	db.subject.create(body).then(function (subject){
		res.json(subject.toJSON());
	}, function (e){
		res.status(400).json(e);
	});
});

///////////////
//Courses API//
///////////////

//Get all courses
app.get('/courses', function (req, res){

	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('courseName') && query.q.length > 0){
		where.courseName = {
			$like : '%' + query.q + '%'
		};
	}

	db.course.findAll({where: where}).then(function (courses){
		res.json(courses);
	}, function (e) {
		res.status(500).send();
	});
});

//Get courses by ID
app.get('/courses/:id', function (req,res){
	var courseID = parseInt(req.params.id, 10);

	db.course.findById(courseID).then(function (course){
		if (!!course){
			res.json(course.toJSON());
		} else {
			res.status(404).send();
		}
	}, function (e){
		res.status(500).send();
	});
});

//Add courses
app.post('/courses', function (req,res){
	var body = _.pick(req.body, 'courseName', 'difficulty');

	db.course.create(body).then(function (course){
		res.json(course.toJSON());
	}, function (e){
		res.status(400).json(e);
	});
});

//Edit existing course
app.put('/courses/:id', function (req,res){
	var courseID = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'courseName', 'difficulty');
	var attribute = {};

	if(body.hasOwnProperty('courseName')){
		attribute.courseName = body.courseName;
	} 

	if(body.hasOwnProperty('difficulty')){
		attribute.difficulty = body.difficulty;
	} 

	db.course.findOne({
		where: {
			id: courseID
			//userId:req.user.get('id')
		}
	}).then(function (course){
		if(course){
			course.update(attribute).then(function (course) {
				res.json(course.toJSON());
			}, function (e){
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function (){
		res.status(500).send(); 
	});
});

//Delete existing course by ID
app.delete('/courses/:id', function (req,res){
	var courseID = parseInt(req.params.id, 10);
	db.course.destroy({
		where: {
			id: courseID
			//userId: req.user.get('id')
		}
	}).then(function (rowsDeleted) {
		if (rowsDeleted === 0){
			res.status(404).json({
				error: 'No course with id.'
			})
		} else {
			res.status(204).send();
		}
	}, function (){
		res.status(500).send();
	})
});

////////////
//User API//
////////////

//Create user
app.post('/users', function (req,res){
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function (user){
		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});

//Login user
app.post('/users/login', function (req,res){
	var body = _.pick(req.body, 'email', 'password');
	
	db.user.authenticate(body).then(function (user){
		var token = user.generateToken('authentication');
		if (token){
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}
	}, function (){
		res.status(401).send();
	})
});

//Sync data to database
db.sequelize.sync({force:true}).then(function (){
	app.listen(PORT, function(){
		console.log('Express listening on port ' + PORT + '.');
	});
});