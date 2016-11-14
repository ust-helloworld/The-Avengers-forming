$(document).ready(function(){
	$('#team_page_controller').hide();
	$('#text_event_name').text("Error: Invalid event name ");
	var eventName = getURLParameter("q");
	if (eventName != null && eventName !== '' ) {
		$('#text_event_name').text("Event name: " + eventName);
	}
});

angular.module('teamform-team-app', ['firebase'])
.controller('TeamCtrl', ['$scope', '$firebaseObject', '$firebaseArray',
    function($scope, $firebaseObject, $firebaseArray) {
	// Call Firebase initialization code defined in site.js
	if (firebase.apps.length == 0){
		initalizeFirebase();
	}

	var refPath = "";
	var eventName = getURLParameter("q");

	// TODO: implementation of MemberCtrl
	$scope.param = {
		"teamName" : '',
		"currentTeamSize" : 0,
		"teamMembers" : [],
		"teamToSelect": []

	};

	refPath =  "event/" + eventName + "/admin";
	retrieveOnceFirebase(firebase, refPath, function(data) {
		if ( data.child("param").val() != null ) {
			$scope.range = data.child("param").val();
			$scope.param.currentTeamSize = parseInt(($scope.range.minTeamSize + $scope.range.maxTeamSize)/2);
			$scope.$apply(); // force to refresh
			$('#team_page_controller').show(); // show UI
		}
	});

	refPath = "event/" + eventName + "/member";
	$scope.member = [];
	$scope.member = $firebaseArray(firebase.database().ref(refPath));

	refPath = "event/" + eventName + "/team";
	$scope.team = [];
	$scope.team = $firebaseArray(firebase.database().ref(refPath));

	$scope.requests = [];
	$scope.mergeRequestReceived = [];
	$scope.members = [];
	$scope.refreshViewRequestsReceived = function() {
		//$scope.test = "";
		$scope.requests = [];
		var teamID = $.trim( $scope.param.teamName );	
				
		$.each($scope.member, function(i,obj) {			
			
			var userID = obj.$id;
			if ( typeof obj.selection != "undefined"  && obj.selection.indexOf(teamID) > -1 ) {
				
				$scope.requests.push(userID);
			}
		});
		$scope.mergeRequestReceived = [];
		$.each($scope.team, function(i,obj) {			
			if(typeof obj.mergeRequests != "undefined" && obj.mergeRequests.indexOf(teamID) > -1){
				$scope.mergeRequestReceived.push(obj);
			}
		});

		$.each($scope.member, function(i,obj){
			if (obj.joinedTeam == ""){
				$scope.members.push(obj);
			}
		});
		$scope.$apply();
	}

	$scope.changeCurrentTeamSize = function(delta) {
		var newVal = $scope.param.currentTeamSize + delta;
		if (newVal >= $scope.range.minTeamSize && newVal <= $scope.range.maxTeamSize ) {
			$scope.param.currentTeamSize = newVal;
		}
	}

	$scope.saveFunc = function() {
		var teamID = $.trim( $scope.param.teamName );
		if ( teamID !== '' ) {
			var newData = {
				'size': $scope.param.currentTeamSize,
				'teamMembers': $scope.param.teamMembers,
				'mergeRequests': $scope.mergeSelection,
				'invitationRequests':$scope.invitationRequests
			};		
			
			var refPath = "event/" + getURLParameter("q") + "/team/" + teamID;	
			var ref = firebase.database().ref(refPath);
			
			
			// for each team membxers, clear the selection in /[eventName]/team/
			$.each($scope.mergeRequestReceived, function(i,obj){
				var rec = $scope.team.$getRecord(obj.$id);
				//console.log(rec);
				$scope.team.$remove(rec);
			});
			ref.set(newData, function(){
				// console.log("Success..");
				// Finally, go back to the front-end
				window.location.href= "index.html";
			});
		}
	}

	$scope.loadFunc = function() {
		var teamID = $.trim( $scope.param.teamName );
		var eventName = getURLParameter("q");
		var refPath = "event/" + eventName + "/team/" + teamID ;
		retrieveOnceFirebase(firebase, refPath, function(data) {
			if ( data.child("size").val() != null ) {
				$scope.param.currentTeamSize = data.child("size").val();
				$scope.param.teamToSelect = $scope.team;
				$scope.refreshViewRequestsReceived();
			}
			if ( data.child("teamMembers").val() != null ) {
				$scope.param.teamMembers = data.child("teamMembers").val();
			}

			if ( data.child("mergeRequests").val() != null){
				$scope.mergeSelection = data.child("mergeRequests").val();
			}

			if ( data.child("invitationRequests").val() != null){
				$scope.invitationRequests = data.child("invitationRequests").val();
			}
			$scope.$apply(); // force to refresh
		});
	}

	/*************** TeamMergeRequest *******************/
	$scope.mergeSelection = [];
	$scope.teamMergeRequest = function(teamItem){
		if(typeof teamItem.teamMembers == "undefined"){
			teamItem.teamMembers = [];
		}
		if($scope.param.teamMembers.length + teamItem.teamMembers.length <= teamItem.size && $scope.mergeSelection.length < 1){
			$scope.mergeSelection.push(teamItem.$id);
			$scope.saveFunc();
		}
		else{
			alert("Invalid Operation");
		}
	}

	$scope.processMergeRequest = function(q){
		for (var i = 0; i < q.teamMembers.length; i++){
			$scope.param.teamMembers.push(q.teamMembers[i])
		}		
		$scope.saveFunc();	
	}
	//**************************************
	$scope.invitationRequests = [];
	$scope.invitationToMembers = function(t){
		if($scope.param.teamMembers.length + $scope.invitationRequests.length < $scope.param.currentTeamSize && $scope.invitationRequests.indexOf(t) < 0){
			$scope.invitationRequests.push(t.$id);
		}
		else{
			alert("Invalid operation.")
		}
		$scope.saveFunc();
	}
	
	$scope.processRequest = function(r) {
		//$scope.test = "processRequest: " + r;
		if ( 
		    $scope.param.teamMembers.indexOf(r) < 0 && 
			$scope.param.teamMembers.length < $scope.param.currentTeamSize  ) {
			// Not exists, and the current number of team member is less than the preferred team size

			$scope.param.teamMembers.push(r);
			
			//$scope.saveFunc;
		}
		$.each($scope.member, function(i, obj){
			if (obj.$id == r){
				rec = obj.$id
				return false;
			}
		});
		var path = eventName + '/member/' + rec;
		retrieveOnceFirebase(firebase, path, function(data) {
			joined = data.child("joinedTeam").val();
			joined = $scope.param.teamName;
			firebase.database().ref(path).update({"joinedTeam": joined});
		});
		
		$.each($scope.param.teamMembers, function(i,obj){
			var rec = $scope.member.$getRecord(obj);
			//console.log(rec);
			rec.selection = [];
			$scope.member.$save(rec);
		});
		//$scope.saveFunc();
	}

	$scope.removeMember = function(member) {
		var index = $scope.param.teamMembers.indexOf(member);
		if ( index > -1 ) {
			$scope.param.teamMembers.splice(index, 1); // remove that item
			
			$.each($scope.member, function(i, obj){
				if (obj.$id == member){
					rec = obj.$id
					return false;
				}
			});
			//console.log(rec);
			var path = eventName + '/member/' + rec;
			retrieveOnceFirebase(firebase, path, function(data) {
				joined = data.child("joinedTeam").val();
				joined = "";
				firebase.database().ref(path).update({"joinedTeam": joined});
			})
			$scope.saveFunc();
		}	
	}
}]);
