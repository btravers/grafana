define([
	'angular',
	'lodash',
	'kbn',
	'./gfunc'
],
function (angular, _, kbn, gfunc) {
	'use strict';

	var module = angular.module('grafana.controllers');
	var metricList = null;
	var tenantList = null;
	var targetLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	module.controller('BluefloodCtrl', function($scope, $timeout) {

		$scope.init = function() {
			$scope.target.errors = validateTarget($scope.target);
			
			$scope.targetLetters = targetLetters;

			$scope.functions = [];
						
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

		$scope.addFunction = function(funcDef) {
			var newFunc = gfunc.createFuncInstance(funcDef, { withDefaultParams: true });
			newFunc.added = true;
			if (!$scope.target.functions) {
				$scope.target.functions = [];
			}
			$scope.target.functions.push(newFunc);
			$scope.moveAliasFuncLast();
			if (!$scope.target.tenant || !$scope.target.metric) {
				$scope.target.hideDataField = true;
			}
			if (!newFunc.params.length && newFunc.added) {
				$scope.targetBlur();
			}
		};

		$scope.moveAliasFuncLast = function() {
			var aliasFunc = _.find($scope.target.functions, function(func) {
				return func.def.name === 'alias' ||
					func.def.name === 'aliasByNode' ||
					func.def.name === 'aliasByMetric';
			});
			if (aliasFunc) {
				$scope.target.functions = _.without($scope.target.functions, aliasFunc);
				$scope.target.functions.push(aliasFunc);
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