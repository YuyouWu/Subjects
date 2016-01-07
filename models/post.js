module.exports = function (sequelize, DataTypes) {
	return sequelize.define('post', {
		
		title: {
			type: DataTypes.STRING,
			allowNull:false,
			validate:{
				notEmpty: true
			}
		},

		content:{
			type: DataTypes.STRING,
			allowNull:false,
			validate:{
				notEmpty: true
			}
		},

		subjectID:{
			type: DataTypes.INTEGER,
			allowNull:false
		}
	});
};