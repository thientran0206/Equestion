define(['handlebars',
        'text!templates/CompanyTemplate.html',
        'text!templates/CompanyHeaderTemplate.html',
        'jquery',
        'q',
        'jquery.mobile',
        'datepicker'],
    function (Handlebars,TemplateContent,TemplateHeader,$,Q) {
	
	 var companyController = function ($el) {
		 
		 this.$el = $el;
		 
		 this.do_lc_showCompany = function(route) {  //route + iata : ex: /identity/vn        
	        	App.network.startLoader();
	        	setLanguageAndBuildPage();
	        	App.network.stopLoader();          
	        }.bind(this);
	     
	        var setLanguageAndBuildPage = function(){
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
	            console.log("CompanyController: Set event handler for the view...");
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
	           
	            /*
	            content.find("#butCompSubmit").click(function(){
	            	
	            });*/

	        }.bind(this);
	   
	        
	        
	 };
	 var submit= function(){
     	var var_lc_iata = $("#inp_IATA").val().trim().toUpperCase();
         var var_lc_imgFile=$("#sel_addImg").find(":selected").val();
         console.log("--------------"+var_lc_imgFile);
         var var_lc_comp = null;
     	var var_lc_companies = App.db.companies;
     	for (var i=0;i<var_lc_companies.length;i++){
     		var_lc_comp = var_lc_companies[i];
     		if (var_lc_comp.IATA == var_lc_iata){        			
     			break;
     		}
     		var_lc_comp = null;
     	}         
     	if (var_lc_comp==null){
     		var_lc_comp = {'IATA': var_lc_iata, 'logo': var_lc_imgFile};
     		App.db.companies.push(var_lc_comp);
     		localStorage.setItem(App.DB_ROUTE, JSON.stringify(App.db.companies));                	
     	}
     	
     	App.company = var_lc_comp;
     	App.iata	= var_lc_iata;
     	
     	if (var_lc_comp.identities){
     		App.router.run(App.routes.IDENTITIES);      
     	}else{
     		App.router.run(App.routes.IDENTITY);      
     	}
     };
     
     return companyController;
});