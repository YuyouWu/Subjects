angular.module('syllabus', ['subjectService', 'courseService', 'discussionService', 'userService', 'authService', 'appRouter', 'ui.bootstrap'])

//Display subject on index.html
//Execute query for searching subject name
.controller('subjectController', function(Subject, $window, $location, $routeParams) {

	var vm = this;

	//object to store all subjects
	vm.subjectData = {};

	//Display all subject at index page
	Subject.all().success(function(data) {
		vm.subjectData = data;
	});

	//Search for subject by name at index page
	vm.searchKey = "";
	vm.searchSubject = function() {
		Subject.search(vm.searchKey).success(function(data) {
			vm.subjectData = data;
		});
	}

	//request new subject
	vm.newSubject = {};
	vm.newSubject.subjectNameReq = "";
	vm.newSubject.message = "";
	vm.requestSubject = function() {
		console.log(vm.newSubject.subjectNameReq);
		Subject.create(vm.newSubject).success(function(data) {
			console.log(data);
			vm.newSubject.message = "New subject request has been submitted. "
		}).error(function(e) {
			console.log(e);
			vm.newSubject.message = "Error. Check if your subject name is the same with any existing subjects."
		});
	}

	//Get subject by ID
	vm.currentSubject = {};
	vm.getSubject = function(subjectID) {
		Subject.getSubject(subjectID).success(function(data) {
			vm.currentSubject = data;
			console.log(vm.currentSubject);
			//$location.path('/subject/' + data.id);
			//$window.location.href = '/subject/' + data.id;
		});
	}
})

//Check if a user is logged in
//Create new user
//Login/Logout user
.controller('userController', function(Subject, User, Auth) {
	var vm = this;

	vm.userData = {};
	vm.userData.email = "";
	vm.userData.password = "";
	vm.userData.confirmPassword = "";

	//Check if logged in or not
	vm.isLoggedIn = function() {
		if (Auth.isLoggedIn()) {
			return true;
		} else {
			return false;
		}
	}

	//Create new user
	vm.createUser = function() {
		if (vm.userData.password === vm.userData.confirmPassword) {
			User.create(vm.userData).success(function(data) {
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
	vm.loginUser = function() {
		Auth.login(vm.userData.email, vm.userData.password).success(function(data) {
			//Clear userData
			vm.userData.email = "";
			vm.userData.password = "";
			vm.userData.confirmPassword = "";
			//hide modal
			$('#loginModal').modal('hide');
		});
	}

	//Logout user
	vm.logoutUser = function() {
		Auth.logout().success(function(data) {
		});
	}
})

.controller('courseController', function($routeParams, Subject, Course) {
	var vm = this;
	
	//Reset subject after navigating 
	vm.currentSubject = {};
	if ($routeParams.id) {
		vm.subjectID = $routeParams.id;
		Subject.getSubject(vm.subjectID).success(function(data) {
			vm.currentSubject = data;
		});
	}

	//Get courses by subjectID and defficulty
	var allCourses = [];
	vm.beginnerCourses = [];
	vm.intermediateCourses = [];
	vm.advanceCourses = [];

	//Course Ratings
	vm.userRating;
	vm.maxRating = 5;
	vm.isReadonly = false;
	vm.userRating = {};
	vm.hover = function(value){
		vm.overStar = value;
	}
	vm.ratingStates = [
	{stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'}
	];

	//get all courses by subject ID
	//then assign average rating to each course
	Course.getSubCourse(vm.subjectID).success(function(data){
		allCourses = data;
		vm.sum = 0;
		//for every object in courses
		allCourses.forEach(function (course){
			//Get all ratings from that course
			Course.getRating(course.id).success(function(data){
				if(data.length > 0){
					vm.ratingObjects = data;
					vm.ratingObjects.forEach(function (rating){
						vm.sum += rating.courseRating;
					});
					//calculate average rating and store average rating
					vm.avgRating = {};
					vm.avgRating.courseRating = vm.sum/vm.ratingObjects.length;
					Course.put(course.id, vm.avgRating);
					//reset sum 
					vm.sum = 0;
				}
				//Post individual user rating
				vm.rateClick = function(courseID, rating){
					console.log("courseID: " + courseID + " Value: "+ rating);
					vm.userRating.courseID = courseID;
					vm.userRating.courseRating = rating;
					console.log(vm.userRating);
					Course.rate(courseID, vm.userRating);
				}
			});
		});
	});

	//Beginner
	Course.bCourse(vm.subjectID).success(function(data) {
		vm.beginnerCourses = data;
		//Get userRating
		vm.beginnerCourses.forEach(function (course){
			Course.getUserRating(course.id).success(function (rating){
					//console.log(rating);
					if(rating.length>0){
						course.tempRating = rating[0].courseRating;
					}
				});
		});
	});
	//Intermediate
	Course.iCourse(vm.subjectID).success(function(data) {
		vm.intermediateCourses = data;
		vm.intermediateCourses.forEach(function (course){
			Course.getUserRating(course.id).success(function (rating){
					//console.log(rating);
					if(rating.length>0){
						course.tempRating = rating[0].courseRating;
					}
				});
		});
	});
	//Advance
	Course.aCourse(vm.subjectID).success(function(data) {
		vm.advanceCourses = data;
		vm.advanceCourses.forEach(function (course){
			Course.getUserRating(course.id).success(function (rating){
					//console.log(rating);
					if(rating.length>0){
						course.tempRating = rating[0].courseRating;
					}
				});
		});
	});

	//Create new course
	vm.newCourse = {};
	vm.newCourse.subjectId = vm.subjectID;
	vm.createNewCourse = function() {
		Course.create(vm.newCourse).success(function(data) {
			console.log(data);
			$('#newCourseModal').modal('hide');
		}).error(function(e) {
			console.log(e);
		});
	}
})

.controller('discussionController', function($routeParams, $window, Discussion, Subject, User) {
	var vm = this;
	vm.posts = {};
	//Get id param
	if ($routeParams.id) {
		vm.subjectID = $routeParams.id;
		//Get post for current subject
		Subject.getSubject(vm.subjectID).success(function(data) {
			vm.currentSubject = data;
		});
		Discussion.getAllPost(vm.subjectID).success(function (data){
			vm.posts = data;
			//console.log(data);
		});
	}

	if ($routeParams.postID) {
		vm.postID = $routeParams.postID;
		//Get comments with post ID
		Discussion.getPost(vm.postID).success(function (data){
			vm.currentPost = data;
		});
		Discussion.getAllComment(vm.postID).success(function (data){
			vm.comments = data;
			//console.log(data);
		});
	}

	//get current user data
	vm.currentUser = {};
	User.getCurrentUser().success(function (user){
		vm.currentUser = user;
		console.log(user);
	});

	//Create new post
	vm.newPost = {};
	vm.createPost = function(){
		Discussion.createPost(vm.subjectID, vm.newPost).success(function (data){
			console.log(data);
			$('#newPostModal').modal('hide');
			$window.location.reload();
		});
	}

	//Create new comment
	vm.newComment = {};
	vm.comment = function(){
		Discussion.comment(vm.postID,vm.newComment).success(function (data){
			//console.log(data);
			$window.location.reload();
		});
	}

	//Delete post 
	vm.deletePost = function(id){
		Discussion.deletePost(id).success(function (data){
			$('#deletePostModal').modal('hide');
			//$window.history.back();
		});
	}

	//vm.editedPost = {};
	vm.editPost = function (id){
		Discussion.editPost(id, vm.currentPost).success(function (data){
			console.log(vm.currentPost);
			$('#editPostModal').modal('hide');
			$window.location.reload();
		});
	}
})

.controller('navController', function($routeParams) {
	var vm = this;
	//Get id param
	if ($routeParams.id) {
		vm.subjectID = $routeParams.id;
	}
	//Get tab param
	if ($routeParams.tab === "discussion"){
		vm.activeTab = "Discussion"
	} else {
		vm.activeTab = "Courses";
	}
})
;