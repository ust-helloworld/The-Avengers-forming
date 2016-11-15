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

        it('refreshViewRequestsReceived for requests', function() {
			$scope.requests = [];
			$scope.param.teamName = 'abc';
			var test = {'$id': 'a', 'selection': ['abc']};
			$scope.member = [test];
			$scope.refreshViewRequestsReceived();
			expect($scope.requests.length).toEqual(1);
        });

        it('refreshViewRequestsReceived for mergerequests', function() {
			$scope.mergeRequestReceived = [];
			$scope.param.teamName = 'abc';
			var test = {'$id': 'a', 'mergeRequests': ['abc']};
			$scope.team = [test];
			$scope.refreshViewRequestsReceived();
			expect($scope.mergeRequestReceived.length).toEqual(1);
        });

        it('changeCurrentTeamSize', function() {
			$scope.param.currentTeamSize = 1;
			$scope.range = {'minTeamSize': 1, 'maxTeamSize': 10}
			$scope.changeCurrentTeamSize(1);
			expect($scope.param.currentTeamSize).toEqual(2);
        });

        it('saveFunc', function() {
			$scope.param.teamName = "aaa";
			$scope.saveFunc();
			expect(firebase.database().ref($scope.refPath)).toBeDefined();
        });

        it('processRequest & removeMember', function() {
			$scope.param.teamMembers = ["abc"];
			$scope.param.currentTeamSize = 3;
			var test = "cde";
			$scope.processRequest(test);
			expect($scope.param.teamMembers.length).toEqual(2);
        });

        it('removeMember', function() {
			$scope.param.teamMembers = ["abc", "cde"];
			var test = "cde";
			$scope.removeMember(test);
			expect($scope.param.teamMembers.length).toEqual(1);
        });

        it('teamMergeRequest with no team member', function() {
			var test = {};
			$scope.teamMergeRequest(test);
			expect(test.teamMembers.length).toEqual(0);
        });

        it('teamMergeRequest with team members', function() {
			$scope.mergeSelection = [];
			var test = {$id: "a",teamMembers: ["a1", "a2"], size: 7};
			$scope.param.teamMembers = ["a3", "a4"];
			$scope.teamMergeRequest(test);
			expect($scope.mergeSelection.length).toEqual(1);
        });

        it('processMergeRequest', function() {
			$scope.mergeSelection = [];
			var test = {$id: "a",teamMembers: ["a1", "a2"], size: 7};
			$scope.param.teamMembers = ["a3", "a4"];
			$scope.processMergeRequest(test);
			expect($scope.param.teamMembers.length).toEqual(4);
        });

});
