angular.module('discussionService', [])
	.factory('Discussion', function($http) {
		var discussion = {};

		//Create post with  SUBJECT ID
		discussion.createPost = function(id, body){
			return $http.post('/post/' + id, body); 
		}

		//Edit post with POST ID
		discussion.editPost = function(id, body){
			return $http.put('/post/' + id, body); 
		}

		//Delete post with POST ID
		discussion.deletePost = function (id){
			return $http.delete('/post/' + id);
		}

		//Create comment by POST ID
		discussion.comment = function(id, body){
			return $http.post('/comment/' + id, body); 
		}

		//Edit comment with COMMENT ID
		discussion.editComment = function(id, body){
			return $http.put('/comment/' + id, body); 
		}

		discussion.deleteComment = function (id){
			return $http.delete('/comment/' + id);
		}

		//Get post with SUBJECT ID
		discussion.getAllPost = function (id){
			return $http.get('/allPost/' + id); 
		}

		//Get comment with POST ID
		discussion.getAllComment = function (id){
			return $http.get('/allComment/' + id); 
		}

		//Get post with POST ID
		discussion.getPost = function (id){
			return $http.get('/post/' + id); 
		}

		//Get comment with COMMENT ID
		discussion.getComment = function (id){
			return $http.get('/comment/' + id); 
		}

		//Get all user's posts with user ID
		discussion.userPost = function (id){
			return $http.get('/allUserPost/' + id);
		}

		//Get all user's comments with user ID
		discussion.userComment = function (id){
			return $http.get('/allUserComment/' + id);
		}

		return discussion;
	});