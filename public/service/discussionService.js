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

		//Create comment by POST ID
		discussion.comment = function(id, body){
			return $http.post('/comment/' + id, body); 
		}

		//Edit comment with COMMENT ID
		discussion.editComment = function(id, body){
			return $http.put('/comment/' + id, body); 
		}

		//Get post with SUBJECT ID
		discussion.getPost = function (id){
			return $http.get('/post/' + id); 
		}

		//Get comment with POST ID
		discussion.getComment = function (id){
			return $http.get('/comment/' + id); 
		}

		return discussion;
	});