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
			var points = options.maxDataPoints;

			var promises = [];

			angular.forEach(targets, function (target) {
				if (target.tenant && target.metric && !target.hide) {
					var options = {
						method: 'GET',
						url: '/v2.0/' + target.tenant + '/views/' + target.metric,
						params: {
							from: from,
							to: to,
							points: points
						}
					}
					options.url = this.url + options.url;

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

			angular.forEach(result.data.values, function (value) {
				var t = value.timestamp;
				var v = value.average;
				this.push([v, t]);
			}, datapoints);

			return datapoints;
		}

	
		/////////////////////////////////////////////////////////////////////////
		/// Suggest tenant and metric
		/////////////////////////////////////////////////////////////////////////

		BluefloodDatasource.prototype.performSuggestMetrics = function(query) {
			console.log('performSuggestMetrics');
			var promise = new Promise(function(resolve, reject) {
				console.log("Promise");
				resolve(["Blabla", "Truc"]);
			});
			return promise;
		};

		BluefloodDatasource.prototype.performSuggestTenants = function(query) {
			console.log('performSuggestTenants');
			var promise = new Promise(function(resolve, reject) {
				console.log("Promise");
				resolve(["Yolo", "Swag"]);
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
		/// Aggregation
		/////////////////////////////////////////////////////////////////////////

		BluefloodDatasource.prototype._seriesRefLetters = [
			'#A', '#B', '#C', '#D',
			'#E', '#F', '#G', '#H',
			'#I', '#J', '#K', '#L',
			'#M', '#N', '#O', '#P',
			'#Q', '#R', '#S', '#T',
			'#U', '#V', '#W', '#X',
			'#Y', '#Z'
		];

		/////////////////////////////////////////////////////////////////////////

		return BluefloodDatasource;

	});
});
