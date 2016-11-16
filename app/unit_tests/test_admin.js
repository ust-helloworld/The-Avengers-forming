//
// Raymond's work
//
'use strict';

describe('teamform-admin-app module', function() {
    var AdminCtrl, $scope;
	beforeEach(module('teamform-admin-app'));
	beforeEach(inject(function($rootScope, $controller) {
		$scope = $rootScope.$new();
		AdminCtrl = $controller('AdminCtrl', {$scope: $scope});
    }));
	  	  
        it('changeMinTeamSize', function() {
            $scope.param.minTeamSize = 1;
            $scope.param.maxTeamSize = 10;
            $scope.changeMinTeamSize(1);
			expect($scope.param.minTeamSize).toEqual(2);
        });
	  	  
        it('changeMaxTeamSize', function() {
            $scope.param.minTeamSize = 1;
            $scope.param.maxTeamSize = 10;
            $scope.changeMaxTeamSize(1);
			expect($scope.param.maxTeamSize).toEqual(11);
        });
/*  	  
        it('saveFunc', function() {
            $scope.saveFunc();
			expect($scope.param.$save()).toBeDefined();
        });
*/
});
