angular.module('teamform-event-app', ['firebase'])
.controller('displayCtrl', ['$scope', '$firebaseObject', '$firebaseArray', function($scope, $firebaseObject, $firebaseArray) {
	// TODO: implementation of AdminCtrl

	// Initialize $scope.param as an empty JSON object
	$scope.param = {};

	// Call Firebase initialization code defined in site.js
	if (firebase.apps.length === 0)
	{
	  initalizeFirebase();
	}


	var refPath, ref, eventName;

	eventName = getURLParameter("q");
	$scope.eventName = eventName;
	refPath = "event/" + eventName + "/admin/param";
	ref = firebase.database().ref(refPath);

	// Link and sync a firebase object

	$scope.param = $firebaseObject(ref);
	$scope.param.$loaded()
		.then( function(data) {
			// Fill in some initial values when the DB entry doesn't exist
			if (typeof $scope.param.owner != "undefined")
			{
			  if ( $scope.param.owner != firebase.auth().currentUser.uid)
			  {
		        console.log("You are not admin!!! View only");
			  }
			}
			
			refPath = "/user/"+$scope.param.owner;
			profile = $firebaseObject(firebase.database().ref(refPath));
			profile.$loaded().then(function (data){
				$scope.ownerDisplayName = profile.name;
			});
			
		})
		.catch(function(error) {
			// Database connection error handling...
			//console.error("Error:", error);
		});
	

	refPath = "event/" + eventName + "/team";
	$scope.team = [];
	$scope.team = $firebaseArray(firebase.database().ref(refPath));


	refPath = "event/" + eventName + "/member/";
	$scope.member = [];
	$scope.member = $firebaseArray(firebase.database().ref(refPath));
	
	firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		// User is signed in.
		refPath = "event/" + eventName + "/member/" + user.uid;
		memberDetail = $firebaseObject(firebase.database().ref(refPath));
		memberDetail.$loaded().then(function (data){
		$.each(memberDetail.selection, function (index, teamSelection){
			console.log(teamSelection);
			$("#button-"+teamSelection).text ("Cancel request");
			//still have some problems (the tag cannot be change to cancel request =v="")
		});
	});
	  } else {
		// No user is signed in.
	  }
	});
	
	
	//still might not tested.
	$scope.sendRequest = function (targetTeam){
		console.log(targetTeam);
		refPath = "event/" + eventName + "/member/" + firebase.auth().currentUser.uid;
		var memberDetail = $firebaseObject(firebase.database().ref(refPath));
		memberDetail.$loaded().then(function (data){
			if (typeof memberDetail.selection == "undefined")
			{
				memberDetail.selection = [];
			}
			if ($.inArray(targetTeam,memberDetail.selection)==-1){
			memberDetail.selection.push(targetTeam);
			//console.log(memberDetail.selection);
			memberDetail.$save();
			$("#button-"+targetTeam).text ("Cancel request");
			}
			else {
				alert("You have sent this!!!");
				memberDetail.selection = $.grep(memberDetail.selection, function(delData){
					return delData != targetTeam;
				});
				memberDetail.$save();
				$("#button-"+targetTeam).text ("Request");
			}
		});
	}
	
}]);
