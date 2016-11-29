function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
	console.log(ev.target.id);
    ev.dataTransfer.setData("text/plain", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
	if (data == ev.target.id) {console.log("Same Team =v="); return;}
	console.log(ev.target.id);
	console.log(data);

	if (data.indexOf("memb") == 0 ) {addMember(data.substring(5,data.length), ev.target.id);}
	else if(data.indexOf("team-") == 0 ) {
		console.log("Merge "+data.substring(5,data.length)+" into " +(ev.target.id).substring(5,ev.target.id.length));
		mergeTeam(data.substring(5,data.length), ev.target.id.substring(5,ev.target.id.length));
	}
}

function addMember(member, targetTeam){
	console.log('trigger addMember function');
	refPath = "/event/"+getURLParameter('e')+"/team/"+targetTeam;
	retrieveOnceFirebase(firebase,refPath, function (data){
		teamMembers = data.child('teamMembers').val();
		if (teamMembers.length>=data.child('size').val()){alert("Fulled.");return;};
		teamMembers.push(member);
		console.log(teamMembers);
		updates = {"teamMembers": teamMembers}
		firebase.database().ref(refPath).update(updates);
		
		refPathB = "/event/"+getURLParameter('e')+"/member/"+member;
		firebase.database().ref(refPathB).update({joinedTeam:targetTeam});
		$("h3#memb-"+member).hide();
	});
};
function mergeTeam(targetTeamA, targetTeamB){
	if (firebase.apps.length === 0)
	{
	  initalizeFirebase();
	}
	refPath = "/event/"+getURLParameter('e')+"/admin/param";
	newTeam = {};
	window.newsize = 0; //use window to make the "newsize" be global variables
	newowner = null;
	description = "";
	newTeamMembers = [];
	
	retrieveOnceFirebase(firebase,refPath,function(data){
		window.newsize = data.child("maxTeamSize").val(); //getLargestSize
	});
	
	//get TeamB & TeamA data
	refPath = "/event/"+getURLParameter('e')+"/team/";
	retrieveOnceFirebase(firebase,refPath,function(data){
		//make new Team using TeamB's data
		newTeam.size = window.newsize;
		newTeam.teamMembers = data.child(targetTeamB+"/teamMembers").val();
		//if (newTeam.teamMembers == null) newTeam.teamMembers = [];
		newTeam.owner = data.child(targetTeamB+'/owner').val();
		newTeam.description = data.child(targetTeamB+'/description').val();
		
		console.log(newTeam);
		
		//merge others' TeamMember
		anotherTeamMembers = data.child(targetTeamA+"/teamMembers").val();
		if (anotherTeamMembers.length + newTeam.teamMembers.length > newTeam.size)
		{
			console.log("too large for a team !!!");
		}
		else
		{	
			$.merge(newTeam.teamMembers, anotherTeamMembers);
	
			refPathB = "/event/"+getURLParameter('e')+"/team/"+"merged-"+targetTeamB+"+"+targetTeamA;
			console.log(newTeam);
			firebase.database().ref(refPathB).update(newTeam);
			
			refPathC = "/event/"+getURLParameter('e')+"/team/";
			firebase.database().ref(refPathC+"/"+targetTeamA).remove();
			firebase.database().ref(refPathC+"/"+targetTeamB).remove();
			
		}
	});
	
	}

app = angular.module('teamform-event-app', ['firebase']);
app.controller('displayCtrl', ['$scope', '$firebaseObject', '$firebaseArray', function displayCtrl ($scope, $firebaseObject, $firebaseArray) {
	// TODO: implementation of AdminCtrl

	// Initialize $scope.param as an empty JSON object
	$scope.param = {};

	// Call Firebase initialization code defined in site.js
	if (firebase.apps.length === 0)
	{
	  initalizeFirebase();
	}

	$scope.joined = false;
	

	var refPath, ref, eventName;

	eventName = getURLParameter("e");
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
					console.log("You are not Admin");
					window.location = "event.html?e="+getURLParameter('e');
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
	$scope.team = $firebaseArray(firebase.database().ref(refPath));
	
	refPath = "event/" + eventName + "/member/";
	$scope.member = [];
	$scope.member = $firebaseArray(firebase.database().ref(refPath));
	
	$scope.member.$loaded().then(function(data){
		$scope.remaining_member = $.grep($scope.member,function (elem,ind){
			//console.log(elem);
			return (elem["joinedTeam"]=="");
		});
	});
	
	$scope.eventDetail = {};

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// User is signed in.

		}
		  else {
			// No user is signed in.
		  }
	});
	
	
	//Cannot display the current state of sending request once user enter.
	$scope.deleteTeam = function (targetTeam){
		console.log(targetTeam);

		refPath = "event/" + eventName + "/team/";
		updates = {};
		updates[targetTeam]=null;
		console.log(updates);
		firebase.database().ref(refPath).update(updates).then(function (snapshot){alert("Successfully delete a team~");});
	};
	
	$scope.changeMinTeamSize = function(delta) {
		var newVal = $scope.param.minTeamSize + delta;
		if (newVal >=1 && newVal <= $scope.param.maxTeamSize ) {
			$scope.param.minTeamSize = newVal;
		}
	}

	$scope.changeMaxTeamSize = function(delta) {
		var newVal = $scope.param.maxTeamSize + delta;
		if (newVal >=1 && newVal >= $scope.param.minTeamSize ) {
			$scope.param.maxTeamSize = newVal;
		}
	}
	$scope.saveFunc = function() {
		$scope.param.$save().then(function(data){$('div#eventUpdateStatus').text("successfully update");});
		var database = firebase.database();

		if (typeof document.getElementById("FPhoto").files[0]!="undefined")
	  {
		  files = document.getElementById("FPhoto").files;
		  console.log("have sth to upload");
		  console.log(files[0].name);

		  // Create a root reference
          var storageRef = firebase.storage().ref();

          // Create a reference to 'mountains.jpg'
          var eventRef = storageRef.child("event/"+eventName);
          eventRef.put(files[0]).then(function(snapshot){
			 console.log('Uploaded a file!');
			  var downloadURL = snapshot.downloadURL;
			  var refPath = "event/" + eventName + "/admin/param";
			  database.ref(refPath).update({'imgURL':downloadURL}).then(function (){
				   // Finally, go back to the front-end
			       $('div#eventUpdateStatus').text("successfully update the picture");
			  });
		  });
	  }
	}
	
	$scope.closeEvent = function(){
		refPath = "event/" + eventName + "/admin/param";
		firebase.database().ref(refPath).update({close_event : $scope.param.close_event?false:true});
	};
	
}]);