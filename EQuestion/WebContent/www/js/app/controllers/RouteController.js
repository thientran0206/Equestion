/**
 * Created by H&V on 19/02/16.
 */

define(['pathparser',
        'jquery',
        'controllers/LoginController1',
        'controllers/CompanyListController1',       
        'controllers/IdentityListController1',
        'controllers/CompanyController1',
        'controllers/IdentityController1',
        'controllers/QuestionController1',
        'controllers/ThankController1',
       ],
        function (PathParser,
                  $,
                  LoginController,
                  CompanyListController,                
                  IdentityListController,
                  
                  CompanyController,                
                  IdentityController,
                  
                  QuestionController ,
                  
                  ThankController
                ) {

    var RouteController = function () {
        var divDataRolePage = "div[data-role='page']";
        var history = [];
        this.init = function() {

            this.router = new PathParser();
            this.router.add(App.routes.HOME, function () {
                consoleRoute(App.routes.HOME);
                var root = $(divDataRolePage);
                root.attr("id", "app");
                var loginController = new LoginController(root);
                loginController.do_lc_login();
             
            });

            this.router.add(App.routes.COMPANIES, function () {
                consoleRoute(this.url);

                var date = new Date();
                var date_str = $.datepicker.formatDate(App.format.DATE_FORMAT_FR, date);
                var url = App.routes.COMPANIES;
                App.currentDate = date_str;
                
                var root = $(divDataRolePage);
                var companyController = new CompanyListController(root);
                companyController.do_lc_showCompanies(url);          
               
            });
            
            this.router.add(App.routes.IDENTITIES, function () {              
            	consoleRoute(this.url);
                var date = new Date();
                var date_str = $.datepicker.formatDate(App.format.DATE_FORMAT_FR, date);
                var url = App.routes.IDENTITIES;
                App.currentDate = date_str;
                
                
                var root = $(divDataRolePage);
                var identityController = new IdentityListController(root);                
                identityController.do_lc_showIdentities(url, App.company);                
            });
            
            
            this.router.add(App.routes.COMPANY, function () {
            	consoleRoute(this.url);
                var url = App.routes.IATA;
                               
                var root = $(divDataRolePage);
                var compController = new CompanyController(root);                
                compController.do_lc_showCompany();                
            });
            
            this.router.add(App.routes.IDENTITY, function () {
            	consoleRoute(this.url);
                var url = App.routes.IDENTITY;
                               
                var root = $(divDataRolePage);
                var identityController = new IdentityController(root);                
                identityController.do_lc_showIdentity(url, App.company);                               
            });
            
            
            this.router.add(App.routes.QUESTION, function () {
            	consoleRoute(this.url);
            	 var url = App.routes.QUESTION;            	
                 
                 var root = $(divDataRolePage);
                 var questionController = new QuestionController(root);                
                 questionController.do_lc_showQuestion(url, App.company, App.identity, App.question);           
            });
            
            
            this.router.add(App.routes.THANK, function () {
            	consoleRoute(this.url);
            	 var url = App.routes.THANK;            	
                 
                 var root = $(divDataRolePage);
                 var thankController = new ThankController(root);                
                 thankController.do_lc_showThank(url, App.company, App.identity, App.reponses);           
            });
            
            //-----------------------------------------------------------------------------------------
            /*
            this.router.add(App.routes.FLIGHTS_WITH_DATE, function () {
                consoleRoute(this.url);

                var url = App.routes.FLIGHTS + App.routes.DATE_PARAM + this.date;
                App.currentDate = this.date;
                var root = $(divDataRolePage);
                root.attr("id", "main-module");
                var userData = JSON.parse(localStorage.getItem(App.keys.KEY_STORAGE_PROFILE));
                var flightsController;
                if( userData.role == App.roles.REG){
                    flightsController = new FlightListRegController(root);
                }
                else{
                    flightsController = new FlightListController(root);
                }
                flightsController.showFlights(url);

            });

            this.router.add(App.routes.FLIGHTS, function () {
                consoleRoute(this.url);

                var date = new Date();
                var date_str = $.datepicker.formatDate(App.format.DATE_FORMAT_FR, date);
                var url = App.routes.FLIGHTS + App.routes.DATE_PARAM + date_str;
                App.currentDate = date_str;
                var root = $(divDataRolePage);
                var userData = JSON.parse(localStorage.getItem(App.keys.KEY_STORAGE_PROFILE));
                var flightsController;
                if( userData.role == App.roles.REG){
                    flightsController = new FlightListRegController(root);
                }
                else{
                    flightsController = new FlightListController(root);
                }
                flightsController.showFlights(url);
            });

            this.router.add(App.routes.GLOBAL_PARTICULARITIES_WITH_DATE, function () {
                consoleRoute(this.url);
                var date_str = "";
                if (typeof this.date === "undefined") {
                    var date = new Date();
                    date_str = $.datepicker.formatDate(App.format.DATE_FORMAT_FR, date);
                } else {
                    date_str = this.date;
                }
                var url = App.routes.GLOBAL_PARTICULARITIES + App.routes.DATE_PARAM + date_str;
                var root = $(divDataRolePage);
                var globalParticularitiesController = new GlobalParticularitiesController(root);
                globalParticularitiesController.showMessages(url);
            });

            this.router.add(App.routes.FLIGHT, function () {
                consoleRoute(this.codeClient);

                var root = $(divDataRolePage);
                root.attr("id", "mainPage");
                var url = App.routes.FLIGHTS + "/" + this.codeClient+":"+this.numVol+":" + App.currentDate;

                var dbLink = null;
                var userData = JSON.parse(localStorage.getItem(App.keys.KEY_STORAGE_PROFILE));
                if( userData.role == App.roles.PNC){
                    dbLink = this.dbLinkName;
                }

                var flightDetailsController = new FlightDetailsController(root, this.codeClient, this.numVol);

                if(typeof this.offline === "undefined"){
                    flightDetailsController.showFlightDetails(url, dbLink);
                } else {
                    flightDetailsController.showFlightDetailsOffline(url);
                }

            });

            this.router.add(App.routes.FLIGHT_DOTATIONS, function () {
                consoleRoute(this.url);

                var root = $(divDataRolePage);
                root.attr("id", "pla_planArmement");
                var url = App.routes.FLIGHTS + "/" + this.codeClient+":"+this.numVol+":" + App.currentDate;
                var niveau = this.niveau;
                var flightDotationsController = new FlightDotationsController(root, this.codeClient, this.numVol);
                flightDotationsController.showFlightDotations(url,niveau);
            });

            this.router.add(App.routes.FLIGHT_PRESTA, function () {
                consoleRoute(this.url);

                var root = $(divDataRolePage);
                root.attr("id", "prh_prestationPage");
                var url = App.routes.FLIGHTS + "/" + this.codeClient+":"+this.numVol+":" + App.currentDate;
                var classe = this.prestaCode;
                var flightPrestationsController = new FlightPrestationsController(root, this.codeClient, this.numVol);
                flightPrestationsController.showFlightPrestations(url, classe);
            });

            this.router.add(App.routes.FLIGHT_UPDATE_PRESTA, function () {
                consoleRoute(this.url);

                var root = $(divDataRolePage);
                var url = App.routes.FLIGHTS + "/" + this.codeClient+":"+this.numVol+":" + App.currentDate;
                var classe = this.prestaCode;
                var flightPrestationsController = new FlightPrestationsController(root, this.codeClient, this.numVol);
                flightPrestationsController.showFlightPrestationsAfterUpdateAju(url,classe);
            });

            this.router.add(App.routes.FLIGHTS_CHECK_POINTS, function () {
                consoleRoute(this.url);

                var root = $(divDataRolePage);
                root.attr("id", "checkpoints");
                var url = App.routes.FLIGHTS + "/" + this.codeClient+":"+this.numVol+":" + App.currentDate;
                var checkPointsController = new CheckPointsController(root, this.codeClient, this.numVol);
                checkPointsController.showCheckPoints(url,this.locationId);
            });

            this.router.add(App.routes.FLIGHT_MANAGE_GAPS, function () {
                var id =0;
                if (typeof this.id === "undefined"){
                    history.push(this.url);
                } else {
                    id = this.id;
                }
                consoleRoute(this.url);

                var root = $(divDataRolePage);
                root.attr("id", "listGaps");

                var url = App.routes.FLIGHTS + "/" + this.codeClient+":" + this.numVol + ":" + App.currentDate;
                var flightGapsController = new FlightGapsController(root, this.codeClient, this.numVol);
                flightGapsController.showFlightGaps(url,id);
            });

            this.router.add(App.routes.SEARCH_IN_FLIGHT, function(){
                consoleRoute(this.url);

                var root = $(divDataRolePage);
                var searchedText = this.searchedText;
                var searchController = new SearchController(root, this.codeClient, this.numVol);
                var flightIdUrl = "/flights/"+this.codeClient+":"+this.numVol+":"+this.dateVol.replace("/", "-");
                searchController.showSearchResult(searchedText, flightIdUrl);
            });
            */
        };

        this.run = function (path) {
            this.router.run(path);
        };

        var consoleRoute = function(route) {
            console.log(route + "...");
        };

    };
    return RouteController;
});
