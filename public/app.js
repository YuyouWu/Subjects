angular.module('syllabus',['subjectService' , 'userService', 'authService','ngRoute'])

//Using config to add Authinterceptor to $httpProvider
.config(function ($httpProvider, $routeProvider, $locationProvider){
	$httpProvider.interceptors.push('AuthInterceptor');
	$routeProvider
		.when('/',{
			templateUrl: '/home.html',
			controller  : 'subjectController',
            controllerAs: 'main'
		}).when('/newSubject',{
			templateUrl: '/newSubject.html',
			controller  : 'subjectController',
            controllerAs: 'main'
		});
	$locationProvider.html5Mode(true);
})

//Display subject on index.html
//Execute query for searching subject name
.controller('subjectController', function (Subject, User, Auth, AuthToken, AuthInterceptor, $window){ 

	var vm = this;

	//object to store all subjects
	vm.subjectData = {};

	//Display all subject at index page
	Subject.all().success(function (data){
		vm.subjectData = data;
	});

	//Search for subject by name at index page
	vm.searchKey = "";
	vm.searchSubject = function (){
		Subject.search(vm.searchKey).success(function (data){
			vm.subjectData = data;
		});
	}

	//request new subject
	vm.newSubject = {};
	vm.newSubject.subjectNameReq = "";
	vm.newSubject.message = "";
	vm.requestSubject = function (){
		console.log(vm.newSubject.subjectNameReq);
		Subject.create(vm.newSubject).success(function (data){
			console.log(data);
			vm.newSubject.message = "New subject request has been submitted. "
		}).error (function (e){
			console.log(e);
			vm.newSubject.message = "Error. Check if your subject name is the same with any existing subjects."
		});
	}
})

//Check if a user is logged in
//Create new user
//Login/Logout user
.controller('userController', function (Subject, User, Auth, AuthToken, AuthInterceptor){
	var vm = this;

	vm.userData = {};
	vm.userData.email = "";
	vm.userData.password = "";
	vm.userData.confirmPassword = "";

	//Check if logged in or not
	vm.isLoggedIn = function (){
		if (Auth.isLoggedIn()){
			return true;
		}else{
			return false;
		}
	}

	//Create new user
	vm.createUser = function (){
		if(vm.userData.password === vm.userData.confirmPassword){
			User.create(vm.userData).success(function (data){
				//Clear userData
				vm.userData.email = "";
				vm.userData.password = "";
				vm.userData.confirmPassword = "";
				//hide modal
				$('#signupModal').modal('hide');
			});
		} else {
			console.log("Not matching password.");
		}
	}

	//Login user
	vm.loginUser = function (){
		Auth.login(vm.userData.email, vm.userData.password).success(function (data){
			//Clear userData
			vm.userData.email = "";
			vm.userData.password = "";
			vm.userData.confirmPassword = "";
			//hide modal
			$('#loginModal').modal('hide');
		});
	}

	//Logout user
	vm.logoutUser = function (){
		Auth.logout().success(function (data){
			
		});
	}
})

.controller('courseController', function (){

});