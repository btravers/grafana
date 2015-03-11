define([
	'angular',
	'lodash',
	'kbn'
],
function (angular, _, kbn) {
	'use strict';

	var module = angular.module('grafana.controllers');

	module.controller('BluefloodCtrl', function($scope, $timeout) {

		$scope.init = function() {
			$scope.target.errors = validateTarget($scope.target);
			$scope.aggregators = ['average', 'min', 'max', 'numPoints'];
						
			$scope.$on('typeahead-updated', function() {
				$timeout($scope.targetBlur);
			});
		};

		$scope.targetBlur = function() {
			$scope.target.errors = validateTarget($scope.target);
			// this does not work so good
			if (!_.isEqual($scope.oldTarget, $scope.target) && _.isEmpty($scope.target.errors)) {
				$scope.oldTarget = angular.copy($scope.target);
				$scope.get_data();
			}
		};

		$scope.duplicate = function() {
			var clone = angular.copy($scope.target);
			$scope.panel.targets.push(clone);
		};

		$scope.removeDataQuery = function(target) {
			$scope.functions = _.without($scope.functions, target);
			$scope.targetBlur();
		};

		$scope.suggestMetrics = function(query, callback) {
			$scope.datasource.performSuggestMetrics(query).then(callback);
		};

		$scope.suggestTargets = function(query, callback) {
			$scope.datasource.performSuggestTargets(query).then(callback);
		};

		function validateTarget(target) {
			var errs = {};

			if (!target.metric) {
				errs.metric = "You must supply a metric name.";
			}

			if (!target.tenant) {
				errs.tenant = "You must supply a tenant name.";
			}

			return errs;
		}		

	});
});