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

//SUBJECT API ======================
//==================================

//Get all subjects
app.get('/subjects', function(req, res) {

	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.subjectName = {
			$like: '%' + query.q + '%'
		};
	}

	db.subject.findAll({
		where: where
	}).then(function(subject) {
		res.json(subject);
	}, function(e) {
		res.status(500).send();
	});
});

//Get subjects by ID
app.get('/subjects/:id', function(req, res) {
	var subjectID = parseInt(req.params.id, 10);

	db.subject.findById(subjectID).then(function(subject) {
		if (!!subject) {
			res.json(subject.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

//Request subjects
app.post('/subjects', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'subjectNameReq');

	//Post name in subjectReq table
	db.subjectReq.create(body).then(function(subject) {
		res.json(subject.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

//Delete subjects
app.delete('/subjects/:id', function(req, res) {
	var subjectID = parseInt(req.params.id, 10);
	db.subject.destroy({
		where: {
			id: subjectID
				//Add admin permission
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No course with id.'
			})
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	});
});

//COURSES API ======================
//==================================

//Get all courses
app.get('/courses', function(req, res) {

	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('courseName') && query.q.length > 0) {
		where.courseName = {
			$like: '%' + query.q + '%'
		};
	}

	db.course.findAll({
		where: where
	}).then(function(courses) {
		res.json(courses);
	}, function(e) {
		res.status(500).send();
	});
});

//Get courses by ID
app.get('/courses/:id', function(req, res) {
	var courseID = parseInt(req.params.id, 10);

	db.course.findById(courseID).then(function(course) {
		if (!!course) {
			res.json(course.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

//Get courses by SubjectID
app.get('/courses/sub/:id', function(req, res) {
	var ID = parseInt(req.params.id, 10);
	db.course.findAll({
		where: {
			subjectID: ID
		}
	}).then(function(courses) {
		res.json(courses);
	}, function(e) {
		res.status(500).send();
	});
});

//Get courses by subjectID and Beginner difficulty
app.get('/courses/b/:id', function(req, res) {
	var ID = parseInt(req.params.id, 10);
	db.course.findAll({
		order: [['courseRating', 'DESC']],
		where: {
			subjectID: ID,
			difficulty: 'Beginner'
		}
	}).then(function(courses) {
		res.json(courses);
	}, function(e) {
		res.status(500).send();
	});
});

//Get courses by subjectID and Intermediate difficulty
app.get('/courses/i/:id', function(req, res) {
	var ID = parseInt(req.params.id, 10);
	db.course.findAll({
		order: [['courseRating', 'DESC']],
		where: {
			subjectID: ID,
			difficulty: 'Intermediate'
		}
	}).then(function(courses) {
		res.json(courses);
	}, function(e) {
		res.status(500).send();
	});
});

//Get courses by subjectID and Advance difficulty
app.get('/courses/a/:id', function(req, res) {
	var ID = parseInt(req.params.id, 10);
	db.course.findAll({
		order: [['courseRating', 'DESC']],
		where: {
			subjectID: ID,
			difficulty: 'Advance'
		}
	}).then(function(courses) {
		res.json(courses);
	}, function(e) {
		res.status(500).send();
	});
});

//Add courses
app.post('/courses', function(req, res) {
	var body = _.pick(req.body, 'courseName', 'courseLink', 'difficulty', 'subjectID', 'courseRating');

	db.course.create(body).then(function(course) {
		res.json(course.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

//Post rating
app.post('/courses/rating/:id', middleware.requireAuthentication, function(req,res){
	var courseID = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'courseID', 'courseRating');
	var attribute = {};
	if (body.hasOwnProperty('courseRating')) {
		attribute.courseID = body.courseID;
		attribute.courseRating = body.courseRating;
		attribute.userId = req.user.get('id');
	}
	db.courseRating.findOne({
		where: {
			courseID: courseID,
			userId:req.user.get('id')
		}
	}).then(function(rating) {
		if (rating) {
			rating.update(attribute).then(function(rating) {
				res.json(rating.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			//res.status(404).send();
			//create rating
			db.courseRating.create(attribute).then(function (rating) {
				res.json(rating.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		}
	}, function() {
		res.status(500).send();
	});
});

//Get a course's rating by course ID
app.get('/courses/rating/:id', function(req,res){
	var courseID = parseInt(req.params.id, 10);
	db.courseRating.findAll({
		where: {
			courseID: courseID
		}
	}).then(function(courseRating) {
		res.json(courseRating);
	}, function(e) {
		res.status(500).send();
	});
});

app.get('/courses/userRating/:id', middleware.requireAuthentication, function(req,res){
	var courseID = parseInt(req.params.id, 10);
	db.courseRating.findAll({
		where: {
			courseID: courseID,
			userId: req.user.get('id')
		}
	}).then(function(courseRating) {
		res.json(courseRating);
	}, function(e) {
		res.status(500).send();
	});
});

//Edit existing course
app.put('/courses/:id', function(req, res) {
	var courseID = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'courseName', 'difficulty', 'courseLink', 'courseRating');
	var attribute = {};

	if (body.hasOwnProperty('courseName')) {
		attribute.courseName = body.courseName;
	}

	if (body.hasOwnProperty('difficulty')) {
		attribute.difficulty = body.difficulty;
	}

	if (body.hasOwnProperty('courseLink')) {
		attribute.courseLink = body.courseLink;
	}

	if (body.hasOwnProperty('courseRating')) {
		attribute.courseRating = body.courseRating;
	}

	db.course.findOne({
		where: {
			id: courseID
				//userId:req.user.get('id')
		}
	}).then(function(course) {
		if (course) {
			course.update(attribute).then(function(course) {
				res.json(course.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});
});

//Delete existing course by ID
app.delete('/courses/:id', function(req, res) {
	var courseID = parseInt(req.params.id, 10);
	db.course.destroy({
		where: {
			id: courseID
			//userId: req.user.get('id')
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No course with id.'
			})
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	});
});

//USER API =========================
//==================================

//Create user
app.post('/users', function(req, res) {
	console.log(req.body);
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

//Login user
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});
	}).then(function(tokenInstance) {
		res.json(tokenInstance.get('token'));
		//res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function() {
		res.status(401).send();
	});
});

//Logout user
app.delete('/users/logout', middleware.requireAuthentication, function(req, res) {
	req.token.destroy().then(function() {
		res.status(204).send();
	}).catch(function() {
		res.status(500).send();
	});
});

//DISCUSSIOON API ==================
//==================================

//Add new post based on subject ID
app.post('/post/:id/', middleware.requireAuthentication, function(req, res){
	var subjectID = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'title', 'content');
	var attribute = {};
	attribute.subjectID = subjectID;
	attribute.userId = req.user.get('id');
	attribute.title = body.title;
	attribute.content = body.content;

	db.post.create(attribute).then(function (post){
		//req.user.addPost(post). then(function (){
		//	return post.reload();
		//}).then(function (post) {
			res.json(post.toJSON());
		//});
	}, function (e){
		res.status(400).json(e);
	});
});

//post a comment based on postID
app.post('/comment/:id', middleware.requireAuthentication, function(req, res){
	var postID = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'content');
	var attribute = {};
	attribute.postID = postID;
	attribute.userId = req.user.get('id');
	attribute.content = body.content;

	db.comment.create(attribute).then(function (post){
		res.json(post.toJSON());
	}, function (e){
		res.status(400).json(e);
	});
});

//Edit post content with POST ID
app.put('/post/:id/', middleware.requireAuthentication, function(req, res){
	var postID = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'content');
	var attribute = {};

	if (body.hasOwnProperty('content')) {
		attribute.content = body.content;
	}

	db.post.findOne({
		where: {
			id: postID,
			userId:req.user.get('id')
		}
	}).then(function(post) {
		if (post) {
			post.update(attribute).then(function(post) {
				res.json(post.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});
});

//Edit comment content with COMMENT ID
app.put('/comment/:id/', middleware.requireAuthentication, function(req, res){
	var commentID = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'content');
	var attribute = {};

	if (body.hasOwnProperty('content')) {
		attribute.content = body.content;
	}

	db.comment.findOne({
		where: {
			id: commentID,
			userId:req.user.get('id')
		}
	}).then(function(comment) {
		if (comment) {
			comment.update(attribute).then(function(comment) {
				res.json(comment.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});
});

//Get post by subject id
app.get('/allPost/:id/', function(req, res) {
	var subjectID = parseInt(req.params.id, 10);
	db.post.findAll({
		where: {
			subjectID: subjectID
		}
	}).then(function(post) {
		res.json(post);
	}, function(e) {
		res.status(500).send();
	});
});

//Get post by POST ID
app.get('/post/:id/', function(req, res) {
	var postID = parseInt(req.params.id, 10);
	db.post.findById(postID).then(function(post) {
		if (!!post) {
			res.json(post.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

//Get comment by post id
app.get('/allComment/:id/', function(req, res) {
	var postID = parseInt(req.params.id, 10);
	db.comment.findAll({
		where: {
			postID: postID
		}
	}).then(function(comment) {
		res.json(comment);
	}, function(e) {
		res.status(500).send();
	});
});

//Get comment by COMMENT ID
app.get('/comment/:id/', function(req, res) {
	var commentID = parseInt(req.params.id, 10);
	db.comment.findById(commentID).then(function(comment) {
		if (!!comment) {
			res.json(comment.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

//Send index html when request from browser
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

//Sync data to database
//Start the server
db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '.');
	});
});