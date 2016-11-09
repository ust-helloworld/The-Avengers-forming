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
	initalizeFirebase();

	var refPath = "";
	var eventName = getURLParameter("q");	
	
	// TODO: implementation of MemberCtrl	
	$scope.param = {
		"teamName" : '',
		"currentTeamSize" : 0,
		"teamMembers" : [],
		"teamToSelect": []

	};
		
	

	refPath =  eventName + "/admin";
	retrieveOnceFirebase(firebase, refPath, function(data) {	

		if ( data.child("param").val() != null ) {
			$scope.range = data.child("param").val();
			$scope.param.currentTeamSize = parseInt(($scope.range.minTeamSize + $scope.range.maxTeamSize)/2);
			$scope.$apply(); // force to refresh
			$('#team_page_controller').show(); // show UI
			
		} 
	});
	
	
	refPath = eventName + "/member";	
	$scope.member = [];
	$scope.member = $firebaseArray(firebase.database().ref(refPath));
	
	
	refPath = eventName + "/team";	
	$scope.team = [];
	$scope.team = $firebaseArray(firebase.database().ref(refPath));
	

	
	$scope.requests = [];
	$scope.mergeRequestReceived = [];
	$scope.refreshViewRequestsReceived = function() {
		
		//$scope.test = "";		
		$scope.requests = [];
		var teamID = $.trim( $scope.param.teamName );	
				
		$.each($scope.member, function(i,obj) {			
			//$scope.test += i + " " + val;
			//$scope.test += obj.$id + " " ;
			
			var userID = obj.$id;
			if ( typeof obj.selection != "undefined"  && obj.selection.indexOf(teamID) > -1 ) {
				//$scope.test += userID + " " ;
				
				$scope.requests.push(userID);
			}
		});
		$scope.mergeRequestReceived = []; // new array storing the merge request received by the team
		$.each($scope.team, function(i,obj) {			
			if(typeof obj.mergeRequests != "undefined" && obj.mergeRequests.indexOf(teamID) > -1){
				$scope.mergeRequestReceived.push(obj);
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
				'mergeRequests': $scope.mergeSelection
			};		
			
			var refPath = getURLParameter("q") + "/team/" + teamID;	
			var ref = firebase.database().ref(refPath);
			
			
			// for each team members, clear the selection in /[eventName]/team/
			$.each($scope.param.teamMembers, function(i,obj){
				
				
				//$scope.test += obj;
				
				var rec = $scope.member.$getRecord(obj);
				rec.selection = [];
				$scope.member.$save(rec);
				
				
				
			});
			$.each($scope.mergeRequestReceived, function(i,obj){ // if team B received the request from team A, then team A is removed
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
		var refPath = eventName + "/team/" + teamID ;
		retrieveOnceFirebase(firebase, refPath, function(data) {	

			if ( data.child("size").val() != null ) {
				
				$scope.param.currentTeamSize = data.child("size").val();
				$scope.param.teamToSelect = $scope.team;
				
				$scope.refreshViewRequestsReceived();
								
				
			} 
			
			if ( data.child("teamMembers").val() != null ) {
				
				$scope.param.teamMembers = data.child("teamMembers").val();
				
			}
			else{
				$scope.param.teamMembers = "";
			}

			if ( data.child("mergeRequests").val() != null){
				$scope.mergeSelection = data.child("mergeRequests").val();
			}
			
			$scope.$apply(); // force to refresh
		});

	}

		/*************** TeamMergeRequest *******************/
	$scope.mergeSelection = [];
	$scope.teamMergeRequest = function(teamItem){
		if(typeof teamItem.teamMembers == "undefined"){ // if team B has no team members, create a team member array of length 0,
			teamItem.teamMembers = [];
		}
		if($scope.param.teamMembers.length + teamItem.teamMembers.length <= teamItem.size && $scope.mergeSelection.length < 1){
			$scope.mergeSelection.push(teamItem.$id); // if members in team A + members in team B > the maximum size of team B, not allow to merge
			$scope.saveFunc();
		}
		else{
			alert("Invalid Operation");
		}
	}

	$scope.processMergeRequest = function(q){
		for (var i = 0; i < q.teamMembers.length; i++){ // add members of team A to team B
			$scope.param.teamMembers.push(q.teamMembers[i])
		}
		
		$scope.saveFunc();	
	}
	//**************************************
	
	$scope.processRequest = function(r) {
		//$scope.test = "processRequest: " + r;
		
		if ( 
		    $scope.param.teamMembers.indexOf(r) < 0 && 
			$scope.param.teamMembers.length < $scope.param.currentTeamSize  ) {
				
			// Not exists, and the current number of team member is less than the preferred team size
			$scope.param.teamMembers.push(r);
			
			$scope.saveFunc();
		}
	}
	
	$scope.removeMember = function(member) {
		
		var index = $scope.param.teamMembers.indexOf(member);
		if ( index > -1 ) {
			$scope.param.teamMembers.splice(index, 1); // remove that item
			
			$scope.saveFunc();
		}
		
	}
	
	
	
	
	
	
		
}]);