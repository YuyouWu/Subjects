module.exports = function (sequelize, DataTypes) {
	return sequelize.define('subjectReq', {
		
		subjectNameReq: {
			type: DataTypes.STRING,
			allowNull:false,
			validate:{
				notEmpty: true
			}
		}
		//Add categories for courses
	});
};