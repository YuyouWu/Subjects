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
			});

		$locationProvider.html5Mode(true);
	})