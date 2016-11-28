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

	var refPath, ref, eventName, teamName;

	eventName = getURLParameter("q");
	teamName = getURLParameter("team");

	refPath = "event/" + eventName + "/team/" + teamName + "/teamMembers";
	$scope.member = [];
	$scope.member = $firebaseArray(firebase.database().ref(refPath));

	// Combine id and skill
	$scope.combine = [];

	// Wait for the data
	$scope.member.$loaded().then(function(member) {
		for (i = 0; i < $scope.member.length; i++) {
			refPath = "user/" + $scope.member[i].$value;

			var skill = {};
			var refPathskill = "/user/" + $.trim($scope.member[i].$value) + "/skills";
			$scope.skillList = [];
			$scope.skillList = $firebaseArray(firebase.database().ref(refPathskill));

			// Initailise seletected to be false and increment 1 to total
			$scope.skillList.$loaded().then(function(skillList) {
				for (i = 0; i < skillList.length; i++) {
					skillList[i].selected = false;
					skillList[i].total += 1;
					console.log(skillList[i]);
				}
			});
			/*
			retrieveOnceFirebase(firebase, refPath, function(data) {
					if (data.child("skills").val() != null ) {
							skill = data.child("skills").val();
					}
					else {
							skill = {};
					}
					$scope.skills.push(skill);
					console.log($scope.skills[0].SS);
			});
			*/
			$scope.combine.push({id: $scope.member[i].$value, skillList: $scope.skillList});
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

					var refPath = "user/" + userID + "/skills/" + skillName;
					var ref = firebase.database().ref(refPath);
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
