'use strict';

var app = angular.module('app', []);

app.config(function($routeProvider) {

  $routeProvider.
  when('/', {
    controller: 'settingsController',
    templateUrl: 'view/settings.html'
  }).
  when('/play', {
    controller: 'playRoomController',
    templateUrl: 'view/playRoom.html'
  });
});