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
		console.log(member);
		// Remove user from member list
		var index = -1;
		for (i = 0; i < member.length; i++) {
			if (member[i].$value == $scope.currentUserID) {
				index = i;
				break;
			}
		}
		if (index > -1) {
    	member.splice(index, 1);
		}
		else {
			console.log("ERROR");
		}

		var refPath = "user/";
		$scope.userList = [];
		$scope.userList = $firebaseArray(firebase.database().ref(refPath));
		// Wait for the data
		$scope.userList.$loaded().then(function(userList) {
			console.log(userList);
			memberName = [];

			// Get skills
			// For each member in members
			for (i = 0; i < member.length; i++) {
				// Get the name of members in member list
				var index = userList.$indexFor(member[i].$value);
				console.log(index);
				memberName.push(userList[index].name);
				console.log(memberName);
				console.log(userList[index].skills);

				var skillList = $.map(userList[index].skills, function(value, index) {
					value.key = index;
				  return [value];
				});
				console.log(skillList);

					//Initailise seletected to be false and increment 1 to total
					for (j = 0; j < skillList.length; j++) {
						skillList[j].selected = false;
						skillList[j].total += 1;
						console.log(skillList[j]);
					}
					console.log(i);
					console.log(memberName[i]);
					//console.log($scope.skillList);
					// Add an object to combine list
					$scope.combine.push({id: member[i].$value, name: memberName[i], skillList: skillList});

				}
		});
	});

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
		console.log($scope.combine);
		for (i = 0; i < $scope.combine.length; i++) {
			var userID = $.trim($scope.combine[i].id);
			for (j = 0; j < $scope.combine[i].skillList.length; j++){
				var skillName = $.trim($scope.combine[i].skillList[j].key);
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
						window.location.href= "index.html";
						console.log("Save data");
					});
				}
			}
		}
	}
}]);
