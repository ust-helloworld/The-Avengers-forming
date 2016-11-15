//
// Raymond's work
//
'use strict';

describe('teamform-member-app module', function() {
    var MemCtrl, $scope, $firebaseObject, $firebaseArray, $q;
	beforeEach(module('teamform-member-app'));
	beforeEach(inject(function($rootScope, $controller, _$firebaseObject_, _$firebaseArray_) {
		$scope = $rootScope.$new();
		$firebaseObject = _$firebaseObject_;
		$firebaseArray = _$firebaseArray_;
		MemCtrl = $controller('MemberCtrl', {$scope: $scope, $firebaseObject: _$firebaseObject_, $firebaseArray: _$firebaseArray_});
    }));

        it('saveFunc', function() {
            $scope.userID = "abc";
            $scope.userName = "abc";
            $scope.saveFunc();
			expect(firebase.database().ref($scope.refPath)).toBeDefined();
        });

		it('toggleSelection with idx < -1', function() {
			$scope.selection = [];
			var test = "abc";
            $scope.toggleSelection(test);
			expect($scope.selection.length).toEqual(1);
        });

        it('toggleSelection with idx > -1', function() {
			$scope.selection = ["abc"];
			var test = "abc";
            $scope.toggleSelection(test);
			expect($scope.selection.length).toEqual(0);
        });

        it('authcheck', function() {
            $scope.authcheck(null);
            expect($scope.userName).toEqual("Please log in");
        });

        it('authcheck', function() {
            var test = {uid: "a", displayName: "a"};
            $scope.authcheck(test);
            expect($scope.userName).toEqual("a");
        });

        it('refreshReceived', function() {
            $scope.invitationByTeams = [];
            $scope.userID = "a";
            var test = {invitationRequests: ["a"]};
            $scope.team = [test];
            $scope.refreshReceived();
            expect($scope.invitationByTeams.length).toEqual(1);
        });

});
