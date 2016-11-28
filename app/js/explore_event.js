angular.module('teamform-exploreEvent-app', ['firebase'])
.controller('exploreEventCtrl', ['$scope', '$firebaseObject', '$firebaseArray', function($scope, $firebaseObject, $firebaseArray) {

	// Call Firebase initialization code defined in site.js
	if (firebase.apps.length === 0)
	{
		initalizeFirebase();
	}

	// Check is there any current user
	checkUser(firebase);

	var refPath;

	refPath = "event";
	$scope.events = [];
	$scope.events = $firebaseArray(firebase.database().ref(refPath));

}]);
