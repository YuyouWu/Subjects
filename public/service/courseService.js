angular.module('courseService',[])
.factory('Course', function ($http){

	var courses = {};

	//get all courses
	courses.all = function (){
		return $http.get('/courses');
	}

	//get course by ID
	courses.getCourse = function (id){
		return $http.get('/courses/' + id);
	}

	//Create new course
	courses.create = function (courseObject){
		return $http.post('/courses', courseObject);
	}

	return subjects;
});