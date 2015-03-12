define([
	'angular',
	'lodash',
	'kbn'
],
function (angular, _, kbn) {
	'use strict';

	var module = angular.module('grafana.controllers');
	var metricList = null;
	var tenantList = null;
	var targetLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	module.controller('BluefloodCtrl', function($scope, $timeout) {

		$scope.init = function() {
			$scope.target.errors = validateTarget($scope.target);
			$scope.aggregators = [
				{id: 'average', label: 'average'}, 
				{id: 'min', label: 'max'}, 
				{id: 'max', label: 'max'}, 
				{id: 'numPoints', label: 'numPoints'}
			];
			$scope.aggregatorsettings = {
				smartButtonMaxItems: $scope.aggregators.length,
				smartButtonTextConverter: function(itemText, originalItem) {
			        return itemText;
			    },
			    scrollableHeight: '200px',
    			scrollable: true
			};
			$scope.aggregatortext = {buttonDefaultText: 'Functions'};

			$scope.targetLetters = targetLetters;
						
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

		$scope.moveMetricQuery = function(fromIndex, toIndex) {
			_.move($scope.panel.targets, fromIndex, toIndex);
		};

		$scope.removeDataQuery = function(target) {
			var rg = $scope.panel.targets.indexOf(target);
			if (rg > -1) {
				$scope.panel.targets.splice(rg, 1);
			}
			$scope.targetBlur();
		};

		$scope.updateMetricList = function(query) {
			$scope.metricListLoading = true;
			metricList = [];
			$scope.datasource.performSuggestMetrics(query).then(function(series) {
				metricList = series;
				$scope.metricListLoading = false;
				return metricList;
			});
		};

		$scope.suggestMetrics = function(query, callback) {
			if (!metricList) {
				$scope.updateMetricList(query);
			} else {
				callback(metricList);
			}
		};

		$scope.updateTenantList = function(query) {
			$scope.tenantListLoading = true;
			tenantList = [];
			$scope.datasource.performSuggestTenants(query).then(function(series) {
				tenantList = series;
				$scope.tenantListLoading = false;
				return tenantList;
			});
		};

		$scope.suggestTenant = function(query, callback) {
			if (!tenantList) {
				$scope.updateTenantList(query);
			} else {
				callback(tenantList);
			}
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