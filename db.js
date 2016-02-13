var Sequalize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

//Use postgres for heroku and sqlite for local
if (env === 'production') {
	sequelize = new Sequalize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
	sequelize = new Sequalize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/dev-subjects-api.sqlite'
	});
}

var db = {};

//Importing models
db.subject = sequelize.import(__dirname + '/models/subject.js');
db.subjectReq = sequelize.import(__dirname + '/models/subjectReq.js');
db.course = sequelize.import(__dirname + '/models/course.js');
db.courseRating = sequelize.import(__dirname + '/models/courseRating.js');
db.post = sequelize.import(__dirname + '/models/post.js');
db.comment = sequelize.import(__dirname + '/models/comment.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.token = sequelize.import(__dirname + '/models/token.js');
db.sequelize = sequelize;
db.Sequalize = Sequalize;

//Associations

//courses
db.subject.hasMany(db.course);
//subject request
db.user.hasMany(db.subjectReq);
//courseRating
db.user.hasMany(db.courseRating);
db.courseRating.belongsTo(db.user);
//posts
db.user.hasMany(db.post);
db.post.belongsTo(db.user);
//comment 
db.user.hasMany(db.comment);
db.comment.belongsTo(db.user);

module.exports = db;