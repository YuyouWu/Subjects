angular.module('appRouter', ['ngRoute'])
	.config(function($httpProvider, $routeProvider, $locationProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
		$routeProvider
			.when('/', {
				templateUrl: '/home.html',
				controller: 'subjectController',
				controllerAs: 'main'
			}).when('/newSubject', {
				templateUrl: '/newSubject.html',
				controller: 'subjectController',
				controllerAs: 'main'
			}).when('/subject/:id', {
				templateUrl: '/subject.html',
				controller: 'courseController',
				controllerAs: 'main'
			}).when('/subject/:id/:tab', {
				templateUrl: '/subject.html'
			}).when('/discussion/:id/:postID', {
				templateUrl: '/post.html',
				controller: 'discussionController',
				controllerAs: 'main'
			}).when('/profile/:userID', {
				templateUrl: '/profile.html',
				controller: 'profileController',
				controllerAs: 'main'
			}).when('/profile/:userID/:tab', {
				templateUrl: '/profile.html'
			}).when('/setting/', {
				templateUrl: '/setting.html',
				controller: 'userController',
				controllerAs: 'main'
			}).when('/forgotPassword/', {
				templateUrl: '/forgotPassword.html'
			}).when('/help/:helpTab', {
				templateUrl: '/help.html'
			}).when('/about/:aboutTab', {
				templateUrl: '/about.html'
			});

		$locationProvider.html5Mode(true);
	})