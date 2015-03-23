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

			var series = transformTargets(targets);

			if (series.length == 0) {
				return new Promise(function(resolve) {
					resolve([]);
				});
			}

			
			var options = {
				method: 'POST',
				url: '/stats',
				data: {
					from: from,
					to: to,
					maxDataPoints: points,
					targets: series
				}
			}
			options.url = this.url + options.url;
			

			return $http(options).then(function (result) {
				var data = [];
				if (result != null) {
					data = result.data;
				}

				return {
					data: _.flatten(data)
				};
			});
		};

		function transformTargets(targets) {
			var result = [];

			for (var i=0; i<targets.length; i++) {
				if (!targets[i].hide) {
					var tmp = buildTargetQuery(targets[i], targets);
					result = result.concat(tmp);
				}
			}

			return result;
		}

		function buildTargetQuery(target, targets) {
			var seriesRefLetters = [
				'#A', '#B', '#C', '#D',
				'#E', '#F', '#G', '#H',
				'#I', '#J', '#K', '#L',
				'#M', '#N', '#O', '#P',
				'#Q', '#R', '#S', '#T',
				'#U', '#V', '#W', '#X',
				'#Y', '#Z'
			];
			var result = [];

			if (target.tenant && target.metric) {
				var metric = {
					tenantId: target.tenant,
					metricName: target.metric
				};
				if (target.functions && target.functions.length != 0) {
					for (var i=0; i<target.functions.length; i++) {
						var params = [];
						params.push(metric);

						for (var j=0; j<target.functions[i].params.length; j++) {
							var regex = /(\#[A-Z])/g;
							var match = regex.exec(target.functions[i].params[j]);
							if (match) {
								var rg = seriesRefLetters.indexOf(match[0]);
								if (rg < targets.length && rg>=0) {
									var paramQuery = buildTargetQuery(targets[rg], targets);
									params = params.concat(paramQuery);
								}
							} else {
								params.push({
									constantParam: target.functions[i].params[j]
								});
							}
						}

						result.push({
							name: target.functions[i].def.shortName,
							parameters: params
						});
					}

				} else {
					result.push(metric);
				}
			} else if (target.functions && target.functions.length != 0) {
				for (var i=0; i<target.functions.length; i++) {
					var params = [];

					for (var j=0; j<target.functions[i].params.length; j++) {
						var regex = /(\#[A-Z])/g;
						var match = regex.exec(target.functions[i].params[j]);
						if (match) {
							var rg = seriesRefLetters.indexOf(match[0]);
							if (rg < targets.length && rg>=0) {
								var paramQuery = buildTargetQuery(targets[rg], targets);
								params = params.concat(paramQuery);
							}
						} else {
							params.push({
								constantParam: target.functions[i].params[j]
							});
						}
					}

					result.push({
						name: target.functions[i].def.shortName,
						parameters: params
					});
				}
			} 

			return result;
			
		}

	
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

		return BluefloodDatasource;

	});
});
