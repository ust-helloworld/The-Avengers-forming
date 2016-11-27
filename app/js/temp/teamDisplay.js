angular.module('teamform-teamDetail-app',['firebase'])
.controller('QueryTeam',  ['$scope', '$firebaseObject', '$firebaseArray',function($scope,$firebaseObject, $firebaseArray) {
  
  //initalizeFirebase();
  initalizeFirebase();
  database = firebase.database();
  
  $scope.FActivity = "abc";
  $scope.datadebug = {
  };
  
  $scope.load = function () {
    console.log ("click load :P");
  
    FActivity = $scope.FActivity;
    if ( FActivity !== '' ) {
      
      var refPath = FActivity + "/team/";
      console.log (refPath);
    
    //connect using Firebase Object
      $scope.fireObj = $firebaseObject(firebase.database().ref(refPath));
    
      $scope.teams = [];
      $scope.teams = $firebaseArray(firebase.database().ref(refPath));
      
      $scope.fireObj.$loaded()
      .then (function (data) {
      //$scope.datadebug = data;
      //console.log(data);
    
    });
    $scope.datadebug = $scope.teams ;
    };
  };
}]);