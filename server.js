//Initialize modules
var express = require('express');
var _ = require('underscore');
var path = require('path');
var db = require('./db.js');
var bodyParser = require('body-parser');
var middleware = require('./middleware.js')(db);
var bcrypt = require ('bcryptjs');
var sendgrid = require ('sendgrid')(process.env.API);

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

	if (query.hasOwnProperty('c') && query.c.length > 0) {
		where.category = query.c;
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


//Create subjects
app.post('/subjects', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'subjectName','category');
	var admin = Boolean(req.user.get('admin'));
	//Post name in subject table
	//Check if user is admin
	if(admin === true){
		db.subject.create(body).then(function(subject) {
			res.json(subject.toJSON());
		}, function(e) {
			res.status(400).json(e);
		});
	} else {
		res.status(400).send();
	}
});

//Request subjects
app.post('/subjectsReq', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'subjectNameReq' , 'category');

	//Post name in subjectReq table
	db.subjectReq.create(body).then(function(subject) {
		res.json(subject.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

//Delete subject by id
app.delete('/subjects/:id', middleware.requireAuthentication, function(req, res) {
	var subjectID = parseInt(req.params.id, 10);
	var admin = Boolean(req.user.get('admin'));
	console.log("Checking type: " + typeof admin);
	console.log(admin);
	//If user is admin
	if(admin === true){
		db.subject.destroy({
			where: {
				id: subjectID
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
	} else {
		res.status(400).send();
	}
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
	var body = _.pick(req.body, 'courseName', 'courseLink', 'difficulty', 'subjectId', 'courseRating');

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

//Get user rating with course ID
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

//Get rated courses with user ID
app.get('/courses/ratedCourses/:id', function(req, res){
	var userID = parseInt(req.params.id, 10);
	var courseObject = {};
	db.courseRating.findAll({
		order: [['courseRating', 'DESC']],
		where: {
			userId: userID
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
			});
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
	var body = _.pick(req.body, 'email', 'password', 'userName');

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

//Get current user
app.get('/currentUser/', middleware.requireAuthentication, function(req, res){
	var userID = req.user.get('id');
	db.user.findById(userID).then(function(user) {
		if (!!user) {
			res.json(user.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

//Get user by userID
app.get('/users/:id', function(req, res){
	var userID = parseInt(req.params.id, 10);
	db.user.findById(userID).then(function(user) {
		if (!!user) {
			res.json(user.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

//Check for existng userName 
app.get('/userNameCheck/:userName', function(req, res){
	var userName = req.params.userName;
	db.user.findOne({
		where: {
			userName: userName
		}
	}).then(function (user){
		if (!!user) {
			//get existing userName if exist
			res.json(user.toJSON());
		} else {
			res.json("null");
		}
	}, function(e) {
		res.status(500).send();
	});
});

//Check for existng email address 
app.get('/emailCheck/:email', function(req, res){
	var email = req.params.email;
	db.user.findOne({
		where: {
			email: email
		}
	}).then(function (user){
		if (!!user) {
			//get existing userName if exist
			res.json(user.toJSON());
		} else {
			res.json("null");
		}
	}, function(e) {
		res.status(500).send();
	});
});

//Edit password
app.put('/users/password/', middleware.requireAuthentication, function(req, res){
	var userID = req.user.get('id');
	var body = _.pick(req.body, 'email','password');

	//new password salt
	var salt = bcrypt.genSaltSync(10);
	//new hashedPassword based on new salt
	var hashedPassword = bcrypt.hashSync(req.body.newPassword, salt);

	//store values in temp attribute
	var attribute = {};
	attribute.salt = salt;
	attribute.password_hash = hashedPassword;
	//first authenticate
	db.user.authenticate(body).then(function (){
		//then change password
		db.user.findById(userID).then(function (user){
			if (user) {
				user.update(attribute).then(function(user) {
					res.json(user.toJSON());
				}, function(e) {
					res.status(400).json(e);
				});
			} else {
				res.status(404).send();
			}
		});
	});
});

//Send random password to users who forgot their password
app.put('/password/random/', function(req,res){
	var body = _.pick(req.body, 'email');
	//generate a random password
	var newPassword = Math.random().toString(36).replace(/[^a-zA-Z0-9]+/g, '').substr(1, 8);
	//new password salt
	var salt = bcrypt.genSaltSync(10);
	//new hashedPassword based on new salt
	var hashedPassword = bcrypt.hashSync(newPassword, salt);
	var attribute = {};
	attribute.salt = salt;
	attribute.password_hash = hashedPassword;
	
	//send email through sendgrid with generated password
	sendgrid.send({
		to:       body.email,
		from:     'no_reply@syllabus.com',
		subject:  'Temporary password for Syllabus account.',
		text:     'Your temporary password for Syllabus is: ' + newPassword + '. Please reset your password in account settings.'
	}, function (err, json){
		if(err){
			return console.error(err);
		}
		console.log(json);
	});

	//find user by email, then change password.
	db.user.findOne({
		where: {
			email: body.email
		}
	}).then(function (user){
		if (user) {
			user.update(attribute).then(function(user) {
				res.json(user.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	});
});

//Set new user as new admin with user ID
//Must be called by current admin
app.put('/admin/:id', middleware.requireAuthentication, function(req,res){
	var userID = parseInt(req.params.id, 10);
	var admin = Boolean(req.user.get('admin'));
	var attribute = {};
	attribute.admin = Boolean("true");
	//Check if user is admin
	if(admin === true){
		db.user.findById(userID).then(function(user) {
			if (user) {
				user.update(attribute).then(function(user) {
					res.json(user.toJSON());
				}, function(e) {
					res.status(400).json(e);
				});
			} else {
				res.status(404).send();
			}
		});
	}else{
		res.status(400).send();
	}
});

//DISCUSSIOON API ==================
//==================================

//Add new post based on subject ID
app.post('/post/:id/', middleware.requireAuthentication, function(req, res){
	var subjectID = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'title', 'content' , 'userName');
	var attribute = {};
	var d = new Date();

	attribute.subjectID = subjectID;
	attribute.userId = req.user.get('id');
	attribute.userName = req.user.get('userName');
	attribute.title = body.title;
	attribute.content = body.content;
	attribute.commentDate = d.toJSON(); //get current datetime in json

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
	var body = _.pick(req.body, 'content', 'userName', 'subjectID');
	var d = new Date();
	var attribute = {};
	var postAttribute = {};
	attribute.postID = postID;
	attribute.userId = req.user.get('id');
	attribute.userName = req.user.get('userName');
	attribute.content = body.content;
	attribute.subjectID = body.subjectID;
	postAttribute.commentDate = d.toJSON(); //Update post commentDate for sorting

	db.comment.create(attribute).then(function (comment){
		db.post.findOne({
			where: {
				id: postID
			}
		}).then(function (post) {
			if (post) {
				//update post commentDate
				post.update(postAttribute).then(function(post) {
					res.json(post.toJSON());
				}, function(e) {
					res.status(400).json(e);
				});
			} else {
				res.status(404).send();
			}
		});
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

//Get all posts by user ID
app.get('/allUserPost/:id', function(req, res){
	var userID = parseInt(req.params.id, 10);
	db.post.findAll({
		order: [['createdAt', 'DESC']],
		where: {
			userId: userID
		}
	}).then(function(post) {
		res.json(post);
	}, function(e) {
		res.status(500).send();
	});
});

//Get post by subject id
app.get('/allPost/:id/', function(req, res) {
	var subjectID = parseInt(req.params.id, 10);
	db.post.findAll({
		order: [['commentDate', 'DESC']],
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

//Delete a post ans associated comments with POST ID 
app.delete('/post/:id/', middleware.requireAuthentication, function(req, res) {
	var postID = parseInt(req.params.id, 10);
	db.post.destroy({
		where: {
			id: postID,
			userId: req.user.get('id')
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No post with id.'
			});
		} else {
			db.comment.destroy({
				where: {
					postID: postID
				}
			}).then(function() {
				res.status(204).send();
			});
		}
	}, function() {
		res.status(500).send();
	});
});

//Get all comment by user ID
app.get('/allUserComment/:id', function(req, res){
	var userID = parseInt(req.params.id, 10);
	db.comment.findAll({
		order: [['createdAt', 'DESC']],
		where: {
			userId: userID
		}
	}).then(function(post) {
		res.json(post);
	}, function(e) {
		res.status(500).send();
	});
});

//Get comment by post id
app.get('/allComment/:id/', function(req, res) {
	var postID = parseInt(req.params.id, 10);
	db.comment.findAll({
		order: [['createdAt', 'DESC']],
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

//Delete a comment with COMMENT ID
app.delete('/comment/:id/', middleware.requireAuthentication, function(req, res) {
	var commentID = parseInt(req.params.id, 10);
	db.comment.destroy({
		where: {
			id: commentID,
			userId: req.user.get('id')
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No comment with id.'
			});
		} else {
			res.status(204).send();
		}
	}, function() {
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