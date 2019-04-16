define(['handlebars',
        'text!templates/IdentityListTemplate.html',
        'text!templates/IdentityListHeaderTemplate.html',
        'jquery',
        'q',
        'jquery.mobile',
        'datepicker'],
    function (Handlebars,TemplateContent,TemplateHeader,$,Q) {

    var IdentityListController = function ($el) {
       
        this.$el = $el;

        // Show the page with network service
        this.showIdentities = function(route, comp) {  //route + iata : ex: /identity/vn
        	//lay du lieu tu localstorage        
        	if (comp){
        		if (!comp.identities){        			 
        			getIdentityData (route, comp);
        		}
        		
        		localStorage.setItem(App.DB_ROUTE, JSON.stringify(App.db.companies));
        		if (comp.identities){
        			App.network.startLoader();
        			setLanguageAndBuildPage(comp);
        			App.network.stopLoader();
        		}
        	} else{
        		//go to IATA page
        	}   
          
        }.bind(this);

        var getIdentityData = function(route, comp) {
        	//lay tu local DB
        	//do something with db to have json       	
        	
        	var json = App.db.identities[comp.IATA];    
        	//localStorage.setItem(route+ '/'+iata, JSON.stringify(json));
        	
        	if (json) {
        		comp.identities = json;        		
        	} else{
        		comp.identities = [];
        	}
		};
               

        var setLanguageAndBuildPage = function(company){
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
                    buildPage(company);
                });
            } catch(err) {
                localStorage.clear();
                location.reload();
            }
        };



        // Build the page
        var buildPage = function(company) {
            // Set the id after datas has been downloaded
            this.$el.attr("id", "main-module");

            console.log("IdentityListController: Building page...");
            // Get the user name
          
            var header = this.$el.find("div[data-role='header']");
            var content = this.$el.find("div[data-role='content']");

            // Get template flights list
            var compileHeader 	= Handlebars.compile(TemplateHeader);
            var compileTemplate = Handlebars.compile(TemplateContent);

            // Replace header and content by templates
            header.replaceWith(compileHeader);
            content.replaceWith(compileTemplate(company));
       
            //Remove footer
            $("[data-role='footer']").empty().removeClass("app-footer");
            
        
            // Bind events buttons, calendar, items list            
            bindingEventsPage();
        }.bind(this);

        var gotoListCompanies = function() {
            App.router.run(App.routes.COMPANIES);
        };
        
        

        // Bind events in the page
        var bindingEventsPage = function() {
            console.log("IdentityListController: Set event handler for the view...");
            // Get root, content and header references for callbacks
            var content = this.$el.find("div[data-role='content']");
            var header = this.$el.find("div[data-role='header']");

            // Bind logout event to icon
            header.find("#headerBack").click(function(){
            	gotoListCompanies();
            });

               
            // Bind events to list flight items
            content.find(".hub").each(function() {
                $(this).click(function() {
                    // Get code company and flight number
                    var name01 	= $(this).data("identity-name01");
                    var name02	= $(this).data("identity-name02");
                                        
                    var comp = App.company;
                	var identity = null;
                	//alert(JSON.stringify(comp.identities[3]));
                	//alert(JSON.stringify(comp.identities.name_01));
                	if (comp.identities){

                		for (var i in comp.identities){
                			//alert(JSON.stringify(comp.identities.name01));
                			//alert(JSON.stringify(i.name01));
                			if (comp.identities[i].name_01 == name01 && comp.identities[i].name_02 == name02){
                   				identity = comp.identities[i];
                				break;
                			}
                		}
                	}
                	
                	if (!identity){
                		identity = {'name_01': name01, 	'name_02': name02};
                		if (comp.identities)
                			comp.identities.push(identity);
                		else
                			comp.identities = [identity];
                		
                		localStorage.setItem(App.DB_ROUTE, JSON.stringify(App.db.companies));
                	}
                	
                	App.question = 1;
                	//Make empty for array reponses
    				App.reponses = [];
                	App.identity = identity;       
                    App.router.run(App.routes.QUESTION);    
                   
                });
            });
           
            content.find("#butNewID").click(function(){
            	App.router.run(App.routes.IDENTITY);   
            });
            
        }.bind(this);

        
        
       
    };

    return IdentityListController;
});
