$(document).ready(function(){


    $("#btn_admin").click(function(){
    	var val = $('#input_text').val();
    	if ( val !== '' ) {
    		var url = "admin.html?q=" + val;
    		window.location.href= url ;
    		return false;
    	}
    });

    $("#btn_leader").click(function(){
    	var val = $('#input_text').val();
    	if ( val !== '' ) {
    		var url = "team.html?q=" + val;
    		window.location.href= url ;
    		return false;
    	}
    });

    $("#btn_member").click(function(){
    	var val = $('#input_text').val();
    	if ( val !== '' ) {
    		var url = "member.html?q=" + val;
    		window.location.href= url ;
    		return false;
    	}
    });

    $("#btn_comment").click(function(){
    	var val = $('#input_text').val();
      var team = $('#input_team').val();
    	if ( val !== '' && team !== '') {
    		var url = "comment.html?q=" + val + "&team=" + team;
    		window.location.href= url ;
    		return false;
    	}
    });
});
angular.module('indexApp', ['firebase'])
.controller('indexController', ['$scope', '$firebaseObject', '$firebaseArray', function($scope, $firebaseObject, $firebaseArray) {
    // Call Firebase initialization code defined in site.js

    initalizeFirebase();

    database = firebase.database();
    $scope.userdata = {};
    $scope.skillname = "";

    $scope.joined = "";
    var userID = $scope.userdata.userID;
    var refPath = "/user/" + "IWs4Qik97oYb5ymSQaTzcdLBhn92";
    retrieveOnceFirebase(firebase, refPath, function(data) {
            if (data.child("joinedTeam").val() != null ) {
                $scope.joined = data.child("joinedTeam").val();
            }
            $scope.$apply();
    });

    firebase.auth().onAuthStateChanged(function(user){
        if (user) {

            $scope.userdata.userID = user.uid;
            $scope.userdata.userName = user.displayName;
            $scope.userdata.photoURL = user.photoURL;
            $scope.userdata.email = user.email;
            $scope.createFunc();
            $scope.loadFunc();
            var refPath = "/user/" + $.trim( $scope.userdata.userID ) + "/skills";
            $scope.skillList = [];
            $scope.skillList = $firebaseArray(firebase.database().ref(refPath));

        } else {
            window.location.href= "login.html";
        }
    });

    $scope.joined = "";
    var userID = $scope.userdata.userID;
    var refPath = "/user/" + userID;
    retrieveOnceFirebase(firebase, refPath, function(data) {
            if (data.child("joinedTeam").val() != null ) {
                $scope.joined = data.child("joinedTeam").val();
            }
            $scope.$apply();
    });
    $scope.createFunc = function() {
        var userID = $.trim( $scope.userdata.userID );
        var userName = $.trim( $scope.userdata.userName );
        var photoURL = $.trim( $scope.userdata.photoURL );
        var email = $.trim( $scope.userdata.email );
        if ( userID !== '' && userName !== '' ) {
            var newData = {
                'name': userName,
                'photoURL': photoURL,
                'email': email

            };
            var refPath = "/user/" + userID;
            var ref = firebase.database().ref(refPath);
            ref.update(newData, function(){
                // Complete call back
                //alert("data pushed...");

                // Finally, go back to the front-end
                //window.location.href= "index.html";
                console.log("Create data")
            });
        }
    }

    $scope.loadFunc = function() {
        var userID = $scope.userdata.userID;
        if ( userID !== '' ) {
            var refPath = "/user/" + userID;
            retrieveOnceFirebase(firebase, refPath, function(data) {
                if (data.child("description").val() != null ) {
                    $scope.userdata.description = data.child("description").val();
                }
                else {
                    $scope.userdata.description = "";
                }
                if (data.child("skills").val() != null ) {
                    $scope.userdata.skills = data.child("skills").val();
                }
                else {
                    $scope.userdata.skills = {};
                }
                $scope.$apply();
            });
        }
    }
    $scope.savedescription = function() {
        var userID = $.trim( $scope.userdata.userID );
        if ( userID !== '') {
            var newData = {
                'description': $scope.userdata.description
            };
            var refPath = "/user/" + userID;
            var ref = firebase.database().ref(refPath);
            ref.update(newData, function(){
                // Complete call back
                //alert("data pushed...");

                // Finally, go back to the front-end
                //window.location.href= "index.html";
                console.log("Save data")
            });
        }
    }
    $scope.addskill = function() {
        var userID = $.trim( $scope.userdata.userID );
        var skillName = $.trim( $scope.skillname );
        skillName = skillName.toUpperCase();
        if ( userID !== '' && skillName !=='' && $scope.userdata.skills[skillName] == null) {
                var newData = {
                    'agree' : "0",
                    'total' : "0",
                    'percent' : "--"

                };
                $scope.userdata.skills[skillName] = newData;
                var refPath = "/user/" + userID + "/skills/" + skillName;
                var ref = firebase.database().ref(refPath);
                ref.update(newData, function(){
                    // Complete call back
                    //alert("data pushed...");

                    // Finally, go back to the front-end
                    //window.location.href= "index.html";
                    console.log("Save data")
                });
            }


    }
    $scope.removeskill = function(t) {
        //var skillName = $.trim( t );
        delete $scope.userdata.skills[t.$id];
        var userID = $.trim( $scope.userdata.userID );
    //var userName = $.trim( $scope.userName );

        if ( userID !== '') {
            var newData = {
                'skills': $scope.userdata.skills
            };
            var refPath = "/user/" + userID;
            var ref = firebase.database().ref(refPath);
            ref.update(newData, function(){
                // Complete call back
                //alert("data pushed...");

                // Finally, go back to the front-end
                //window.location.href= "index.html";
                console.log("Save data")
            });

        }

    }

}]);
