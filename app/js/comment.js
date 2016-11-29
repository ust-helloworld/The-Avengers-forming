$(document).ready(function(){
	//$('#comment_page_controller').hide();
	$('#text_event_name').text("Error: Invalid event name ");
	var eventName = getURLParameter("q");
	var teamName = getURLParameter("team");
	if (eventName != null && eventName !== '' && teamName != null && teamName !== '') {
		$('#text_event_name').text("Thanks for joining " + eventName);
		$('#text_team_name').text("Your team is " + teamName);
	}
});

angular.module('teamform-comment-app', ['firebase'])
.controller('CommentCtrl', ['$scope', '$firebaseObject', '$firebaseArray', function($scope, $firebaseObject, $firebaseArray) {

	// Call Firebase initialization code defined in site.js
	if (firebase.apps.length === 0)
	{
		initalizeFirebase();
	}

	// Check is there any current user
	checkUser(firebase);

	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	    // User is signed in.
			$scope.currentUserID = user.uid;
	  } else {
	    // No user is signed in.
			$scope.currentUserID = null;
	  }
	});

	var refPath, ref, eventName, teamName;

	eventName = getURLParameter("q");
	teamName = getURLParameter("team");

	// Combine id and skill
	$scope.combine = [];

	refPath = "event/" + eventName + "/team/" + teamName + "/teamMembers";
	$scope.member = [];
	$scope.member = $firebaseArray(firebase.database().ref(refPath));

	// Wait for the data
	$scope.member.$loaded().then(function(member) {
		$scope.memberName = [];

		// Remove user from member list
		console.log($scope.currentUserID);
		console.log(member);
		var index = -1;
		for (i = 0; i < $scope.member.length; i++) {
			if ($scope.member[i].$value == $scope.currentUserID) {
				index = i;
				break;
			}
		}
		if (index > -1) {
    	$scope.member.splice(index, 1);
		}
		else {
			console.log("ERROR");
		}

		for (i = 0; i < $scope.member.length; i++) {
			// Get the name of members in member list
			refPath = "user/" + $scope.member[i].$value;
			retrieveOnceFirebase(firebase, refPath, function(data) {
					if (data.child("name").val() != null ) {
						$scope.memberName.push(data.child("name").val());
						//console.log($scope.memberName);
					}
					else {
						$scope.memberName.push("");
						console.log("ERROR: NO NAME???");
					}
			});

			refPath = "/user/" + $.trim($scope.member[i].$value) + "/skills";
			$scope.skillList = [];
			$scope.skillList = $firebaseArray(firebase.database().ref(refPath));

			// Wait for the data
			$scope.skillList.$loaded().then(function(skillList) {
				//Initailise seletected to be false and increment 1 to total
				for (i = 0; i < skillList.length; i++) {
					skillList[i].selected = false;
					skillList[i].total += 1;
					console.log(skillList[i]);
					// Add an object to combine list
					console.log($scope.memberName[i]);
					console.log($scope.skillList);
					$scope.combine.push({id: $scope.member[i].$value, name: $scope.memberName[i], skillList: $scope.skillList});
				}
			});
		}
	})

	$scope.addPoint = function(s) {
		if (s.selected == false) {
			s.agree += 1;
			s.selected = true;
		}
		else {
			s.agree -= 1;
			s.selected = false;
		}
		console.log(s);
	}

	$scope.updateFunc = function() {
		for (i = 0; i < $scope.combine.length; i++) {
			var userID = $.trim($scope.combine[i].id);
			for (j = 0; j < $scope.combine[i].skillList.length; j++){
				var skillName = $.trim($scope.combine[i].skillList[j].$id);
				if ( userID !== '' && skillName !=='') {
					var newData = {
							'agree' : $scope.combine[i].skillList[j].agree,
							'total' : $scope.combine[i].skillList[j].total,
							'percent' : Math.floor($scope.combine[i].skillList[j].agree / $scope.combine[i].skillList[j].total*100)
					};

					refPath = "user/" + userID + "/skills/" + skillName;
					console.log(refPath);
					ref = firebase.database().ref(refPath);
					ref.update(newData, function(){
						// Complete call back
						//alert("data pushed...");

						// Finally, go back to the front-end
						//window.location.href= "index.html";
						console.log("Save data");
					});
				}
			}
		}
	}
}]);
