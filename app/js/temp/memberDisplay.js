angular.module('teamform-memberDisplay-app',['firebase'])
.controller('ProfileAcc',  ['$scope', '$firebaseObject', '$firebaseArray',function($scope, $firebaseObject, $firebaseArray) {

  //initalizeFirebase();
  initalizeFirebase();
  database = firebase.database();
  
  $scope.FUID = "ng";
  $scope.activity = "def";
  $scope.datadebug = {};
  
  $scope.load = function (FUID, activity) {
    if ( FUID !== '' ) {
  
      var refPath = activity + "/member/" + FUID;
      alert (refPath);
      //This is the way for getting data from firebase
      //.once("value") <--the value inside value must be value;
	  // changed to angularFire mode (10/11/2016)
	  memberData = $firebaseObject(firebase.database().ref(refPath));
	  memberData.$loaded().
	  then(function (data){
	    $scope.datadebug = data;
	  });
    }
  };
  

}]);