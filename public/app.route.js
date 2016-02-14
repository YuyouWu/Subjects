angular.module('appRouter', ['ngRoute'])
	.config(function($httpProvider, $routeProvider, $locationProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
		$routeProvider
			.when('/', {
				templateUrl: '/views/home.html',
				controller: 'subjectController',
				controllerAs: 'main'
			}).when('/newSubject', {
				templateUrl: '/views/newSubject.html',
				controller: 'subjectController',
				controllerAs: 'main'
			}).when('/subject/:id', {
				templateUrl: '/views/subject.html',
				controller: 'courseController',
				controllerAs: 'main'
			}).when('/subject/:id/:tab', {
				templateUrl: '/views/subject.html'
			}).when('/discussion/:id/:postID', {
				templateUrl: '/views/post.html',
				controller: 'discussionController',
				controllerAs: 'main'
			}).when('/profile/:userID', {
				templateUrl: '/views/profile.html',
				controller: 'profileController',
				controllerAs: 'main'
			}).when('/profile/:userID/:tab', {
				templateUrl: '/views/profile.html'
			}).when('/setting/', {
				templateUrl: '/views/setting.html',
				controller: 'userController',
				controllerAs: 'main'
			}).when('/forgotPassword/', {
				templateUrl: '/views/forgotPassword.html'
			}).when('/help/:helpTab', {
				templateUrl: '/views/help.html'
			}).when('/about/:aboutTab', {
				templateUrl: '/views/about.html'
			}).when('/404', {
				templateUrl: '/views/404.html'
			}).otherwise({ redirectTo: '/404' });

		$locationProvider.html5Mode(true);
	})