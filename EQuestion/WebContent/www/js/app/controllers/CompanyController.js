define(['handlebars',
        'text!templates/CompanyTemplate.html',
        'text!templates/CompanyHeaderTemplate.html',
        'jquery',
        'q',
        'jquery.mobile',
        'datepicker'],
    function (Handlebars,TemplateContent,TemplateHeader,$,Q) {

    var CompanyController = function ($el) {
       
        this.$el = $el;

        // Show the page with network service
        this.showCompany = function(route) {  //route + iata : ex: /identity/vn        
        	App.network.startLoader();
        	setLanguageAndBuildPage();
        	App.network.stopLoader();          
        }.bind(this);
        
      
        var setLanguageAndBuildPage = function(){
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
                    buildPage();
                });
            } catch(err) {
                localStorage.clear();
                location.reload();
            }
        };



        // Build the page
        var buildPage = function() {
            // Set the id after datas has been downloaded
            this.$el.attr("id", "main-module");

            console.log("CompanyController: Building page...");
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
            console.log("CompanyController: Set event handler for the view...");
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
           
            /*
            content.find("#butCompSubmit").click(function(){
            	
            });*/

        }.bind(this);

        
        
       
    };
    
    var submit= function(){
    	var iata = $("#inp_IATA").val().trim().toUpperCase();
        var imgFile=$("#addImg").find(":selected").val();
        console.log("--------------"+imgFile);
        var comp = null;
    	var companies = App.db.companies;
    	for (var i=0;i<companies.length;i++){
    		comp = companies[i];
    		if (comp.IATA == iata){        			
    			break;
    		}
    		comp = null;
    	}         
    	if (comp==null){
    		comp = {'IATA': iata, 'logo': imgFile};
    		App.db.companies.push(comp);
    		localStorage.setItem(App.DB_ROUTE, JSON.stringify(App.db.companies));                	
    	}
    	
    	App.company = comp;
    	App.iata	= iata;
    	
    	if (comp.identities){
    		App.router.run(App.routes.IDENTITIES);      
    	}else{
    		App.router.run(App.routes.IDENTITY);      
    	}
    };

    return CompanyController;
});
