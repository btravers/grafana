define([
	'angular',
	'lodash',
	'kbn',
	'./bluefloodCtrl',
	'./addBluefloodFunc',
	'./funcEditor'
],
function (angular, _, kbn) {
	'use strict';

	var module = angular.module('grafana.services');

	module.factory('BluefloodDatasource', function ($q, $http) {
		
		function BluefloodDatasource (datasource) {
			this.type = 'blueflood';
			this.name = datasource.name;
			this.url = datasource.url;
			
			this.supportMetrics = true;
			this.editorSrc = 'plugins/blueflood/editor.html';
		}


		/////////////////////////////////////////////////////////////////////////
		/// Query
		/////////////////////////////////////////////////////////////////////////

		BluefloodDatasource.prototype.query = function (options) {
			var from = convertToBluefloodTime(options.range.from);
			var to = convertToBluefloodTime(options.range.to);
			var targets = options.targets;

			var promises = [];

			angular.forEach(targets, function (target) {
				if (target.tenant && target.metric && !target.hide) {
					var options = {
						method: 'GET',
						url: '/v2.0/' + target.tenant + '/views/' + target.metric,
						params: {
							from: from,
							to: to,
							resolution: "FULL"
						}
					}
					options.url = this.url + options.url;

/*
					if (target.aggregators && target.aggregators.length != 0) {
						options.select = target.aggregators.join();
					}
*/
					promises.push($http(options).then(handleBluefloodQueryResponse));
				}
			}, this);

			return $q.all(promises).then(function (responses) {
				var series = [];
				for (var i = 0; i < targets.length; i++) {
					if (targets[i].tenant && targets[i].metric && !targets[i].hide) {
						var target = targets[i].tenant + ':' + targets[i].metric;
						series.push({ target: target, datapoints: responses[i] });
					}
				}

				return {
					data: series
				};
			});
		};


		/////////////////////////////////////////////////////////////////////////
		/// Handle responses
		/////////////////////////////////////////////////////////////////////////

		function handleBluefloodQueryResponse (result) {
			if (!result) {
				return [];
			}

			var datapoints = [];

			angular.forEach(result.values, function (value) {
				var t = value.timestamp;
				var v = value.average;
				datapoints.push([v, t]);
			});

			return datapoints;
		}

	
		/////////////////////////////////////////////////////////////////////////
		/// Suggest tenant and metric
		/////////////////////////////////////////////////////////////////////////

		BluefloodDatasource.prototype.performSuggestMetrics = function(query) {
			var promise = new Promise(function(resolve, reject) {
				resolve([]);
			});
			return promise;
		};

		BluefloodDatasource.prototype.performSuggestTenants = function(query) {
			var promise = new Promise(function(resolve, reject) {
				resolve([]);
			});
			return promise;
		};


		/////////////////////////////////////////////////////////////////////////
		/// Time conversion functions specifics to Blueflood
		/////////////////////////////////////////////////////////////////////////

		function convertToBluefloodTime(date) {
			if (date === 'now') {
				return (new Date()).getTime();
			}

			date = kbn.parseDate(date);

			return date.getTime();
		}

		/////////////////////////////////////////////////////////////////////////

		return BluefloodDatasource;

	});
});
