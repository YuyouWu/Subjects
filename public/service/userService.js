angular.module('userService',[])
.factory('User', function ($http){

	var users = {};

	users.create = function (userData){
		return $http.post('/users', userData);
	}
	
	users.login = function (){
		return $http.post('/users/login');
	}

	users.get = function (id){
		return $http.get('/users/' + id);
	}

	return users;
});