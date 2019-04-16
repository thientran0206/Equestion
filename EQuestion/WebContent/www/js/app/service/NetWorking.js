/**
 * Created by docdoku on 17/03/15.
 */
define(['handlebars',
        'pathparser',
        'q',
        'service/JsonProcessing',
        'jquery','jquery.mobile','datepicker'],
        function (Handlebars, PathParser, Q, JsonProcessing, $) {

	var NetWorking = function () {

		var body = $('body');

		// Allow us to know if there are many loader charged.
		var loaderUp = 0;
		/*
		 * GET AJAX REST CALLS
		 *
		 *
		 */
		this.getFlights = function (route) {
			var url = App.paths.BASE_URL_API + route;
			console.log("Call... " + url);
			var deferred = Q.defer();
			ajaxGetJson(url).success(
					function(response) {
						// Get flight list
						var jsonData = sortFlightList(App.jsonProcessor.processFlightList(response));
						var timestamp = new Date().getTime();
						jsonData.creationTimestamp = timestamp;
						//App.network.storeFlightJson(route,jsonData);
						deferred.resolve(jsonData);
					}
			).error(
					function() {
						var jsonData = JSON.parse(localStorage.getItem(route));
						if (jsonData === null) {
							deferred.reject();
						} else {
							deferred.reject(jsonData);
						}
					}
			);
			return deferred.promise;
		};

		this.getFlightsForGlobalPart = function (route, id) {
			var url = App.paths.BASE_URL_API + route;
			console.log("Call... " + url);
			var deferred = Q.defer();
			ajaxGetJson(url).success(
					function(response) {
						// Get flight list
						var jsonData = App.jsonProcessor.processFlightList(response);
						deferred.resolve([jsonData, id]);
					}
			).error(
					function() {
						deferred.reject();
					}
			);
			return deferred.promise;
		};

		this.getGlobalMessages = function(route) {
			var url = App.paths.BASE_URL_API + route;
			console.log("Call... " + url);
			var deferred = Q.defer();
			ajaxGetJson(url).success(
					function(response) {
						// Get flight list
						var jsonData = App.jsonProcessor.processGlobalParticularities(response);
						deferred.resolve(jsonData);
					}
			).error(
					function() {
						deferred.reject();
					}
			);
			return deferred.promise;
		};

		this.getMessagesForFlightDetail = function(arrayPromises){
			var route = arrayPromises[0];
			var splitted = arrayPromises[0].split(":");
			var date = splitted[splitted.length - 1];
			var url = App.paths.BASE_URL_API + App.routes.GLOBAL_PARTICULARITIES + "?date=" + date;
			var json = arrayPromises[1];
			console.log("Call ..." + url);

			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function(response) {
						// store merged json
						console.log("response..." + JSON.stringify(response));
						var mergedJson = endPrepareJsonForGlobalMessages(json,response);
						App.network.storeFlightJson(route,mergedJson);
						deferred.resolve([route,mergedJson]);
					}
			).error(
					function() {
						deferred.reject(route);
					}
			);
			return deferred.promise;

		};


		this.getFlightsCustomerData = function(json, date) {

			var url = "";
			if(typeof date === "undefined"){
				url = App.paths.BASE_URL_API + App.routes.FLIGHTS_CUSTOMER_DATA + "?date=" + App.currentDate;
			} else {
				url = App.paths.BASE_URL_API + App.routes.FLIGHTS_CUSTOMER_DATA + "?date=" + date;
			}

			console.log("Call... " + url);

			var route = "";
			if(typeof date === "undefined"){
				route = App.routes.FLIGHTS + App.routes.DATE_PARAM + App.currentDate;
			} else {
				route = App.routes.FLIGHTS + App.routes.DATE_PARAM + date;
			}


			var deferred = Q.defer();
			ajaxGetJson(url).success(
					function(response) {
						var mergedJson = endPrepareJsonForFlightsCustomerData(json,response);
						var jsonData = sortFlightListPNC(mergedJson);
						App.network.storeFlightJson(route,jsonData);
						deferred.resolve(jsonData);
					}
			).error(
					function() {
						var json = JSON.parse(localStorage.getItem(route));
						deferred.reject(json);
					}
			);
			return deferred.promise;

		};



		this.getFlightDetails = function (arrayPromises) {

			var route = arrayPromises[0];
			var dbLink = arrayPromises[1];

			var url = App.paths.BASE_URL_API + route;
			var vPhySap = null;

			if (App.bufferArmement[0].planDotations.length > 0) {
				vPhySap = App.bufferArmement[0].planDotations[0].vphysap;
			}

			var queryUri = '';
			if (vPhySap != null) {
				queryUri+= "&vphysap="+vPhySap;
			}
			if(typeof dbLink !==  "undefined" && dbLink != null){
				queryUri+= "&dbLinkName="+dbLink;
			}

			if(queryUri) {
				queryUri = queryUri.replace('&', '?');
				url += queryUri;
			}

			console.log("Call... " + url);
			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function (response) {
						App.jsonProcessor.processFlightDetail(response);
						// get last synchronize time
						App.lastSynchroTime = App.network.getLastSynchroTime();
						Handlebars.Utils.extend(response, {lastSynchroTime: App.lastSynchroTime});

						if (dbLink != null) {
							Handlebars.Utils.extend(response, {dbLinkName: dbLink});
						}

						storeJsonForFlightDetails(response);
						deferred.resolve([route, response]);
					}
			).error(
					function () {
						deferred.reject(route);
					}
			);
			return deferred.promise;
		};

		this.getFlightUpdateDetails = function (arrayPromises) {
			var route = arrayPromises[0];
			var json = arrayPromises[1];

			var userProfile = JSON.parse(localStorage.getItem(App.keys.KEY_STORAGE_PROFILE));

			var url = App.paths.BASE_URL_API + route + App.routes.SUFFIX_AJU;


			var vPhySap = null;
			if (App.bufferArmement[0].planDotations.length > 0) {
				vPhySap = App.bufferArmement[0].planDotations[0].vphysap;
			}

			if (vPhySap != null) {
				url += "&vphysap="+vPhySap;
			}

			if (userProfile.role == App.roles.PNC) {
				url += "&dbLinkName="+json.dbLinkName;
			}

			console.log("Call... " + url);
			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function (response) {
						var mergedJson = endPrepareDetailsUpdateAju(route,response);
						//storeJsonForFlightDetails(mergedJson);
						deferred.resolve(mergedJson);
					}
			).error(
					function () {
						deferred.reject(route);
					}
			);
			return deferred.promise;
		};

		this.getCustomerDataUpdate = function(arrayPromises) {
			var route = arrayPromises[0];
			var json = arrayPromises[1];

			var url = App.paths.BASE_URL_API + route + App.routes.CUSTOMER_DATA_PATH_PARAM;
			console.log("Call... " + url);
			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function(response) {
						// store merged json
						var mergedJson = endPrepareJsonForFlight(json,response);
						App.network.storeFlightJson(route,mergedJson);
						deferred.resolve(route);
					}
			).error(
					function() {
						deferred.resolve(route);
					}
			);
			return deferred.promise;
		};

		this.getCustomerData = function(arrayPromises) {
			var route = arrayPromises[0];
			var json = arrayPromises[1];
			var url = App.paths.BASE_URL_API + route + App.routes.CUSTOMER_DATA_PATH_PARAM;
			console.log("Call... " + url);
			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function(response) {
						// store merged json
						console.log("response... "  + JSON.stringify(response));

						var mergedJson = endPrepareJsonForFlight(json,response);
						App.network.storeFlightJson(route,mergedJson);
						deferred.resolve([route,mergedJson]);
					}
			).error(
					function() {
						deferred.reject(route);
					}
			);
			return deferred.promise;
		};

		this.getCheckPointsUpdate = function(arrayPromises) {
			var route = arrayPromises[0];
			var json = arrayPromises[1];

			var url = App.paths.BASE_URL_API + route + App.routes.CHECK_POINTS_UPDATE;
			console.log("Call... " + url);
			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function(response) {
						// store merged json
						console.log("response... " + JSON.stringify(response));
						var mergedJson = endPrepareJsonCheckPointsUpdate(json,response);
						storeJsonForFlightDetails(mergedJson);
						deferred.resolve([route, mergedJson]);
					}
			).error(
					function() {
						deferred.reject(route);
					}
			);
			return deferred.promise;
		};

		var endPrepareJsonCheckPointsUpdate = function(json, checkpoints) {
			json.customerData.checkPoints = checkpoints;
			return json;
		};

		this.getGapsUpdate = function(arrayPromises) {
			var route = arrayPromises[0];
			var json = arrayPromises[1];

			var url = App.paths.BASE_URL_API + route + App.routes.GAPS_UPDATE;
			console.log("Call... " + url);
			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function(response) {
						// store merged json
						console.log("response... " + JSON.stringify(response));
						var mergedJson = endPrepareJsonGapsUpdate(json,response);
						mergedJson = updateJsonWithGap(mergedJson, mergedJson.staticGapTypes);
						storeJsonForFlightDetails(mergedJson);
						deferred.resolve([route, mergedJson]);
					}
			).error(
					function() {
						deferred.reject(route);
					}
			);
			return deferred.promise;
		};

		var endPrepareJsonGapsUpdate = function(json, gaps) {
			json.customerData.gaps = gaps;
			return json;
		};

		this.getCommentStateUpdate = function (arrayPromises) {
			var route = arrayPromises[0];
			var json = arrayPromises[1];

			var url = App.paths.BASE_URL_API + route + App.routes.COMMENT_UPDATE;
			console.log("Call... " + url);
			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function(response) {
						// store merged json
						console.log("response... " + JSON.stringify(response));
						var mergedJson = endPrepareJsonCommentStateUpdate(json,response);
						storeJsonForFlightDetails(mergedJson);
						deferred.resolve([route, json]);
					}
			).error(
					function() {
						deferred.reject(route);
					}
			);
			return deferred.promise;
		};

		var endPrepareJsonCommentStateUpdate = function(json, customerData) {
			var userProfile = JSON.parse(localStorage.getItem(App.keys.KEY_STORAGE_PROFILE));

			if (userProfile.role != App.roles.SUP) {
				json.customerData.comment = customerData.comment;
			}
			json.customerData.state = customerData.state;
			return json;
		};


		this.getCheckPoints = function(arrayPromises) {
			var route = arrayPromises[0];
			var json = arrayPromises[1];

			var url = App.paths.BASE_URL_API + App.routes.CHECK_POINTS_PATH_PARAM;
			console.log("Call... " + url);
			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function(response) {
						// store merged json
						console.log("response... " + JSON.stringify(response));
						var mergedJson = endPrepareJsonForFlightCheckPoints(json,response);
						storeJsonForFlightDetails(mergedJson);
						deferred.resolve([route,mergedJson]);
					}
			).error(
					function() {
						deferred.reject(route);
					}
			);
			return deferred.promise;
		};

		this.getCheckPointLocations = function(arrayPromises) {
			var route = arrayPromises[0];
			var json = arrayPromises[1];

			var url = App.paths.BASE_URL_API + App.routes.CHECK_POINTS_PATH_PARAM_LOCATION;
			console.log("Call.. " + url);

			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function(response) {
						// store merged json
						var mergedJson = endPrepareJsonForFlightCheckPointLocations(json,response);
						storeJsonForFlightDetails(mergedJson);
						deferred.resolve([route,mergedJson]);
					}
			).error(
					function() {
						deferred.reject(route);
					}
			);
			return deferred.promise;
		};



		this.getStaticGapTypes = function(arrayPromises) {
			var route = arrayPromises[0];
			var json = arrayPromises[1];

			var url = App.paths.BASE_URL_API + App.routes.GAP_TYPES_PATH_PARAM;
			console.log("Call.. " + url);

			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function(response) {
						// store merged json
						var mergedJson = endPrepareJsonForFlightGapTypes(json,response);
						storeJsonForFlightDetails(mergedJson);
						deferred.resolve(mergedJson);
					}
			).error(
					function() {
						deferred.reject(route);
					}
			);
			return deferred.promise;
		};

		this.getPlanArmementWithoutDotationCallWS = function(route, dblink) {
			var url = App.paths.BASE_URL_API + route.replace("flights","armements");

			console.log("Call... " + url);

			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function(response) {

						// Save the response into a temporary variable
						App.bufferArmement = response;
						deferred.resolve([route,dblink]);
					}
			).error(
					function() {
						deferred.reject(route);
					}
			);
			return deferred.promise;
		};

		this.getPlanArmementWithoutDotation = function (arrayPromises) {
			var route = arrayPromises[0];
			var json = arrayPromises[1];

			var url = App.paths.BASE_URL_API + route.replace("flights","armements");

			var deferred = Q.defer();

			var response = App.bufferArmement;

			var mergedJson = endPrepareJsonForFlightPlanArmement(json,response);
			App.network.storeFlightJson(route,mergedJson);
			deferred.resolve([route,mergedJson]);

			return deferred.promise;
		};

		var endPrepareJsonForFlightPlanArmement = function(master,plan) {

			if (plan[0].planDotations.length > 0) {
				
				var vphysap = plan[0].planDotations[0].vphysap;
				
				//prio with master.vphysap because error in vphysap of Atlas
				if (master.vphysap) vphysap= master.vphysap;
				master.classes.forEach(function (elem, key) {
					if (master.classes[key].hasVersion) {
						return;
					}
					master.classes[key].hasVersion = false;
					var indexClasse = vphysap.indexOf(elem.codeClasse);
					if (indexClasse >= 0) {
						master.classes[key].hasVersion = true;
						var version = vphysap.substring(indexClasse + 1, indexClasse + 4);
						master.classes[key].version = parseInt(version, 10);
					}
				});
			}
			Handlebars.Utils.extend(master, {planArmement: plan});

			// Add an empty tab to the json instead of null which will get to an error
			var arraydotations = {};
			Handlebars.Utils.extend(master,{dotations: arraydotations});

			return master;
		};

		this.getDotation = function (arrayPromises) {
			var route = arrayPromises[0];
			var json = arrayPromises[1];
			var url = App.paths.BASE_URL_API + route.replace("flights","armements") + App.routes.SUFFIX_DOTATION;
			console.log("Call... " + url);

			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function(response) {
						// store merged json
						var mergedJson = endPrepareJsonForFlightDotation(json,response);
						App.network.storeFlightJson(route,mergedJson);
						deferred.resolve(mergedJson);
					}
			).error(
					function() {
						deferred.reject(route);
					}
			);
			return deferred.promise;
		};

		var endPrepareJsonForFlightDotation = function(master, plan) {
			var dotations = [];

			if (plan[0].planDotations.length > 0) {
				dotations = plan[0].planDotations[0].dotations;
			}

			Handlebars.Utils.extend(master, {dotations: dotations});

			var arraydotations = {};

			if (typeof master.ponts !== "undefined" && master.ponts.length != 0) {
				master.ponts.forEach(function (pont, index) {
					var dataArray = [];
					var offices = master.planOffice[index];
					offices.forEach(function (office) {
						var codeOffice = office.codeOffice;
						master.dotations.forEach(function (dotation) {
							office.galleys.forEach(function (galley) {
								if (dotation.codeGalley == galley.codeGalley) {
									Handlebars.Utils.extend(dotation, {codeOffice: codeOffice});
									dataArray.push(dotation);
								}
							});
						});
					});
					arraydotations[pont.nomPont] = dataArray;
				});

				Handlebars.Utils.extend(master, {dotations: arraydotations});
			}

			return master;
		};

		this.getDisconnect = function() {
			var url = App.paths.BASE_URL_API + App.routes.DISCONNECT;
			console.log("Call... " + url);

			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function() {
						deferred.resolve();
					}
			).error(
					function() {
						deferred.reject();
					}
			);
			localStorage.clear();
			return deferred.promise;
		};

		this.getBootDisconnect = function(username) {
			var url = App.paths.BASE_URL_API + App.routes.DISCONNECT;
			var deferred = Q.defer();

			ajaxGetJson(url).success(
					function() {
						console.log("boot disconnect ");
						deferred.resolve(username);
					}
			).error(
					function() {
						console.log("boot disconnect fail");
						deferred.reject();
					}
			);
			return deferred.promise;
		};

		this.getProfile = function(data) {
			var url = App.paths.BASE_URL_API + App.routes.USERS + data;
			console.log("Call... " + url);

			var deferred = Q.defer();
			ajaxGetJson(url).success(
					function(response) {
						console.log("Profile... " + JSON.stringify(response));
						App.network.storeFlightJson(App.keys.KEY_STORAGE_PROFILE, response);
						deferred.resolve(response);
					}
			).fail(
					function() {
						deferred.reject();
					}
			);
			return deferred.promise;
		}.bind(this);

		this.getPlanOffices = function(arrayPromises) {
			var route = arrayPromises[0];
			var json = arrayPromises[1];

			var deferred = Q.defer();
			if (json.planArmement[0].planDotations.length == 0) {
				deferred.resolve(arrayPromises);
				return deferred.promise;
			}
			var codeClient = json.codeClient;
			var codeVap = json.planArmement[0].planDotations[0].codeVap;
			var vphysap = json.planArmement[0].planDotations[0].vphysap;
			// "/offices/AF:GR77W:P008J067W028Y200T"
			var url = App.paths.BASE_URL_API + "/offices/"+codeClient+":"+codeVap+":"+vphysap;
			console.log("Call... " + url);
			ajaxGetJson(url).success(
					function(response) {
						// store merged json
						var mergedJson = endPrepareJsonForFlightPlanOffice(json,response);
						storeJsonForFlightDetails(mergedJson);
						deferred.resolve([route,mergedJson]);
					}
			).error(
					function() {
						deferred.reject(route);
					}
			);
			return deferred.promise;
		};

		this.closeFlight = function(url, data){
			var realUrl = App.paths.BASE_URL_API + url;
			var deferred = Q.defer();

			ajaxPutJson(realUrl, data).success(
					function() {
						// store merged json
						console.log("Call... " + realUrl);
						deferred.resolve();
					}
			).error(
					function() {
						deferred.reject();
					}
			);
			return deferred.promise;
		};

		this.checkIfUpdateToPush = function() {
			var toPush = JSON.parse(localStorage.getItem(App.keys.KEY_TOPUSH));

			var deferred = Q.defer();

			var go = true;

			// If app is run on ipad, check if there is the connection or not
			if (App.network.isMobileOrTablet() && navigator.connection.type == Connection.NONE) {
				go = false;
			}

			// Check if there are any data to update
			if (toPush != null) {
				if (go) {
					console.log("Updating data ...");
					App.network.startLoader();

					// If the promise is resolved
					var shift = function() {
						toPush.shift();
					};

					// Initialising the tab which will contains all the promises to resolves.
					var promises = [];
					var promise;
					toPush.forEach(function(data) {
						// Switch case for the web service that we need to call.
						switch (data.method) {
						case 0:
							// Saving the promise
							promise = function() {
							return App.network.putGap(data.url, data.obj).then(shift);
						};
						// Adding the promise to the tab
						promises.push(promise);
						break;
						case 1:
							promise = function() {
							return App.network.deleteFlightGap(data.url).then(shift);
						};
						promises.push(promise);
						break;
						case 2:
							promise = function() {
							return App.network.putCheckpointData(data).then(shift);
						};
						promises.push(promise);
						break;
						case 3:
							promise = function() {
							return App.network.closeFlight(data.url, data.obj).then(shift);
						};
						promises.push(promise);
						break;
						}
					});

					// All the promises are called sequentially
					var result = promises.reduce(function(promise, item) {
						return promise.then(item);
					}, Q());

					// Check the result
					result.then(function() {
						// All of the promises fulfilled, toPush is removed from the local storage
						localStorage.removeItem(App.keys.KEY_TOPUSH);
						deferred.resolve();
						console.log("Erasing toPush ...");
					}).catch(function() {
						// If one of the promises is rejected, the undones updates are saved in local storage.
						App.network.storeFlightJson(App.keys.KEY_TOPUSH, toPush);
						deferred.reject();
						console.log("Saving toPush ...");
					}).finally(function() {
						App.network.stopLoader();
					});
				} else {
					deferred.reject();
				}
			} else {
				deferred.resolve();
			}

			return deferred.promise;
		};

		this.isMobileOrTablet = function() {
			var check = false;
			(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
			return check;
		};

		this.putGlobalPartData = function(url, data){
			console.log("Call... " + url + " - data : " + JSON.stringify(data));
			var realUrl = App.paths.BASE_URL_API + url;

			var deferred = Q.defer();
			ajaxPutJson(realUrl,data).success(
					function() {
						// store merged json
						console.log("Call... " + realUrl);
						deferred.resolve();
					}
			).error(
					function() {

						// Add this put action (global part) to the list of web services call which haven't been done due to connexion problem.
						//App.jsonProcessor.storeUpdateToPush(realUrl, data, "put");

						deferred.reject();
					}
			);
			return deferred.promise;
		};

		this.postGlobalPartData = function(url, data){
			console.log("Call... " + url + " - data : " + JSON.stringify(data));

			var realUrl = App.paths.BASE_URL_API + url;

			var deferred = Q.defer();
			ajaxPostJson(realUrl,data).success(
					function() {
						// store merged json
						console.log("Call... " + realUrl);
						deferred.resolve();
					}
			).error(
					function() {
						deferred.reject();
					}
			);
			return deferred.promise;
		};

		this.deleteGlobalPartData = function(url){
			console.log("Call... " + url);

			var realUrl = App.paths.BASE_URL_API + url;
			var deferred = Q.defer();

			ajaxDeleteJson(realUrl).success(
					function(){
						deferred.resolve();
					}
			).error(
					function(){
						// Add this delete action (global part) to the list of web services call which haven't been done due to connexion problem.
						App.jsonProcessor.storeUpdateToPush(realUrl, null, "delete");

						deferred.reject();
					});
			return deferred.promise;
		};



		this.deleteFlightGap = function(url){
			console.log("Call... " + url);

			var realUrl = App.paths.BASE_URL_API + url;
			var deferred = Q.defer();

			ajaxDeleteJson(realUrl).success(
					function(){
						deferred.resolve();
					}
			).error(
					function(){

						deferred.reject();
					});
			return deferred.promise;
		};

		var ajaxPutJson = function(url,data) {
			return $.ajax({
				type: 'PUT',
				url: url,
				data: JSON.stringify(data),
				contentType: 'application/json',
				headers: JSON.parse(localStorage.getItem(App.keys.KEY_STORAGE_CREDENTIAL))
			});
		};

		var ajaxGetJson = function(url) {
			return $.ajax({
				type: "GET",
				url: url,
				dataType: 'json',
				headers: JSON.parse(localStorage.getItem(App.keys.KEY_STORAGE_CREDENTIAL))
			});
		};

		var ajaxPostJson = function(url, data) {
			return $.ajax({
				type: "POST",
				url: url,
				data: JSON.stringify(data),
				contentType: 'application/json',
				headers: JSON.parse(localStorage.getItem(App.keys.KEY_STORAGE_CREDENTIAL))
			});
		};

		var ajaxDeleteJson = function(url){
			return $.ajax({
				type: 'DELETE',
				url: url,
				contentType: 'application/json',
				headers: JSON.parse(localStorage.getItem(App.keys.KEY_STORAGE_CREDENTIAL))
			});
		};

		/*
		 *  AJAX REST PUT CALLS
		 *
		 *
		 */
		this.putCheckpointData = function(data) {
			console.log("Call... " + data.url + " - data : " + JSON.stringify(data.obj));

			var realUrl = App.paths.BASE_URL_API + data.url;
			var deferred = Q.defer();
			ajaxPutJson(realUrl,data.obj).success(
					function() {
						// store merged json
						console.log("Call... " + realUrl);
						deferred.resolve();
					}
			).error(
					function() {

						deferred.reject();
					}
			);
			return deferred.promise;
		};

		this.putGap = function(url,data) {
			console.log("Call... " + url + " - data : " + JSON.stringify(data));

			var realUrl = App.paths.BASE_URL_API + url;
			var deferred = Q.defer();

			ajaxPutJson(realUrl,data).success(
					function() {
						deferred.resolve();
					}
			).error(
					function() {

						deferred.reject();
					}
			);
			return deferred.promise;
		};

		/*
        Friendly methods merge json response
		 */
		this.storeJsonFlightDetails = function(json) {
			storeJsonForFlightDetails(json);
		}.bind(this);

		var storeJsonForFlightDetails = function(json) {
			var date = $.datepicker.parseDate(App.format.DATE_FORMAT_DATABASE,json.dateVol);
			var str_date = $.datepicker.formatDate(App.format.DATE_FORMAT_FR,date);
			// use object pageData : { dateVolHeader : date }
			json.dateVolHeader = $.datepicker.formatDate(App.format.DATE_FORMAT_FR_SLASH,date);
			var timestamp = new Date().getTime();
			json.creationTimestamp = timestamp;
			var key = App.keys.KEY_FLIGHT_DETAIL+json.codeClient+":"+json.numVol+":"+str_date;
			App.network.storeFlightJson(key, json);
		};

		this.storeFlightJson = function(route,json) {
			try {

				localStorage.setItem(route,JSON.stringify(json));

			} catch(err) {
				console.log("catch STORE....");
				/*if (localStorage.length > 3) {
					for (var i = 0 ; i < 3 ; i++) {
						var mintime = new Date().getTime();
						var elementToDelete = null;
						$.each(localStorage, function (element) {
							if (element.slice(0, 9) == "/flights/" && typeof JSON.parse(localStorage[element]).creationTimestamp !== "undefined") {
								// Clear flights informations after 2 days old
								var timestampCreation = JSON.parse(localStorage[element]).creationTimestamp;
								if (timestampCreation < mintime) {
									mintime = timestampCreation;
									elementToDelete = element;
								}
							}
						});
						if (elementToDelete != null) {
							delete localStorage[elementToDelete];
						}
					}
				}*/
				var now 		= new Date().getTime();
				var timeFilter = now- 1000 * 60 *60*24*2; //2 days
				clearCache(timeFilter);
				localStorage.setItem(route,JSON.stringify(json));
			}
			try{
				if (localStorage.length > 100){
					var now 		= new Date().getTime();
					var timeFilter = now- 1000 * 60 *60*24*2; //2 days
					clearCache(timeFilter);
				}
			}catch(e){
				console.log("Exception when clearCache");
			}

		}.bind(this);

		var clearCache = function(timeFilter){        	
			var tabDel = [];
			$.each(localStorage, function (element) {
				try{
					var object = JSON.parse(localStorage[element]);
					if (element.slice(0, 8) == "/flights" && typeof object.creationTimestamp !== "undefined") {
						// Clear flights informations after 2 days old
						var timestampCreation = object.creationTimestamp;
						if (timestampCreation < timeFilter) {
							tabDel.push(element);
						}
					}
				}catch(e){

				}        		 
			});
			if (tabDel.length>0) {
				console.log("Clear from cache "+ tabDel.length+ " ele");
				for (var i=0;i<tabDel.length;i++){
					delete localStorage[tabDel[i]];
				}                 
			}
		}
		var sortFlightList = function(jsonData) {
			jsonData.companies.forEach(function(flightList,index) {
				var key = "heureDep";
				jsonData.companies[index].flights = jsonData.companies[index].flights
				.sort(function(a,b){
					if( a[key] > b[key]){
						return 1;
					}else if( a[key] < b[key] ){
						return -1;
					}
					return 0;
				});
			});
			return jsonData;
		};

		// Sort the flights list with json for PNC view
		var sortFlightListPNC = function(jsonData) {
			var key = "heureDep";
			jsonData.customerData = jsonData.customerData.sort(function(a,b){
				if( a[key] > b[key]){
					return 1;
				}else if( a[key] < b[key] ){
					return -1;
				}
				return 0;
			});

			return jsonData;
		};

		var endPrepareDetailsUpdateAju = function(route, update) {

			var json = JSON.parse(localStorage[route]);

			App.lastSynchroTime = App.network.getLastSynchroTime();
			json.lastSynchroTime = App.lastSynchroTime;

			if (update.commandes){
				json.commandes = update.commandes;
			}
			if (update.commandesInFours){
				json.commandesInFours = update.commandesInFours;
			}
			
			App.jsonProcessor.processFlightDetail(json);
			
			/*
			var commandesKeys = Object.keys(update.commandes);

			commandesKeys.forEach(function(key){

				var tabCommandeClasse = json.commandes[key];
				var tabUpdates = update.commandes[key];

				tabUpdates.forEach(function(prestation) {

					var found = false;

					tabCommandeClasse.forEach(function(oldPrestation) {

						if (prestation.article.codeArticle === oldPrestation.article.codeArticle) {
							if(oldPrestation.nbAju !== prestation.nbAju && oldPrestation.ordreService === 1 && oldPrestation.numTronc === 1){
								for (var i in json.classes) {
									if (json.classes[i].codeClasse == key) {
										json.classes[i].nbAJ = json.classes[i].nbAJ - oldPrestation.nbAju + prestation.nbAju;
										json.classes[i].hasAj = json.classes[i].nbAJ !== 0;
										break;
									}
								}
							}
							oldPrestation.nbAju = prestation.nbAju;
							oldPrestation.hasAj = true;
							found = true;
						}
					});

					if (!found) {
						prestation.hasAj = true;
						json.commandes[key].push(prestation);
						if (prestation.ordreService === 1 && prestation.numTronc === 1){
							for (var i in json.classes) {
								if (json.classes[i].codeClasse == key) {
									json.classes[i].nbAJ = prestation.nbAju;
									json.classes[i].hasAj = json.classes[i].nbAJ !== 0;
									break;
								}
							}
						}
					}
				});
			});
			*/
			App.network.storeFlightJson(route, json);
			return json;
		};

		var endPrepareJsonForFlight = function(master,customerData) {
			Handlebars.Utils.extend(master,{customerData: customerData});
			return master;
		};

		var endPrepareJsonForFlightsCustomerData = function(master,flightsCustomerData) {
			Handlebars.Utils.extend(master,{customerData: flightsCustomerData});
			return master;
		};

		var endPrepareJsonForFlightGapTypes = function(master,gapTypes) {
			// replace null by 0
			gapTypes.forEach(function (elem,index) {
				if (elem.parentGapTypeId  === null) {
					gapTypes[index].parentGapTypeId = 0;
				}
			});
			Handlebars.Utils.extend(master,{staticGapTypes: gapTypes});
			updateJsonWithGap(master,gapTypes);
			return master;
		};

		var updateJsonWithGap = function (master,gapTypes) {
			var gapArray = master.customerData.gaps;
			gapArray.forEach(function (gap,index) {
				var path = $.i18n(gap.gapType.label);
				var parentGapTypeId = gap.gapType.parentGapTypeId;
				for (var i in gapTypes) {
					if (gapTypes[i].id == parentGapTypeId) {
						path = $.i18n(gapTypes[i].label) + " / " + path ;
						break;
					}
				}
				gapArray[index].path = path;
			});

			Handlebars.Utils.extend(master,{gaps: gapArray});
			return master;
		};

		var endPrepareJsonForFlightCheckPoints = function(master,checkPoints) {
			Handlebars.Utils.extend(master,{checkPointsInfos: checkPoints});
			return master;
		};

		var endPrepareJsonForFlightCheckPointLocations = function(master,checkPointLocations) {
			Handlebars.Utils.extend(master,{checkPointLocationsInfos: checkPointLocations});
			return master;
		};

		var endPrepareJsonForGlobalMessages = function(master, gloMessages) {
			Handlebars.Utils.extend(master,{globalParticularities: gloMessages});
			return master;
		};

		var endPrepareJsonForFlightPlanOffice = function(master,plan) {
			var arrayNiveau = [[]];
			plan.forEach(function(office) {
				while (office.niveau >= arrayNiveau.length) {
					arrayNiveau.push([]);
				}
				if (office.codeOffice) 
					if (office.codeOffice == '15' && office.libelle1!='Pont supérieur'){
						office.libelle1='Pont supérieur';
						office.niveau = 2;
					}


				arrayNiveau[office.niveau].push(office);
			});

			var arrayPonts = [];
			arrayNiveau.forEach(function(niveau) {
				if (niveau[0] != null) {
					var resultNomPont = niveau[0].libelle1;                   
					var areDifferents = false;
					niveau.forEach(function (office) {           	

						var libelle = office.libelle1;
						if (resultNomPont != libelle) {
							resultNomPont = libelle;
							areDifferents = true;
						}
					});

					if (areDifferents) {
						var min = 10;
						var max = 0;
						var indexOfMin = 0;
						niveau.forEach(function (office, index) {
							var splitLibelle = office.libelle1.split(" ");
							if (splitLibelle.length < min) {
								indexOfMin = index;
								min = splitLibelle.length;
							}
							max = splitLibelle.length > max ? splitLibelle.length : max;
						});
						var splitLibelle = niveau[indexOfMin].libelle1.split(" ");

						if (min === max) {
							var result = "";
							for (var i = 0; i < splitLibelle.length - 1; i++) {
								result += splitLibelle[i] + " ";
							}
							resultNomPont = result.trim();
						} else {
							resultNomPont = niveau[indexOfMin].libelle1;
						}
					}
					var n = niveau[0].niveau;
					var p = resultNomPont;
					arrayPonts.push({nomPont: p, niveau: n});
				}
			});
			Handlebars.Utils.extend(master,{planOffice: arrayNiveau.reverse()});
			Handlebars.Utils.extend(master,{ponts: arrayPonts.reverse()});

			return master;
		};

		this.getLastSynchroTime = function () {
			var lastSynchro = new Date(),
			date = $.datepicker.formatDate(App.format.DATE_FORMAT_FR_SLASH, lastSynchro),
			h = lastSynchro.getHours() > 9 ? lastSynchro.getHours() : "0" + lastSynchro.getHours(),
					m = lastSynchro.getMinutes() > 9 ? lastSynchro.getMinutes() : "0" + lastSynchro.getMinutes(),
							s = lastSynchro.getSeconds() > 9 ? lastSynchro.getSeconds() : "0" + lastSynchro.getSeconds();
							return date + " " + $.i18n("K_AT") + " " + h + ":" + m + ":" + s;
		};

		function ajaxLoader(el, options) {

			// Becomes this.options
			var defaults = {
					bgColor 		: '#000',
					duration		: 200,
					opacity			: 0.7,
					classOveride 	: false
			};
			this.options 	= $.extend(defaults, options);
			this.container 	= $(el);

			this.init = function() {
				var container = this.container;
				// Delete any other loaders
				this.remove();
				// Create the overlay
				var overlay = $('<div></div>').css({
					'background-color': this.options.bgColor,
					'opacity':this.options.opacity,
					'width':container.width(),
					'height':container.height(),
					'position':'absolute',
					'top':'0px',
					'left':'0px',
					'z-index':99999
				}).addClass('ajax_overlay');
				// add an overiding class name to set new loader style
				if (this.options.classOveride) {
					overlay.addClass(this.options.classOveride);
				}
				// insert overlay and loader into DOM
				container.append(
						overlay.append(
								$('<div></div>').addClass('ajax_loader')
						).fadeIn(this.options.duration)
				);
			};

			this.remove = function(){
				var overlay = this.container.children(".ajax_overlay");
				if (overlay.length) {
					overlay.fadeOut(this.options.classOveride, function() {
						overlay.remove();
					});
				}
			};

			this.init();
		}

		this.startLoader = function() {
			if (loaderUp == 0) {
				this.loader = new ajaxLoader(body);
			}
			loaderUp++;
			//if(loaderUp>1) loaderUp=1;
		}.bind(this);

		this.stopLoader = function() {
			loaderUp--;
			if (loaderUp<0) loaderUp = 0;
			if (loaderUp == 0) {
				this.loader.remove();
			}
		}.bind(this);

	};
	return NetWorking;
});
