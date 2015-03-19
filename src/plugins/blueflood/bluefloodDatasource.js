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

			var series = [];
			angular.forEach(targets, function (target) {
				if (target.tenant && target.metric && !target.hide) {
					series.push({
						tenantId: target.tenant,
						metricName: target.metric
					});
				}
			}, this);

			var options = {
				method: 'POST',
				url: '/stats' + target.tenant + '/views/' + target.metric,
				data: {
					from: from,
					to: to,
					maxDataPoints: points,
					targets: series
				}
			}
			options.url = this.url + options.url;

			return $http(options).then(function (result) {
				return {
					data: result
				}
			});
		};

	
		/////////////////////////////////////////////////////////////////////////
		/// Suggest tenant and metric
		/////////////////////////////////////////////////////////////////////////

		BluefloodDatasource.prototype.performSuggestMetrics = function(query) {
			var promise = new Promise(function(resolve, reject) {
				resolve(["Blabla", "Truc"]);
			});
			return promise;
		};

		BluefloodDatasource.prototype.performSuggestTenants = function(query) {
			var promise = new Promise(function(resolve, reject) {
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
