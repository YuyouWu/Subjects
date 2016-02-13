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
.controller('userController', function(Subject, User, Auth, $window, $scope) {
	var vm = this;

	vm.userData = {};
	vm.userData.email = "";
	vm.userData.userName = "";
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

	//Get info for current user
	if (Auth.isLoggedIn()) {
		//get current user data
		vm.currentUser = {};
		vm.tempData = {};
		User.getCurrentUser().success(function (user){
			vm.currentUser = user;

			//temp data for changing password
			vm.tempData.email = vm.currentUser.email;
			vm.tempData.password = "";
			vm.tempData.newPassword = "";
			vm.tempData.confirmNewPassword = "";
		});
	} 

	//closing alert
	vm.closeAlert = function(index) {
		vm.alerts.splice(index, 1);
	};

	//Create new user
	vm.createUser = function() {
		//Declare and clear alert array
		vm.alerts = [];

		//Check user input
		function checkUser(userData) {
			var continueRegister = true;
			return new Promise(function (resolve,reject){
				//Check passwords match
				if (vm.userData.password !== vm.userData.confirmPassword) {
					continueRegister = false;
					vm.alerts.push({type: 'danger', msg: 'Passwords are not matching.'});
				}
				
				//Check passwords length
				if (vm.userData.password.length < 7){
					console.log(vm.userData.password.length);
					continueRegister = false;
					vm.alerts.push({type: 'danger', msg: 'Password must have at least 7 characters.'});
				}

				//Check email
				User.checkEmail(vm.userData.email).success(function(emailData){
					if (vm.userData.email === emailData.email){
						continueRegister = false;
						vm.alerts.push({type: 'danger', msg: 'This email is already registered.'});
					}
				}).then(function (){
					//Check userName
					User.checkUserName(vm.userData.userName).success(function(userNamedata){
						if (vm.userData.userName === userNamedata.userName){
							continueRegister = false;
							vm.alerts.push({type: 'danger', msg: 'Username is taken.'});
						}
						//resolve after checking all input
						resolve(continueRegister);
					});
				});
			});
		}

		checkUser().then(function (data){
			if (data === true){
				User.create(vm.userData).success(function(data) {
					//Clear userData
					vm.userData.email = "";
					vm.userData.password = "";
					vm.userData.confirmPassword = "";
					//Display alert hide modal
					vm.alerts = [];
					vm.alerts.push({type: 'success', msg: 'Registration is successful. Page will refresh shortly.'});
					setTimeout(function () {
						$('#signupModal').modal('hide');
						$window.location.reload();
					}, 5000);
				});
			}
		});
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
			$window.location.reload();
		}).error (function(data){
			vm.alerts = [];
			vm.alerts.push({type: 'danger', msg: 'Username or password incorrect.'});
		});
	}

	//Logout user
	vm.logoutUser = function() {
		Auth.logout().success(function(data) {
			$window.location.reload();
		});
	}
	
	//Change user password
	vm.editPassword = function(){
		vm.alerts = [];
		if (vm.tempData.newPassword === vm.tempData.confirmNewPassword && vm.tempData.password !== vm.tempData.newPassword){
			User.editPassword(vm.tempData).success(function(data){
				console.log("Password Changed");
				vm.alerts = [];
				vm.alerts.push({type: 'success', msg: 'Password changed. Page will refresh shortly.'});
				setTimeout(function () {
					$('#changePassword').modal('hide');
					$window.location.reload();
				}, 5000);
			});
		}
		if (vm.tempData.newPassword !== vm.tempData.confirmNewPassword){
			vm.alerts.push({type: 'danger', msg: 'New passwords are not matching.'});
		}
		if (vm.tempData.password === vm.tempData.newPassword){
			vm.alerts.push({type: 'danger', msg: 'New password and current password are the same.'});
		}
	}

	vm.tempUserData = {};
	vm.forgotPassword = function(){
		vm.alerts = [];
		User.forgotPassword(vm.tempUserData).success(function(data){
			vm.alerts.push({type: 'success', msg: 'Temporary password has been sent.'});
		}).error(function(data){
			vm.alerts.push({type: 'danger', msg: 'No user found with this email address.'});
		});
	}
})

.controller('courseController', function($routeParams, Subject, Course, Auth) {
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
		if (Auth.isLoggedIn()) {
			vm.beginnerCourses.forEach(function (course){
				Course.getUserRating(course.id).success(function (rating){
					//console.log(rating);
					if(rating.length>0){
						course.tempRating = rating[0].courseRating;
					}
				});
			});
		}
	});
	//Intermediate
	Course.iCourse(vm.subjectID).success(function(data) {
		vm.intermediateCourses = data;
		if (Auth.isLoggedIn()) {
			vm.intermediateCourses.forEach(function (course){
				Course.getUserRating(course.id).success(function (rating){
					//console.log(rating);
					if(rating.length>0){
						course.tempRating = rating[0].courseRating;
					}
				});
			});
		}
	});
	//Advance
	Course.aCourse(vm.subjectID).success(function(data) {
		vm.advanceCourses = data;
		if (Auth.isLoggedIn()) {
			vm.advanceCourses.forEach(function (course){
				Course.getUserRating(course.id).success(function (rating){
					//console.log(rating);
					if(rating.length>0){
						course.tempRating = rating[0].courseRating;
					}
				});
			});
		}
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

.controller('discussionController', function($routeParams, $window, Discussion, Subject, User, Auth) {
	var vm = this;
	vm.currentPage = 1;
	//number of post for each page
	vm.pageSize = 10;
	vm.posts = [];
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
	if (Auth.isLoggedIn()) {
		vm.currentUser = {};
		User.getCurrentUser().success(function (user){
			vm.currentUser = user;
		});
	}

	//Create new post
	vm.newPost = {};
	vm.createPost = function(){
		Discussion.createPost(vm.subjectID, vm.newPost).success(function (data){
			$('#newPostModal').modal('hide');
			$window.location.reload();
		});
	}

	//Create new comment
	vm.newComment = {};
	vm.newComment.subjectID = $routeParams.id;
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
			$('#editPostModal').modal('hide');
			$window.location.reload();
		});
	}

	//Delete comment 
	vm.deleteComment = function(id){
		Discussion.deleteComment(id).success(function (data){
			$('#deleteCommentModal').modal('hide');
			$window.location.reload();
		});
	}

	//Edit Comment
	vm.editedComment = {}; 
	vm.editComment = function (id){
		Discussion.editComment(id, vm.editedComment).success(function (data){
			$('#editCommentModal').modal('hide');
			$window.location.reload();
		});
	}
})

.filter('startFrom', function(){
	return function(data, start){
		return data.slice(start);
	}
})

.controller('profileController' , function($routeParams, User, Discussion, Course){
	var vm = this;
	if($routeParams.userID){
		vm.userID = $routeParams.userID
		User.get(vm.userID).success(function (data){
			vm.userData = data;
		});
	}

	//get all post from user id
	vm.allUserPosts = {};
	Discussion.userPost($routeParams.userID).success(function (data){
		vm.allUserPosts = data;
	});
	//get all comment from user id
	vm.allUserComments = {};
	Discussion.userComment($routeParams.userID).success(function (data){
		vm.allUserComments = data;
		vm.allUserComments.forEach(function (comment){
			Discussion.getPost(comment.postID).success(function (post){
				comment.postTitle = post.title;
			});
		});
	});

	vm.ratedCoursesObject = {};
	Course.ratedCourses($routeParams.userID).success(function (data){
		vm.ratedCoursesObject = data;
		vm.ratedCoursesObject.forEach(function (course){
			Course.getCourse(course.courseID).success(function (data){
				course.courseName = data.courseName;
				course.avgRating = data.courseRating;
				course.courseLink = data.courseLink;
			});
		});
	});

	vm.userRating = {};
	vm.rateClick = function(courseID, rating){
		console.log("courseID: " + courseID + " Value: "+ rating);
		vm.userRating.courseID = courseID;
		vm.userRating.courseRating = rating;
		console.log(vm.userRating);
		Course.rate(courseID, vm.userRating);
	}
})

.controller('navController', function($routeParams, User) {
	var vm = this;
	//Get id param
	//Subject
	if ($routeParams.id) {
		vm.subjectID = $routeParams.id;
		//Get tab param
		if ($routeParams.tab === "discussion"){
			vm.activeTab = "Discussion"
		} else {
			vm.activeTab = "Courses";
		}
	}
	//Profile
	if ($routeParams.userID) {
		vm.userID = $routeParams.userID;

		User.get(vm.userID).success(function (data){
			vm.userData = data;
		});
		//Get tab param
		if ($routeParams.tab === "posts"){
			vm.activeTab = "posts";
		} else if ($routeParams.tab === "comments"){
			vm.activeTab = "comments";
		} else if ($routeParams.tab === "courses"){
			vm.activeTab = "courses";
		} else {
			vm.activeTab = "courses";
		}
	}
	//Help
	if ($routeParams.helpTab) {
		if ($routeParams.helpTab === "faq"){
			vm.activeTab = "faq";
		} else if ($routeParams.helpTab === "contact"){
			vm.activeTab = "contact";
		} else {
			vm.activeTab = "faq";
		}
	}
	//About
	if ($routeParams.aboutTab) {
		if ($routeParams.aboutTab === "about"){
			vm.activeTab = "about";
		} else if ($routeParams.aboutTab === "terms"){
			vm.activeTab = "terms";
		} else if ($routeParams.aboutTab === "privacy"){
			vm.activeTab = "privacy";
		} else {
			vm.activeTab = "about";
		}
	}
});