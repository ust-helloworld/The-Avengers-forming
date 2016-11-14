//
// Raymond's work
//
'use strict';

describe('teamform-member-app module', function() {
    var MemCtrl, $scope;
	beforeEach(module('teamform-member-app'));
	beforeEach(inject(function($rootScope, $controller) {
		$scope = $rootScope.$new();
		MemCtrl = $controller('MemberCtrl', {$scope: $scope});
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



});
