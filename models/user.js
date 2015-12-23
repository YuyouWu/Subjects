var _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
	var user = sequelize.define('user', {
		
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true, 
			validate: {
				isEmail: true
			}
		},
		
		password: {
			type: DataTypes.VIRTUAL, //VIRTUAL data is not stored in db
			allowNull: false,
			validate: {
				len: [7,100]
			}
		}
	});

	return user;
};