define(['handlebars',
        'text!templates/IdentityTemplate.html',
        'text!templates/IdentityHeaderTemplate.html',
        'jquery',
        'q',
        'jquery.mobile',
        'datepicker'],
    function (Handlebars,TemplateContent,TemplateHeader,$,Q) {
	
	var identityController = function ($el) {
	       
        this.$el = $el;

        // Show the page with network service
        this.do_lc_showIdentity = function(route, comp) {  //route + iata : ex: /identity/vn
        	//lay du lieu tu localstorage
        	
        	if (comp){       		
        		
        			App.network.startLoader();
        			setLanguageAndBuildPage(comp);
        			App.network.stopLoader();        		
        	}else{
        		
        	}  
          
        }.bind(this);
      
        var setLanguageAndBuildPage = function(comp){
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
                    buildPage(comp);
                });
            } catch(err) {
                localStorage.clear();
                location.reload();
            }
        };
        
     // Build the page
        var buildPage = function(comp) {
            // Set the id after datas has been downloaded
            this.$el.attr("id", "main-module");

            console.log("IdentityController: Building page...");
            // Get the user name
          
            var var_lc_header = this.$el.find("div[data-role='header']");
            var var_lc_content = this.$el.find("div[data-role='content']");

            // Get template flights list
            var var_lc_compileHeader 	= Handlebars.compile(TemplateHeader);
            var var_lc_compileTemplate = Handlebars.compile(TemplateContent);

            // Replace header and content by templates
            var_lc_header.replaceWith(var_lc_compileHeader);
            var_lc_content.replaceWith(var_lc_compileTemplate());
       
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

            this.$el.find("#form-login").validate({
                submitHandler: submit
            });
            // Bind events to list flight items
            /*content.find("#butIdSubmit").click(function(){            	
            });*/       

        }.bind(this);
        
	};
	
	var submit = function(){
    	var var_lc_name01 = $("#inp_name01").val().trim();
    	var var_lc_name02 = $("#inp_name02").val().trim();
    	
    	if (var_lc_name01==null || var_lc_name02==null || var_lc_name01.length<=0 || var_lc_name02.length<=0){
    		alert($.i18n('M_ERROR_IDENTITY'));
    		return;
    	}
    	
    	var var_lc_comp = App.company;
    	var var_lc_identity = null;
    	if (var_lc_comp.identities){
    		for (var i in var_lc_comp.identities){
    			var var_lc_id = var_lc_comp.identities[i];
    			if (var_lc_id.name_01.toLowerCase()  == var_lc_name01.toLowerCase()  && var_lc_id.name_02.toLowerCase() == var_lc_name02.toLowerCase() ){
    				var_lc_identity = var_lc_id;
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
    	App.reponses = [];
    	App.question = 1;
    	App.identity = var_lc_identity;            	
    	App.router.run(App.routes.QUESTION);                 
         
    };
    
    return identityController;
});