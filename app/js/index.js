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

	var refPath, ref, eventName;

	$scope.userdata = {};
	$scope.skillname = "";

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
			$scope.setting();

		} else {
			window.location.href= "login.html";
		}
	});

	$scope.setting = function() {
		$scope.param = {
			minTeamSize : 4,
			maxTeamSize : 10,
			description : "",
			imgURL : "",
			owner : $scope.userdata.userID,
			requiredSkill : []
		};
		$scope.eventName = "";
		$scope.requiredSkillname = "";
		//document.getElementById("js-upload-files") = null;
	}

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
				if (data.child("joinedTeam").val() != null ) {
					$scope.userdata.joined = data.child("joinedTeam").val();
				}
				else {
					$scope.userdata.joined = "";
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
					'agree' : 0,
					'total' : 0,
					'percent' : 0

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
		if (confirm("Are you sure to delete this skill?") == true) {
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

	}
	
	$scope.changeMinTeamSize = function(delta) {
		var newVal = $scope.param.minTeamSize + delta;
		if (newVal >=1 && newVal <= $scope.param.maxTeamSize ) {
			$scope.param.minTeamSize = newVal;
		} 
	}

	$scope.changeMaxTeamSize = function(delta) {
		var newVal = $scope.param.maxTeamSize + delta;
		if (newVal >=1 && newVal >= $scope.param.minTeamSize ) {
			$scope.param.maxTeamSize = newVal;
		} 
	}
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
	}

	$scope.addrequiredSkill = function() {
		var Add = $scope.requiredSkillname.toUpperCase();
		if ($scope.requiredSkillname !== "" && $scope.param.requiredSkill.indexOf(Add) < 0) {
			$scope.param.requiredSkill.push(Add);
			//$scope.saveFunc();
		}
		
	}

	$scope.removerequiredSkill = function(t) {
		var index = $scope.param.requiredSkill.indexOf(t);
		if ( index > -1 ) {
			$scope.param.requiredSkill.splice(index, 1); // remove that item
			//$scope.saveFunc();
		}
		
	}

	$scope.saveFunc = function() {
		var checkPath = "/event";
		$scope.checkList = [];
		$scope.checkList = $firebaseArray(firebase.database().ref(checkPath));
		var new_name = true;
		var name = $scope.eventName;
		var newdata = $scope.param;
		$scope.checkList.$loaded().then(function(data) {
			for (i = 0; i < $scope.checkList.length; i++)
			{
				if ($scope.checkList[i].$id == name)
				{
					new_name = false;
				}
			}
			if (name !== "" && new_name)
			{
				console.log("click saved!!");
				console.log(newdata);
				refPath = "/event/"+name+"/admin/param";
				firebase.database().ref(refPath).update(newdata);
			}
			else
			{
				alert("Invalid input or Event name already exists!")
			}
		})
	}

}]);
