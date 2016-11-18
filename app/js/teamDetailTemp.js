angular.module('teamform-teamDetail-app',['firebase'])
.controller('ProfileAcc',  ['$scope', '$firebaseObject', '$firebaseArray',function($scope) {

  //initalizeFirebase();
  initalizeFirebase();
  database = firebase.database();

  $scope.FName = "abc";
  $scope.FDescription = "Need C++";
  $scope.FSize = "";
  $scope.FActivity = "abc";
  $scope.datadebug = {
    name: $scope.FName,
    description: $scope.FDescription,
    size: $scope.FSize
  };

  $scope.load = function () {
    console.log ("click load :P");
    FName = $scope.FName;
    FActivity = $scope.FActivity;
    if ( FName !== '' ) {

      var refPath = FActivity + "/team/"+FName;
      console.log (refPath);
      retrieveOnceFirebase(firebase, refPath, function (data)
      {
        //here use data to get back the data :)
        console.log(data.val().size);
        if ( data.val().size != null ) {
          $scope.FSize = data.val().size;
        } else {
          $scope.FSize = "";
        }

        if ( data.val().teamMembers != null ) {
          $scope.FMembers = data.val().teamMembers;
        } else {
          $scope.FMembers = "";
        }

        if ( data.val().description != null ) {
          $scope.FDescription = data.val().description;
        } else {
          $scope.FDescription = "";
        }

        $scope.datadebug = data.val();
      });

    }
  };
  $scope.save = function () {
    console.log ("click save :P");
    FName = $scope.FName;
    FActivity = $scope.FActivity;
    FMembers = $scope.FMembers;
    FMemberList = FMembers.split(',');
    FDescription = $scope.FDescription;
    FSize = $scope.FSize;
    if ( FName !== '' && FActivity !=='') {

      var refPath = FActivity + "/team/"+FName;
      console.log (refPath);
      //this is the method to set/rewrite the data inside firebase
      database.ref(refPath).set(
      {
        size: FSize,
        description: FDescription,
        teamMembers: FMemberList

      });

      $scope.datadebug = {
        size: FSize,
        description: FDescription,
        teamMembers: FMemberList
      };
    }
  };


}]);
