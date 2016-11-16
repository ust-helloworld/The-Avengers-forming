angular.module('CreateEventApp', ['firebase'])
.controller('CEA_Form', ['$scope', '$firebaseObject', '$firebaseArray', function($scope, $firebaseObject, $firebaseArray) {
	
	// Call Firebase initialization code defined in site.js
	initalizeFirebase();
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

	$scope.saveFunc = function() {
		
		alert("click saved!!");
		console.log($scope.param);
		refPath = "/event/"+$scope.eventName+"/admin/param";
		firebase.database().ref(refPath).update($scope.param);
	};
	
		
}]);