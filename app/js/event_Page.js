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
	$("button#adminButton").hide();

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
			  if ( $scope.param.owner == firebase.auth().currentUser.uid)
			  {
		        $("button#adminButton").show();
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
	
	$scope.memberDetail = {joinedTeam:null,selection: []};

	firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		// User is signed in.
		refPath = "event/" + eventName + "/member/" + user.uid;
		$scope.memberDetail = $firebaseObject(firebase.database().ref(refPath));
		$scope.memberDetail.$loaded().then(function (data){
			//console.log($scope.memberDetail.joinedTeam +" "+typeof $scope.memberDetail.joinedTeam +" "+($scope.memberDetail.joinedTeam != ""&& typeof $scope.memberDetail.joinedTeam !='undefined'));
			if (typeof $scope.memberDetail.joinedTeam!="undefined"){
				$('#joinButton').text("Leave the event");
				$scope.joined = true;
			}

	});
	  } else {
		// No user is signed in.
	  }
	});
	
	
	//Cannot display the current state of sending request once user enter.
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
				//alert("You have sent this!!!");
				memberDetail.selection = $.grep(memberDetail.selection, function(delData){
					return delData != targetTeam;
				});
				memberDetail.$save();
				$("#button-"+targetTeam).text ("Request");
			}
		});
	}
	
	$scope.joinQuit = function(){
		refPath = "event/" + eventName + "/member/" + firebase.auth().currentUser.uid;
		var memberDetail = $firebaseObject(firebase.database().ref(refPath));
		console.log(memberDetail.joinedTeam != "");
		if (memberDetail.joinedTeam != "" && typeof memberDetail.joinedTeam != 'undefined')
		{
			alert("You are in the team, leave your team first!");
			return;
		}
		if ($scope.joined == false){
			memberDetail.name = firebase.auth().currentUser.displayName;
			memberDetail.joinedTeam = "";
			memberDetail.$save();
			$('#joinButton').text("Leave the event");
			$scope.joined = true;
			$('.btn-sendRequest').show();
			$('.btn-sendRequest').text("Request");
		}
		else {
			if ($scope.memberDetail.joinedTeam != ""){ alert("You are in the team, leave your team first!");return;}
			memberDetail.name = null;
			memberDetail.selection = null;
			memberDetail.joinedTeam = null;
			memberDetail.$save();
			$('#joinButton').text("Join the event");
			$scope.joined = false;
			$('.btn-sendRequest').hide();
		}
	};
	$scope.adminPage = function (){
		window.location = "event_admin.html?e=" + eventName;
	}
	
	
}]);
app.controller('CEA_Form', ['$scope', '$firebaseObject', '$firebaseArray', function CEA_Form($scope, $firebaseObject, $firebaseArray) {
	
	// Call Firebase initialization code defined in site.js
	if (firebase.apps.length === 0)
	{
	  initalizeFirebase();
	}
	firebase.auth().onAuthStateChanged(function (data){
		//console.log(data.uid);
		$scope.useruid = data.uid;
		
		// Initialize $scope.param as an pre-set JSON object
		$scope.param = {
		minTeamSize : 4,
		maxTeamSize : 10,
		description : "",
		imgURL : "",
		owner : $scope.useruid
	};
	});
	
	
	
	var refPath, ref, eventName;

	$scope.eventName = "";
	
	
	$scope.changeMinTeamSize = function(delta) {
		var newVal = $scope.param.minTeamSize + delta;
		if (newVal >=1 && newVal <= $scope.param.maxTeamSize ) {
			$scope.param.minTeamSize = newVal;
		} 
	};

	$scope.changeMaxTeamSize = function(delta) {
		var newVal = $scope.param.maxTeamSize + delta;
		if (newVal >=1 && newVal >= $scope.param.minTeamSize ) {
			$scope.param.maxTeamSize = newVal;
		} 
	};
	$scope.imgUpload = function(){
		var database = firebase.database();
		//database.ref(refPath).update({'description':$scope.FDescription});
		
		eventName = $scope.eventName;
		
		if (typeof document.getElementById("js-upload-files").files[0]!="undefined")
	  {
		  files = document.getElementById("js-upload-files").files;
		  //console.log("have sth to upload");
		  //console.log(files[0].name);

		  // Create a root reference
          var storageRef = firebase.storage().ref();

          // Create a reference to 'mountains.jpg'
          var eventRef = storageRef.child("event/"+eventName);
          eventRef.put(files[0]).then(function(snapshot){
			 console.log('Uploaded a file!');
			  var downloadURL = snapshot.downloadURL;
			  $scope.param.imgURL = downloadURL;
          });
	  }
	};

	$scope.saveFunc = function() {
		
		//console.log("click saved!!");
		//console.log($scope.param);
		refPath = "/event/"+$scope.eventName+"/admin/param";
		firebase.database().ref(refPath).update($scope.param);
	};
	
		
}]);

app.controller('CEA_Team', ['$scope', '$firebaseObject', '$firebaseArray', function CEA_Team($scope, $firebaseObject, $firebaseArray) {
	if (firebase.apps.length == 0){
		initalizeFirebase();
	}

	var refPath = "";
	var eventName = getURLParameter("e");

	// TODO: implementation of MemberCtrl
	$scope.teamName = "";
	$scope.teamdata = {
		"size" : 0,
		"teamMembers" : [],
		"description": '',
		"teamToSelect": [],
		"owner":null


	};
	console.log($scope.teamdata.currentTeamSize);
	firebase.auth().onAuthStateChanged(function(user){
		$scope.userid = user.uid;
		$scope.teamdata.teamMembers.push(user.uid);// teammembers store
		$scope.teamdata.owner = user.uid;
	});
	var eventName = getURLParameter("e");
	var ref = "/event/"+ eventName + "/admin";
	retrieveOnceFirebase(firebase, ref, function(data) {
		if ( data.child("param").val() != null ) {
			$scope.range = data.child("param").val();
			$scope.teamdata.size = parseInt(($scope.range.minTeamSize + $scope.range.maxTeamSize)/2);
			$scope.$apply(); // force to refresh
		}
	});

	$scope.changeCurrentTeamSize = function(delta) {
		var newVal = $scope.teamdata.size + delta;
		if (newVal >= $scope.range.minTeamSize && newVal <= $scope.range.maxTeamSize ) {
			$scope.teamdata.size = newVal;
		}
		console.log($scope.teamdata.size);
	}
	$scope.createFunc = function(){
		var teamID = $.trim($scope.teamName);
		console.log(teamID);
		console.log($scope.teamdata);
		var refP = "/event/"+ eventName + "/member/" + $scope.userid;
		var joined;
		retrieveOnceFirebase(firebase, refP, function(data) {
			joined = data.child("joinedTeam").val()
			$scope.$apply();
			console.log(joined);
			if(joined == ""){
				var refPath = "/event/"+ eventName + "/team/" + teamID;
				firebase.database().ref(refPath).update($scope.teamdata);
		//var refP = "/event/"+ eventName + "/member/" + $scope.userid;
				firebase.database().ref(refP).update({"joinedTeam":teamID});
				var refp = "/user/" + $scope.userid;
				firebase.database().ref(refp).update({"joinedTeam":teamID});
			}else{
				alert("you have team already!");
			}
		});
 	}
}]);