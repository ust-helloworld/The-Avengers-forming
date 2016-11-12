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


});
var app = angular.module('indexApp', ["firebase"]);

    app.controller('indexController',

      function($scope,$firebaseArray){
    	initalizeFirebase();
        // sync with firebaseArray

        var ref = firebase.database().ref("fir-8b63f");// 抄左angular js 的structure

        $scope.event = $firebaseArray(ref);//firebase copy the data to view also link it to firebase blinding firebase to model



      }
    );
