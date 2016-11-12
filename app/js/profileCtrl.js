var app = angular.module('profileApp', ["firebase"]);

app.controller('DetailsController',

  function($scope,$firebaseArray){
	initalizeFirebase();
    // sync with firebaseArray

    var ref = firebase.database().ref("DEMO/member");// 抄左angular js 的structure

    $scope.member = $firebaseArray(ref);//firebase copy the data to view also link it to firebase blinding firebase to model

    $scope.memberName='name';

  }
);
