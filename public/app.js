angular.module('syllabus',['subjectService'])
.controller('mainController', function (Subject){ //factory name

	var vm = this;

	//object to store all subjects
	vm.subjectData = {};

	vm.searchSubject = function (){
		console.log("Searching Subject.");
	}

	//pass all subjects to var 
	Subject.all().success(function (data){
		vm.subjectData = data;
	});
});