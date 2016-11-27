function CEA_Form($scope, $firebaseObject, $firebaseArray) {
	
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
	
		
};

angular.module('CreateEventApp', ['firebase'])
.controller('CEA_Form', ['$scope', '$firebaseObject', '$firebaseArray', CEA_Form]);