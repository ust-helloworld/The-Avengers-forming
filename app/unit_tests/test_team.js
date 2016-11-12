//
// Raymond's work
//
'use strict';

describe('teamform-team-app module', function() {
    var TeamCtrl, $scope;
	beforeEach(module('teamform-team-app'));
	beforeEach(inject(function($rootScope, $controller) {
		$scope = $rootScope.$new();
		TeamCtrl = $controller('TeamCtrl', {$scope: $scope});
}));

        it('refreshViewRequestsReceived', function() {
			$scope.requests = [];
			$scope.param.teamName = 'abc';
			var test = {'$id': 'a', 'selection': ['abc']};
			$scope.member = [test];
			$scope.refreshViewRequestsReceived();
			expect($scope.requests.length).toEqual(1);
        });

        it('changeCurrentTeamSize', function() {
			$scope.param.currentTeamSize = 1;
			$scope.range = {'minTeamSize': 1, 'maxTeamSize': 10}
			$scope.changeCurrentTeamSize(1);
			expect($scope.param.currentTeamSize).toEqual(2);
        });


        it('processRequest', function() {
        	//$scope.param.teamName = "aaa";
			$scope.param.teamMembers = ["abc"];
			$scope.param.currentTeamSize = 3;
			var test = "cde";
			$scope.processRequest(test);
			expect($scope.param.teamMembers.length).toEqual(2);
        });

        it('removeMember', function() {
        	//$scope.param.teamName = "aaa";
			$scope.param.teamMembers = ["abc", "cde"];
			var test = "cde";
			$scope.removeMember(test);
			expect($scope.param.teamMembers.length).toEqual(1);
        });


});
