define(['handlebars',
        'text!templates/IdentityListTemplate.html',
        'text!templates/IdentityListHeaderTemplate.html',
        'jquery',
        'q',
        'jquery.mobile',
        'datepicker'],
    function (Handlebars,TemplateContent,TemplateHeader,$,Q) {
	
	var identityListController = function ($el) {
		
		this.$el = $el;
		
		this.do_lc_showIdentities = function(route, comp) {  //route + iata : ex: /identity/vn
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
        	
        	var var_lc_json = App.db.identities[comp.IATA];    
        	//localStorage.setItem(route+ '/'+iata, JSON.stringify(json));
        	
        	if (var_lc_json) {
        		comp.identities = var_lc_json;        		
        	} else{
        		comp.identities = [];
        	}
		};
		
		 var setLanguageAndBuildPage = function(company){
	            var var_lc_language = navigator.language || navigator.userLanguage;

	            if(!localStorage.language){
	                if(var_lc_language == "fr" || var_lc_language == "uk" || var_lc_language == "en"){
	                    if(var_lc_language == "en"){
	                        localStorage.language = "uk";
	                    } else {
	                        localStorage.language = var_lc_language;
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
	        
	        var buildPage = function(company) {
	            // Set the id after datas has been downloaded
	            this.$el.attr("id", "main-module");

	            console.log("IdentityListController: Building page...");
	            // Get the user name
	          
	            var var_lc_header = this.$el.find("div[data-role='header']");
	            var var_lc_content = this.$el.find("div[data-role='content']");

	            // Get template flights list
	            var var_lc_compileHeader 	= Handlebars.compile(TemplateHeader);
	            var var_lc_compileTemplate = Handlebars.compile(TemplateContent);

	            // Replace header and content by templates
	            var_lc_header.replaceWith(var_lc_compileHeader);
	            var_lc_content.replaceWith(var_lc_compileTemplate(company));
	       
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
	            var var_lc_content = this.$el.find("div[data-role='content']");
	            var var_lc_header = this.$el.find("div[data-role='header']");

	            // Bind logout event to icon
	            var_lc_header.find("#a_headerBack").click(function(){
	            	gotoListCompanies();
	            });

	               
	            // Bind events to list flight items
	            var_lc_content.find(".hub").each(function() {
	                $(this).click(function() {
	                    // Get code company and flight number
	                    var var_lc_name01 	= $(this).data("identity-name01");
	                    var var_lc_name02	= $(this).data("identity-name02");
	                                        
	                    var var_lc_comp = App.company;
	                	var var_lc_identity = null;
	                	//alert(JSON.stringify(comp.identities[3]));
	                	//alert(JSON.stringify(comp.identities.name_01));
	                	if (var_lc_comp.identities){

	                		for (var i in var_lc_comp.identities){
	                			//alert(JSON.stringify(comp.identities.name01));
	                			//alert(JSON.stringify(i.name01));
	                			if (var_lc_comp.identities[i].name_01 == var_lc_name01 && var_lc_comp.identities[i].name_02 == var_lc_name02){
	                				var_lc_identity = var_lc_comp.identities[i];
	                				break;
	                			}
	                		}
	                	}
	                	
	                	if (!var_lc_identity){
	                		var_lc_identity = {'name_01': var_lc_name01, 	'name_02': var_lc_name02};
	                		if (var_lc_comp.identities)
	                			var_lc_comp.identities.push(var_lc_identity);
	                		else
	                			var_lc_comp.identities = [var_lc_identity];
	                		
	                		localStorage.setItem(App.DB_ROUTE, JSON.stringify(App.db.companies));
	                	}
	                	
	                	App.question = 1;
	                	//Make empty for array reponses
	    				App.reponses = [];
	                	App.identity = var_lc_identity;       
	                    App.router.run(App.routes.QUESTION);    
	                   
	                });
	            });
	           
	            var_lc_content.find("#div_butNewID").click(function(){
	            	App.router.run(App.routes.IDENTITY);   
	            });
	            
	        }.bind(this);
	        
	};
	return identityListController;
});