angular.module('courseService', [])
	.factory('Course', function($http) {

		var courses = {};

		//get all courses
		courses.all = function() {
			return $http.get('/courses');
		}

		//get course by ID
		courses.getCourse = function(id) {
			return $http.get('/courses/' + id);
		}

		//get course by subjectID
		courses.getSubCourse = function(id) {
			return $http.get('/courses/sub/' + id);
		}

		//get Beginner courses by subjectID
		courses.bCourse = function(id) {
			return $http.get('/courses/b/' + id);
		}

		//get Intermediate courses by subjectID
		courses.iCourse = function(id) {
			return $http.get('/courses/i/' + id);
		}

		//get Advance courses by subjectID
		courses.aCourse = function(id) {
			return $http.get('/courses/a/' + id);
		}

		//Create new course
		courses.create = function(courseObject) {
			return $http.post('/courses', courseObject);
		}

		return courses;
	});