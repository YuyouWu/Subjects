angular.module('syllabus',['subjectService' , 'userService', 'authService'])

//Using config to add Authinterceptor to $httpProvider
.config(function ($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptor');
})

//Display subject on index.html
//Execute query for searching subject name
.controller('subjectController', function (Subject, User, Auth, AuthToken, AuthInterceptor){ 

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
				$('#signupModal').modal('hide');
			});
		} else {
			console.log("Not matching password.");
		}
	}

	//Login user
	vm.loginUser = function (){
		Auth.login(vm.userData.email, vm.userData.password).success(function (data){
			console.log("logged in");
			$('#loginModal').modal('hide');
		});
	}

	//Logout user
	vm.logoutUser = function (){
		Auth.logout().success(function (data){
			console.log("Logged out");
		});
		vm.userData.loggedIn = Auth.isLoggedIn();
		vm.userData.loggedOut = !vm.userData.loggedIn;
	}
});