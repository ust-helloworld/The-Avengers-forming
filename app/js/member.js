$(document).ready(function(){

	$('#member_page_controller').hide();
	$('#text_event_name').text("Error: Invalid event name ");
	var eventName = getURLParameter("q");
	if (eventName != null && eventName !== '' ) {
		$('#text_event_name').text("Event name: " + eventName);
		$('#member_page_controller').show();
	}
});

angular.module('teamform-member-app', ['firebase'])
.controller('MemberCtrl', ['$scope', '$firebaseObject', '$firebaseArray', function($scope, $firebaseObject, $firebaseArray) {
	// TODO: implementation of MemberCtrl

	// Call Firebase initialization code defined in site.js
	if (firebase.apps.length === 0)
	{
		initalizeFirebase();
	}
	database = firebase.database();
	var refPath = "";
	var eventName = getURLParameter("q");
	refPath = "/event/" + eventName + "/team";
	$scope.team = [];
	$scope.team = $firebaseArray(firebase.database().ref(refPath));

	// Set default member to be the current user
	firebase.auth().onAuthStateChanged(function(user){
		if (user) {
			$scope.userID = user.uid;
			$scope.userName = user.displayName;
			$scope.createFunc();
			$scope.loadFunc();
		} else {
			$scope.userID = "Please log in";
			$scope.userName = "Please log in";
			alert("Please log in");
		}
	});
	$scope.teams = {};
	$scope.refreshReceived = function(){
		$scope.invitationByTeams = [];
		var memberID = $scope.userID;
		console.log($scope.team);
		if ($scope.joinedTeam == ""){
			$scope.team.$loaded().then(function(data){
				$.each($scope.team, function(i,obj){
					if (typeof obj.invitationRequests != "undefined" && obj.invitationRequests.indexOf(memberID) > -1){
						$scope.invitationByTeams.push(obj);
					}
				});
			});
		}
		else{
			$scope.invitationByTeams = [];
		}
	}

	$scope.createFunc = function() {
		var userID = $.trim( $scope.userID );
		var userName = $.trim( $scope.userName );
		if ( userID !== '' && userName !== '' ) {
			var newData = {
				'name': userName,
				'selection': $scope.selection,
				'joinedTeam': $scope.joinedTeam
			};
			var refPath = "/event/"+ getURLParameter("q") + "/member/" + userID;
			var ref = firebase.database().ref(refPath);
			ref.update(newData, function(){
				console.log("Create data")
			});
		}
	}

	$scope.loadFunc = function() {
		var userID = $scope.userID;
		if ( userID !== '' ) {
			var refPath ="/event/"+ getURLParameter("q") + "/member/" + userID;
			retrieveOnceFirebase(firebase, refPath, function(data) {
				if ( data.child("name").val() != null ) {
					$scope.userName = data.child("name").val();
					$scope.refreshReceived();

				} else {
					$scope.userName = "";
				}
				if (data.child("selection").val() != null ) {
					$scope.selection = data.child("selection").val();
				}
				else {
					$scope.selection = [];
				}

				if (data.child("joinedTeam").val() != null){
					$scope.joinedTeam = data.child("joinedTeam").val();
				}
				$scope.$apply();
			});
		}
	}

	$scope.saveFunc = function() {
		var userID = $.trim( $scope.userID );
		var userName = $.trim( $scope.userName );
		if ( userID !== '' && userName !== '' ) {
			var newData = {
				'name': userName,
				'selection': $scope.selection,
				'joinedTeam':$scope.joinedTeam
			};
			$scope.refreshReceived();
			var refPath = "/event/"+ getURLParameter("q") + "/member/" + userID;
			var ref = firebase.database().ref(refPath);
			ref.set(newData, function(){
				// Complete call back
				//alert("data pushed...");

				// Finally, go back to the front-end
				//window.location.href= "index.html";
				console.log("Save data")
			});
		}
	}
	$scope.joinedTeam = "";
	$scope.handleInvitation = function(t){
		var path = "/event/" + eventName + '/team/' + t.$id;

		var list = [];
		retrieveOnceFirebase(firebase, path, function(data) {
			list = data.child("teamMembers").val();
			if (list == null){
				list = [];
			}
			//console.log(list[0]);
			list.push($scope.userID);
			firebase.database().ref(path).update({"teamMembers":list});

			if (data.child("invitationRequests").val() != null){
				list2 = data.child("invitationRequests").val();
				var index = list2.indexOf($scope.userName);
				list2.splice(index, 1);
			}
			firebase.database().ref(path).update({"invitationRequests": list2});
		});
		$scope.joinedTeam = t.$id;
		$scope.invitationByTeams = [];
		$scope.saveFunc();
	}

	$scope.refreshTeams = function() {
		var refPath ="/event/" + getURLParameter("q") + "/team";
		var ref = firebase.database().ref(refPath);
		// Link and sync a firebase object
		$scope.selection = [];
		$scope.toggleSelection = function (item) {
			var idx = $scope.selection.indexOf(item);
			if (idx > -1) {
				$scope.selection.splice(idx, 1);
			}
			else {
				$scope.selection.push(item);
			}
		}
		$scope.teams = $firebaseArray(ref);
		$scope.teams.$loaded()
			.then( function(data) {

			})
			.catch(function(error) {
				// Database connection error handling...
				//console.error("Error:", error);
			});
	}
	$scope.refreshTeams(); // call to refresh teams...
}]);
