angular.module('userService',[])
.factory('User', function ($http){

	var users = {};

	users.create = function (userData){
		return $http.post('/users', userData);
	}
	
	users.login = function (){
		return $http.post('/users/login');
	}

	users.getCurrentUser = function (){
		return $http.get('/currentUser/');
	}

	users.get = function (id){
		return $http.get('/users/' + id);
	}

	users.checkUserName = function (userName){
		return $http.get('/userNameCheck/' + userName);
	}

	users.checkEmail = function (email){
		return $http.get('/emailCheck/' + email);
	}

	return users;
});