angular.module('subjectService',[])
.factory('Subject', function ($http){

	var subjects = {};

	//get all subjects
	subjects.all = function (){
		return $http.get('/subjects');
	}

	//search subject by name
	subjects.search = function (searchKey){
		return $http.get('/subjects?q=' + searchKey);
	}

	//create new subject
	subjects.create = function (subjectName){
		return $http.post('/subjects', subjectName);
	}

	return subjects;
});