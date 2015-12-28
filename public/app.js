angular.module('syllabus',['subjectService' , 'userService', 'authService'])

//Using config to add Authinterceptor to $httpProvider
.config(function ($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptor');
})

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

.controller('userController', function (Subject, User, Auth, AuthToken, AuthInterceptor){
	var vm = this;

	vm.userData = {};
	vm.userData.email = "";
	vm.userData.password = "";
	vm.userData.confirmPassword = "";

	//Create new user
	vm.createUser = function (){
		if(vm.userData.password === vm.userData.confirmPassword){
			User.create(vm.userData).success(function (data){
				console.log(data);
			});
		} else {
			console.log("Not matching password.");
		}
	}

	vm.loginUser = function (){
		Auth.login(vm.userData.email, vm.userData.password).success(function (data){
			console.log("logged in");
		});
	}
});