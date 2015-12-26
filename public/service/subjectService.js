angular.module('subjectService',[])
.factory('Subject', function ($http){

	var subjects = {};

	subjects.all = function (){
		return $http.get('/subjects');
	}

	return subjects;
});