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
app.controller('CEA_Form', ['$scope', '$firebaseObject', '$firebaseArray', function CEA_Form($scope, $firebaseObject, $firebaseArray) {
	
	// Call Firebase initialization code defined in site.js
	if (firebase.apps.length === 0)
	{
	  initalizeFirebase();
	}
	firebase.auth().onAuthStateChanged(function (data){
		console.log(data.uid);
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
		  console.log("have sth to upload");
		  console.log(files[0].name);

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
		
		console.log("click saved!!");
		console.log($scope.param);
		refPath = "/event/"+$scope.eventName+"/admin/param";
		firebase.database().ref(refPath).update($scope.param);
	};
	
		
}]);