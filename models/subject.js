module.exports = function (sequelize, DataTypes) {
	return sequelize.define('subject', {
		
		subjectName: {
			type: DataTypes.STRING,
			allowNull:false,
			unique: true, 
			validate:{
				notEmpty: true
			}
		},
		category: {
			type: DataTypes.STRING,
			allowNull:false
		}
	});
};