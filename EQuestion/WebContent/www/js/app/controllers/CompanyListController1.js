define(['handlebars',
        'text!templates/CompanyListTemplate.html',
        'text!templates/CompanyListHeaderTemplate.html',
        'jquery',
        'q',
        'jquery.mobile',
        'datepicker'],
    function (Handlebars,TemplateContent,TemplateHeader,$,Q) {
	
	var companyListController = function($el){
		this.$el = $el;
		var var_lc_self=this;
		this.do_lc_showCompanies = function(route){
			var var_lc_json=JSON.parse(localStorage.getItem(App.DB_ROUTE));
			if(var_lc_json){
				App.db.companies=var_lc_json;
			}
			App.network.startLoader();
			getCompanyData(route);
			App.network.stopLoader();
		}.bind(this);
		
		var getCompanyData = function(route){
			
			var var_lc_json = App.db.companies;
			localStorage.setItem(App.DB_ROUTE, JSON.stringify(App.db.companies));
			
			if(var_lc_json){
				setLanguageAndBuildPage(App.db);
			} else{
				gotoHome();
			}
		};
		
		var gotoHome = function(){
			App.router.run(App.routes.HOME);
		};
		
		var setLanguageAndBuildPage = function(listCompanies){
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
                    buildPage(listCompanies);
                });
            } catch(err) {
                localStorage.clear();
                location.reload();
            }
        };
        
        var buildPage = function(listCompanies){
        	 this.$el.attr("id", "main-module");

             console.log("CompanyListController: Building page...");
             
             var var_lc_header = this.$el.find("div[data-role='header']");
             var var_lc_content = this.$el.find("div[data-role='content']");

             // Get template flights list
             var var_lc_compileHeader = Handlebars.compile(TemplateHeader);
             var var_lc_compileTemplate = Handlebars.compile(TemplateContent);

             // Replace header and content by templates
             var_lc_header.replaceWith(var_lc_compileHeader);
             var_lc_content.replaceWith(var_lc_compileTemplate(listCompanies));
        
             //Remove footer
             $("[data-role='footer']").empty().removeClass("app-footer");
             
             bindingEventsPage();
        }.bind(this);
		
        var bindingEventsPage = function(){
        	console.log("FlightListController: Set event handler for the view...");
        	
        	var var_lc_content = this.$el.find("div[data-role='content']");
            var var_lc_header = this.$el.find("div[data-role='header']");

            // Bind logout event to icon
            var_lc_header.find("#a_headerLogout").click(function(){
            	gotoHome();
            	
            });
            
            var_lc_content.find(".company").each(function(){
            	$(this).click(function(){
            		var var_lc_code_client = $(this).data("company-code");
            		var var_lc_comp = null;
            		var var_lc_companies = App.db.companies;
            		for(var i = 0;i<var_lc_companies.length;i++){
            			var_lc_comp=var_lc_companies[i];
            			if(var_lc_comp.IATA==var_lc_code_client){
            				break;
            			}
            			var_lc_comp =null;
            		}
            		
            		App.iata = var_lc_code_client;
            		App.company = var_lc_comp;
            		
            		if(var_lc_code_client!=-1)
            			App.router.run(App.routes.IDENTITIES);                        	
                    else
                    	App.router.run(App.routes.COMPANY);
            	});
            });
            var_lc_content.find("#company-other").click(function(){
            	App.router.run(App.routes.COMPANY);      
            });
            
            var_lc_content.find("#form-login").validate({
                submitHandler: submit
            });
        }.bind(this);
        
        var submit = function(){
        	var var_lc_iata= $("#inp_nameRecherche").val().trim().toUpperCase();
        	
        	var var_lc_comp = null;
        	var var_lc_companies = App.db.companies;
        	
        	for (var i=0;i<var_lc_companies.length;i++){
        		var_lc_comp = var_lc_companies[i];
        		var var_lc_nom="-"+var_lc_comp.IATA;
        		if (var_lc_comp.IATA != var_lc_iata ){  
        			var var_lc_nom="-"+var_lc_comp.IATA;
        			$(".company"+var_lc_nom).hide();
        			$("#company-other").show();
        		}
        		if(var_lc_comp.IATA == var_lc_iata){
        			$(".company"+var_lc_nom).show();
        			$("#company-other").hide();
        		}
        		if(var_lc_iata===""){
        			$(".company"+var_lc_nom).show();
        			$("#company-other").show();
        		}
        		
        	}
        }
	};
	return companyListController;
});