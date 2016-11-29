$(document).ready(function(){
	$('#team_page_controller').hide();
	$('#text_event_name').text("Error: Invalid event name ");
	var eventName = getURLParameter("e");
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
	checkUser(firebase);

	var refPath = "";
	var eventName = getURLParameter("e");
	var teamName = getURLParameter("t");

	// TODO: implementation of MemberCtrl
	$scope.param = {
		"teamName" : '',
		"currentTeamSize" : 0,
		"teamMembers" : [],
		"teamToSelect": [],


	};
	refPath =  "/event/" + eventName + "/admin" ;
	retrieveOnceFirebase(firebase, refPath, function(data) {
		if ( data.child("param").val() != null ) {
			$scope.range = data.child("param").val();
			$scope.param.currentTeamSize = parseInt(($scope.range.minTeamSize + $scope.range.maxTeamSize)/2);
			$scope.$apply(); // force to refresh
			$('#team_page_controller').show(); // show UI
		}
	});
	refpath = "/event/" + eventName + "/team/" + teamName;
	console.log(refPath);
	firebase.auth().onAuthStateChanged(function(user){

		retrieveOnceFirebase(firebase, refpath, function(data) {
			console.log(data.child("owner").val());
			if(data.child("owner").val() != user.uid && window.location.href.indexOf("team.html") > -1){
				console.log(data.child("owner").val());
				window.location.href = "teamMember.html?e=" + eventName + "&t=" + teamName;
			}
		});
		$scope.$apply();
	});

	refPath = "/event/" + eventName + "/member";
	$scope.member = [];
	$scope.member = $firebaseArray(firebase.database().ref(refPath));

	refPath = "/event/" + eventName + "/team";
	$scope.team = [];
	$scope.team = $firebaseArray(firebase.database().ref(refPath));
	
	var refi = "/user/"
	$scope.userimg = [];
	$scope.user = [];
	$scope.user = $firebaseArray(firebase.database().ref(refi));
	console.log($scope.user);
	$scope.requests = [];
	$scope.mergeRequestReceived = [];
	$scope.members = [];
	$scope.refreshViewRequestsReceived = function() {
		$scope.requests = [];
		//var teamID = $.trim( $scope.param.teamName );	
		//var teamID = "test2";
		$scope.member.$loaded().then(function(data){	
		$.each($scope.member, function(i,obj) {			
			
			var userID = obj.$id;
			if ( typeof obj.selection != "undefined"  && obj.selection.indexOf(teamName) > -1 ) {
				
				$scope.requests.push(obj);
			}
		});
		});
		console.log($scope.member);
		console.log($scope.team);
		$scope.team.$loaded().then(function(data){
		$.each($scope.team, function(i,obj) {
				console.log(obj.mergeRequests);			
				if(typeof obj.mergeRequests != "undefined" && obj.mergeRequests.indexOf(teamName) > -1){
					$scope.mergeRequestReceived.push(obj);
				}
			});
		});
		console.log($scope.mergeRequestReceived);
		$scope.member.$loaded().then(function(data){
			$.each($scope.member, function(i,obj){
				if (obj.joinedTeam == ""){
					$scope.members.push(obj);
					console.log(obj.$id);
				}
				$scope.user.$loaded().then(function(data){
					for (i = 0; i < data.length; i++){
						if(data[i].$id == obj.$id){
							console.log(data[i].$id == obj.$id);
							$scope.userimg.push(data[i]);
						}
					}
				});
			});
		});
		$scope.$apply();
	}
	console.log($scope.userimg);
	$scope.changeCurrentTeamSize = function(delta) {
		var newVal = $scope.param.currentTeamSize + delta;
		if (newVal >= $scope.range.minTeamSize && newVal <= $scope.range.maxTeamSize ) {
			$scope.param.currentTeamSize = newVal;
		}
	}
	$scope.param.teamName = teamName;
	var eventName = getURLParameter("e");
	var refPath = "/event/" + eventName + "/team/" + teamName ;
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
		if ( data.child("description").val() != null){
			$scope.description = data.child("description").val();
		}
		$scope.buttonChange();
		console.log($scope.param.teamMembers);
		$scope.$apply(); // force to refresh
	});
	$scope.createFunc = function(){
		var teamID = $.trim( $scope.param.teamName );
		if ( teamID !== '' ) {
			var newData = {
				'size': $scope.param.currentTeamSize,
				'teamMembers': $scope.param.teamMembers,
				'mergeRequests': $scope.mergeSelection,
				'invitationRequests':$scope.invitationRequests,
				'discription':$scope.discription,
				'owner':firebase.auth().currentUser.uid
			};
			var refPath = "/event/" + getURLParameter("e") + "/team/" + teamID;	
			var ref = firebase.database().ref(refPath);
			ref.set(newData, function(){
				// console.log("Success..");
				// Finally, go back to the front-end
				window.location.href= "index.html";
			});
		}
	}
	$scope.saveFunc = function() {
		//var teamID = $.trim( $scope.param.teamName );
		if ( teamName !== '' ) {
			var newData = {
				'size': $scope.param.currentTeamSize,
				'teamMembers': $scope.param.teamMembers,
				'mergeRequests': $scope.mergeSelection,
				'invitationRequests':$scope.invitationRequests
			};		
			
			var refPath = "/event/" + getURLParameter("e") + "/team/" + teamName;	
			var ref = firebase.database().ref(refPath);

			// for each team members, clear the selection in /[eventName]/team/
			/*$.each($scope.param.teamMembers, function(i,obj){
				//$scope.test += obj;
				var rec = $scope.member.$getRecord(obj);
				console.log(obj);
				rec.selection = [];
				$scope.member.$save(rec);
			});*/

			// for each team membxers, clear the selection in /[eventName]/team/
			$.each($scope.mergeRequestReceived, function(i,obj){

				var rec = $scope.team.$getRecord(obj.$id);
				console.log(rec);
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
		var eventName = getURLParameter("e");
		var refPath = "/event/" + eventName + "/team/" + teamID ;
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
			var rf = "/event/" + eventName + "/team/" + teamName;
			firebase.database().ref(rf).update({"mergeRequests" : $scope.mergeSelection})
		}
		else{
			alert("Invalid Operation");
		}
	}

	$scope.processMergeRequest = function(q){
		console.log(q);
		for (var i = 0; i < q.teamMembers.length; i++){
			var memberid;
			$scope.param.teamMembers.push(q.teamMembers[i])
			$.each($scope.member,function(j,obj){
				console.log(obj.$id);
				console.log(q.teamMembers[i]);
				if (obj.$id == q.teamMembers[i]){
					//console.log(q.teamMembers[i]);
					console.log(memberid);
					memberid = obj.$id;
				}
			});
			refm = "/event/" + eventName + "/team/" + teamName;
			firebase.database().ref(refm).update({"teamMembers":$scope.param.teamMembers});
			refPs = "/event/" + eventName + "/member/" + memberid;
			retrieveOnceFirebase(firebase, refPs, function(data) {
				joined = teamName;
				firebase.database().ref(refPs).update({"joinedTeam":joined})
			});
			$.each($scope.mergeRequestReceived, function(i,obj){

				var rec = $scope.team.$getRecord(obj.$id);
				console.log(rec);
				$scope.team.$remove(rec);
			});	
		}			
	}

	$scope.invitationRequests = [];
	$scope.invitationToMembers = function(t){
		if($scope.param.teamMembers.length + $scope.invitationRequests.length < $scope.param.currentTeamSize && $scope.invitationRequests.indexOf(t) < 0){
			$scope.invitationRequests.push(t.$id);
		}
		else{
			alert("Invalid operation.")
		}
		var refs = "/event/" + eventName + "/team/" + teamName;
		firebase.database().ref(refs).update({"invitationRequests":$scope.invitationRequests});
	}

	$scope.processRequest = function(r) {
		if ( 
		    $scope.param.teamMembers.indexOf(r.$id) < 0 && 
			$scope.param.teamMembers.length < $scope.param.currentTeamSize  ) {
			// Not exists, and the current number of team member is less than the preferred team size

			$scope.param.teamMembers.push(r.$id);
		var recs;
		$.each($scope.member, function(i, obj){
			console.log(obj);
			if (obj.$id == r.$id){
				recs = obj.$id;
				return false;
			}
		});
		var path = "/event/" + eventName + '/member/' + recs;
		console.log(path);
		retrieveOnceFirebase(firebase, path, function(data) {
			joined = data.child("joinedTeam").val();
			joined = $scope.param.teamName;
			firebase.database().ref(path).update({"joinedTeam": joined});
		});
		var rpath = "/user/" + recs;
		console.log(rpath);
		retrieveOnceFirebase(firebase, rpath, function(data) {
			joined2 = data.child("joinedTeam").val();
			joined2 = $scope.param.teamName;
			console.log(joined2);
			firebase.database().ref(rpath).update({"joinedTeam": joined2});
		});
		$.each($scope.member, function(i,obj){
			var r2;
			console.log(obj);
			if (obj.name == r.name){
				r2 = obj;
				console.log(r2);
			}
			r2.selection = [];
			$scope.member.$save(r2);
		});
		} else{
			alert("The team is full");
		}
	}

	$scope.removeMember = function(member) {
		var index = $scope.param.teamMembers.indexOf(member);
		if ( index > -1 ) {
			$scope.param.teamMembers.splice(index, 1); // remove that item
			var rec;
			console.log(member);
			$.each($scope.member, function(i, obj){
				if (obj.$id == member){  //id
					rec = obj.$id
					return false;
				}
			});
			console.log(rec);
			var path = "/event/" + eventName + '/member/' + rec;
			retrieveOnceFirebase(firebase, path, function(data) {
				joined = data.child("joinedTeam").val();
				joined = "";
				firebase.database().ref(path).update({"joinedTeam": joined});
			});

			firebase.database().ref("/event/" + eventName + "/team/" + teamName).update({"teamMembers":$scope.param.teamMembers});
		}	
	}
	$scope.buttonChange = function(){
		firebase.auth().onAuthStateChanged(function(user){
		var re = "/event/" + eventName + "/team/" + teamName; 
		retrieveOnceFirebase(firebase, re, function(data) {
			if(data.child("joinedTeam").val() == $scope.param.teamName ){
				console.log(data.child("joinedTeam").val());
				$("#joinButton").text("Leave");
			}
			else{
				$("joinButton").text("Join");
			}
		});
		});
	}
	$scope.joinQuit = function(){
		firebase.auth().onAuthStateChanged(function(user){
		var refP = "/event/" + eventName + "/member/" + user.uid;

		console.log(refP);
		retrieveOnceFirebase(firebase, refP, function(data) {
			if(data.child("joinedTeam").val() == $scope.param.teamName ){
				//console.log(data.child("joinedTeam").val());
				//firebase.database().ref(refP).update({"joinedTeam":""});
				var refMember = "/event/" + eventName + "/member/" + user.uid; 
				firebase.database().ref(refMember).update({"joinedTeam":""});
				var refpath = "/event/" + eventName + "/team/" + teamName;
				$scope.param.teamMembers.splice(user.uid,1);
				firebase.database().ref(refpath).update({"teamMembers":$scope.param.teamMembers});
			}
			else{
				if(data.child("joinedTeam").val()!= ""){
					alert("You have another team already");
				}
				else{
					console.log("I am here");
					var refpath = "/event/" + eventName + "/member/" + user.uid;
					if(data.child("selection").val() != null){
						newArray = data.child("selection").val();
					}
					else{
						newArray = [];
					}
					if (newArray.indexOf(user.displayName) > -1)
					{
						alert("you have sent request to team already!")
					}
					else{
						var refM = "/event/" + eventName + "/member/" + user.uid;
						newArray.push(teamName);
						firebase.database().ref(refM).update({"selection":newArray});
					}
				}

			}
		});
		$scope.$apply();
	});

	}
}]);