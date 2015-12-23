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

var db ={};

//Importing models
db.subject = sequelize.import(__dirname + '/models/subject.js');
db.course = sequelize.import(__dirname + '/models/course.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.sequelize = sequelize;
db.Sequalize = Sequalize;

//Associations
db.subject.hasMany(db.course);
db.course.belongsTo(db.user);
db.course.belongsTo(db.subject);
db.user.hasMany(db.course);

module.exports = db;