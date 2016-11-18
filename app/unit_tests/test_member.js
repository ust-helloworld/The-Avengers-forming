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
            //$scope.refPath = "/event/"+ getURLParameter("q") + "/member/" + $scope.userID;
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
/*
        it('loadFunc', function(done) {
            var userID = "abc";
            var refPath = "/event/"+ getURLParameter("q") + "/member/" + userID;
            var ref = firebase.database().ref(refPath);
            ref.set({userID: "abc", userName: "abc",selection: []});
            var query = ref.limitToLast(3); 
            var obj = $firebaseObject(query);  // create a firebase object
            obj.loadFunc();
            obj.$loaded().then(function () {  // the callback function

            // The remaining part will only be executed when the Firebase server returns an object

            expect(obj.userName).toBe("");  // we only test the value when the firebase object is ready
            });
        });
*/
});
