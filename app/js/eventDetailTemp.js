
angular.module('teamform-activityDetail-app', ['firebase'])
  .controller('ProfileAcc', ['$scope', '$firebaseObject', '$firebaseArray', function ($scope) {

    //initalizeFirebase();
    initalizeFirebase();
    database = firebase.database();

    $scope.FName = "abc";
    $scope.FDescription = "";
    $scope.FMinSize = "";
    $scope.FMaxSize = "";
    $scope.numgroup = []; //btw cannot return the value by using num

    $scope.datadebug = {
      name: $scope.FName,
      description: $scope.FDescription,
      minSize: $scope.FMinSize,
      maxSize: $scope.FMaxSize
    };

    $scope.load = function () {
      console.log("click load :P");
      FName = $scope.FName;
      if (FName !== '') {

        var refPath = FName;
        console.log(refPath);
        //This is the way for getting data from firebase
        //.once("value") <--the value inside value must be value;

        retrieveOnceFirebase(firebase, refPath, function (data) {
          //here use data to get back the data :)
          if (data.val().admin.param.minTeamSize != null) {
            $scope.FMinSize = data.val().admin.param.minTeamSize;
          } else {
            $scope.FMinSize = "";
          }

          if (data.val().admin.param.maxTeamSize != null) {
            $scope.FMaxSize = data.val().admin.param.maxTeamSize;
          } else {
            $scope.FMaxSize = "";
          }

          if (data.val().admin.param.description != null) {
            $scope.FDescription = data.val().admin.param.description;
          } else {
            $scope.FDescription = "";
          }
          $scope.numgroup = data.val().team; // cannot show group
          $scope.datadebug = data.val();
          $scope.showgroup = data.child("team").val();
        });
      }
    };
    $scope.save = function () {
      console.log("click save :P");
      FName = $scope.FName;
      FDescription = $scope.FDescription;
      FMinSize = $scope.FMinSize;
      FMaxSize = $scope.FMaxSize;
      if (FName !== '') {

        var refPath = FName + "/admin/param/";
        console.log(refPath);
        //this is the method to set/rewrite the data inside firebase

        updates = {};
        updates['minTeamSize'] = FMinSize;
        updates['maxTeamSize'] = FMaxSize;
        updates['description'] = FDescription;


        database.ref(refPath).update(updates);

        $scope.datadebug = {
          //description: FDescription,
          minTeamSize: FMinSize,
          maxTeamSize: FMaxSize
        };
      }
    };

  }]);

