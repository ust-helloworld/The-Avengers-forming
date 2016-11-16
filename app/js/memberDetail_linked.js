
angular.module('teamform-memberDetail-app',['firebase'])
.controller('ProfileAcc',  ['$scope', '$firebaseObject', '$firebaseArray',function($scope) {

  //initalizeFirebase();
  initalizeFirebase();
  database = firebase.database();


  $scope.FUID = null;
  $scope.Fname = "";
  $scope.Fskill = "";
  $scope.datadebug = {
    name: $scope.Fname,
    skill: $scope.Fskill
  };
  $scope.inviteReceived = [];

  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
      // User is signed in.
    console.log("You logined in");
    $scope.FUID = user.uid;
    $scope.load();
    } else {
      // No user is signed in.
    $scope.FUID = null;
    }
  });

  $scope.load = function () {
    console.log ("click load :P");
    FUID = $scope.FUID;

	currentUser = firebase.auth().currentUser;

    if ( FUID !== null ) {

      var refPath = "/user/"+FUID;
      console.log (refPath);
      //This is the way for getting data from firebase
      //.once("value") <--the value inside value must be value;
      retrieveOnceFirebase(firebase, refPath,function (data)
      {
		 {
		  $scope.Fname = currentUser['displayName'];
          $scope.description = "";
        };
	  if (data.val()!=null){
        //here use data to get back the data :)
        if ( data.val().name != null ) {
          $scope.Fname = data.val().name;
        } else {
          $scope.Fname = currentUser.name;
        }
        if ( data.val().skill != null ) {
          $scope.Fskill = data.val().skill;
        } else {
          $scope.Fskill = "";
        }
		if ( data.val().invite != null ) {
          $scope.inviteReceived = data.val().invite;
        } else {
          $scope.inviteReceived = "";
        }
		if ( data.val().comments != null ) {
          $scope.comments = data.val().comments;
        } else {
          $scope.comments = "";
        }
		if ( data.val().description != null ) {
          $scope.description = data.val().description;
        }
        $scope.datadebug = {
          name: data.val().name,
          skill: data.val().skill
	    };
	  };$scope.$apply();
	  });
    }
  };
  $scope.save = function () {
    console.log ("click save :P");
    FUID = $scope.FUID;
    Fname = $scope.Fname;
    Fskill = $scope.Fskill;
	description = $scope.description;
	if (typeof Fskill == "string")
	  skilllist = Fskill.split(',');
	else skilllist = Fskill;
    if ( FUID !== '') {

      var refPath = "/user/"+FUID;
      //this is the method to set/rewrite the data inside firebase
	  updates = {};
	  updates["name"] = Fname;
	  updates["skill"] = skilllist;
	  updates["description"] = description;
      database.ref(refPath).update(updates);
      $scope.datadebug = {
        name: Fname,
        skill: skilllist
      };
    }
	$scope.load();
  };
  //<!-- wait for Robbie to do the accept function -->
  /*$scope.accept = function (para){
    FUID = $scope.FUID;
    activity = $scope.activity;
	alert("clicked accept");
	if ( FUID !== '' && activity !=='') {
	  refPath = activity +"/member/"+FUID;
	  updates = {'invite':null};
	  database.ref(refPath).update(updates);
	  refPath = activity + "/team/" + para +"teamMembers";
	  database.ref(refPath).once("value").then(function (data)
      {
	    memberlist = data.val();
		if (memberlist == null) memberlist = [];
		alert("memberlist");
		memberlist.push(FUID);
		updates = {};
		updates["teamMembers"] = memberlist;
		database.ref(refPath).update(updates);
	  });
	}
  };*/


}]);
