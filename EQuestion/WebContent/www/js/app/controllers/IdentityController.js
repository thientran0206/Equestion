define(['handlebars',
        'text!templates/IdentityTemplate.html',
        'text!templates/IdentityHeaderTemplate.html',
        'jquery',
        'q',
        'jquery.mobile',
        'datepicker'],
    function (Handlebars,TemplateContent,TemplateHeader,$,Q) {

    var IdentityController = function ($el) {
       
        this.$el = $el;

        // Show the page with network service
        this.showIdentity = function(route, comp) {  //route + iata : ex: /identity/vn
        	//lay du lieu tu localstorage
        	
        	if (comp){       		
        		
        			App.network.startLoader();
        			setLanguageAndBuildPage(comp);
        			App.network.stopLoader();        		
        	}else{
        		
        	}  
          
        }.bind(this);

                    

        var setLanguageAndBuildPage = function(comp){
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

            console.log("IdentityListController: Building page...");
            // Get the user name
          
            var header = this.$el.find("div[data-role='header']");
            var content = this.$el.find("div[data-role='content']");

            // Get template flights list
            var compileHeader 	= Handlebars.compile(TemplateHeader);
            var compileTemplate = Handlebars.compile(TemplateContent);

            // Replace header and content by templates
            header.replaceWith(compileHeader);
            content.replaceWith(compileTemplate());
       
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

            this.$el.find("#form-login").validate({
                submitHandler: submit
            });
            // Bind events to list flight items
            /*content.find("#butIdSubmit").click(function(){            	
            });*/       

        }.bind(this);
       
       
    };

    var submit = function(){
    	var name01 = $("#inpName01").val().trim();
    	var name02 = $("#inpName02").val().trim();
    	
    	if (name01==null || name02==null || name01.length<=0 || name02.length<=0){
    		alert($.i18n('M_ERROR_IDENTITY'));
    		return;
    	}
    	
    	var comp = App.company;
    	var identity = null;
    	if (comp.identities){
    		for (var i in comp.identities){
    			var id = comp.identities[i];
    			if (id.name_01.toLowerCase()  == name01.toLowerCase()  && id.name_02.toLowerCase() == name02.toLowerCase() ){
    				identity = id;
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
    	App.reponses = [];
    	App.question = 1;
    	App.identity = identity;            	
    	App.router.run(App.routes.QUESTION);                 
         
    };
    
    return IdentityController;
});
