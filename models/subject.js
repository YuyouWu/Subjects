module.exports = function (sequelize, DataTypes) {
	return sequelize.define('subject', {
		
		subjectName: {
			type: DataTypes.STRING,
			allowNull:false,
			validate:{
				notEmpty: true
			}
		}
		//Add categories for courses
	});
};