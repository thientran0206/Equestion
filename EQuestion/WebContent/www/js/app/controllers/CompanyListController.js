define(['handlebars',
        'text!templates/CompanyListTemplate.html',
        'text!templates/CompanyListHeaderTemplate.html',
        'jquery',
        'q',
        'jquery.mobile',
        'datepicker'],
    function (Handlebars,TemplateContent,TemplateHeader,$,Q) {

    var CompanyListController = function ($el) {
        // Store root element
        this.$el = $el;
        var self = this;
        // Show the page with network service
        this.showCompanies = function(route) {  
        	//lay du lieu tu localstorage
        	var json = JSON.parse(localStorage.getItem(App.DB_ROUTE));           
        	if (json) {
        		App.db.companies = json;            	
        	}
        	App.network.startLoader();
        	getCompanyData(route);
        	App.network.stopLoader();            
        }.bind(this);

        var getCompanyData = function(route) {
        	//lay tu local DB
        	//do something with db to have json        	
        	var json = App.db.companies;
        	console.log(json);
        	localStorage.setItem(App.DB_ROUTE, JSON.stringify(App.db.companies));
        	
        	if (json) {
        		setLanguageAndBuildPage(App.db);
        	} else {
        		gotoHome();
        	}	
		};
               

        var setLanguageAndBuildPage = function(listCompanies){
            var language = navigator.language || navigator.userLanguage;

            if(!localStorage.language){
                if(language == "fr" || language == "uk" || language == "en"){
                    if(language == "en"){
                        localStorage.language = "uk";
                    } else {
                        localStorage.language = language;
                    }
                } else {
                    localStorage.language = "fr";
                }
            }

            $.i18n({
                locale: localStorage.language
            });
            try {
                $.i18n().load('js/lib/jquery.i18n/_' + $.i18n().locale + '.json', $.i18n().locale).done(function (result) {
                    buildPage(listCompanies);
                });
            } catch(err) {
                localStorage.clear();
                location.reload();
            }
        };



        // Build the page
        var buildPage = function(listCompanies) {
            // Set the id after datas has been downloaded
            this.$el.attr("id", "main-module");

            console.log("CompanyListController: Building page...");
            localStorage.clear();
            // Get the user name
          
            var header = this.$el.find("div[data-role='header']");
            var content = this.$el.find("div[data-role='content']");

            // Get template flights list
            var compileHeader = Handlebars.compile(TemplateHeader);
            var compileTemplate = Handlebars.compile(TemplateContent);

            // Replace header and content by templates
            header.replaceWith(compileHeader);
            content.replaceWith(compileTemplate(listCompanies));
       
            //Remove footer
            $("[data-role='footer']").empty().removeClass("app-footer");
            
            
            //add flightState on flights card
            /*
            for(var i in listCompanies.customerData){
                var currentFlight = listFlight.customerData[i];

                if(currentFlight.state.id == 3 || currentFlight.state.id == 4){ //3 or 4 state = Flight closed by reg
                    var codeCli = currentFlight.codeClient;
                    var numVol = currentFlight.numVol;
                    $("li[data-company-code='"+codeCli+"'][data-id-flight='"+numVol+"']").removeClass("status_false").addClass("status_true");
                }
            }

            if(navigator.connection && window.cordova.platformId == "ios"){
                $("#mainListFlightsUl").css("top", "-220px");
            }
            */

           
        
            // Bind events buttons, calendar, items list            
            bindingEventsPage();
        }.bind(this);

        
        // If flights list is load, return json in offline mode.
       

        var gotoHome = function() {
            App.router.run(App.routes.HOME);
        };

        // Bind events in the page
        var bindingEventsPage = function() {
            console.log("FlightListController: Set event handler for the view...");
            // Get root, content and header references for callbacks
            var content = this.$el.find("div[data-role='content']");
            var header = this.$el.find("div[data-role='header']");

            // Bind logout event to icon
            header.find("#headerLogout").click(function(){
            	gotoHome();
            	
            });
            
          
            // Bind events to list flight items
            content.find(".company").each(function() {
                $(this).click(function() {
                    // Get code company and flight number
                    var codeClient = $(this).data("company-code");
                                      
                    var comp = null;
                	var companies = App.db.companies;
                	for (var i=0;i<companies.length;i++){
                		comp = companies[i];
                		if (comp.IATA == codeClient){        			
                			break;
                		}
                		comp = null;
                	}                  
                    
                    App.iata 	= codeClient;
                    App.company = comp;
                    
                    if (codeClient!= -1)                    	
                    	App.router.run(App.routes.IDENTITIES);                        	
                    else
                    	App.router.run(App.routes.COMPANY);
                });
            });
            
            content.find("#company-other").click(function(){
            	App.router.run(App.routes.COMPANY);      
            });
            
            content.find("#form-login").validate({
                submitHandler: submit
            });
           

        }.bind(this);
        
        var submit = function(){
        	var iata = $("#nameRecherche").val().trim().toUpperCase();
        	//console.log(tonggle);
        	var comp = null;
        	var companies = App.db.companies;
        	
        	for (var i=0;i<companies.length;i++){
        		comp = companies[i];
        		var nom="-"+comp.IATA;
        		if (comp.IATA != iata ){  
        			var nom="-"+comp.IATA;
        			$(".company"+nom).hide();
        			$("#company-other").show();
        		}
        		if(comp.IATA == iata){
        			$(".company"+nom).show();
        			$("#company-other").hide();
        		}
        		if(iata===""){
        			$(".company"+nom).show();
        			$("#company-other").show();
        		}
        		
        	}
        	
        	
        }
          
       
    };

    return CompanyListController;
});
