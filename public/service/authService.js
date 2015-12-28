angular.module('authService',[])
.factory('Auth', function ($http, $q, $location, AuthToken){
	var authFactory = {};

	authFactory.login = function (email, password){
		
		//login
		return $http.post('/users/login', {
			email: email,
			password: password
		}).success(function (token){
			AuthToken.setToken(token);
			return token;
		});
	}

	authFactory.logout = function (){
		return $http.delete('/users/login').success(function (data){
			AuthToken.setToken();
			console.log("User logged out.")
		});
	}

	authFactory.isLoggedIn = function () {
		if (AuthToken.getToken()){
			return true;
		} else {
			return false;
		}
	}

	return authFactory;
})

//inject $window to store token client-side
.factory('AuthToken', function ($window){
	var authTokenFactory = {};

	//Get token from local storage
	authTokenFactory.getToken = function (){
		return $window.localStorage.getItem('token');
	}

	//Set token or clear token
	//if a token is passed, set the token
	//if there is no token, clear it from local storage
	authTokenFactory.setToken = function (token){
		if (token){
			$window.localStorage.setItem('token', token);
		}else{
			$window.localStorage.removeItem('token');
		}
	}

	return authTokenFactory;
})

.factory('AuthInterceptor', function ($q, $location, AuthToken){
	var interceptorFactory = {};

	//this will happen on all HTTP requests
	interceptorFactory.request = function (config){
		var token = AuthToken.getToken();
		//if token exist, set it to Auth header
		if (token){
			config.headers['Auth'] = token;
		}
		return config;
	}

	interceptorFactory.responseError = function (res) {
		if (res.status === 403) {
			AuthToken.setToken();
			$location.path('/');
		}
	return $q.reject(res);
	}
	return interceptorFactory;
});