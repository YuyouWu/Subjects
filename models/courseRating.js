module.exports = function (sequelize, DataTypes) {
	return sequelize.define('courseRating', {
		
		courseID: {
			type: DataTypes.INTEGER,
			allowNull:false
		},

		courseRating:{
			type: DataTypes.INTEGER
		}
	});
};