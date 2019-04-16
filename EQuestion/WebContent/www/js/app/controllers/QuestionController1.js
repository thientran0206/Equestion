define(['handlebars',
        'text!templates/QuestionTemplate.html',
        'text!templates/QuestionHeaderTemplate.html',
        'jquery',
        'q',
        'jquery.mobile',
        'datepicker'],
    function (Handlebars,TemplateContent,TemplateHeader,$,Q) {

    var questionController = function ($el) {

    	var reponseArr = [];
    	
		//Bien kiem tra question obtional
		var checkQuestionOptional = false;
		//Bien kiem tra question co multiple choice
		var checkQuestionMultiple = false;
    	
        this.$el = $el;

        // Show the page with network service
        this.do_lc_showQuestion = function(route, comp, identity, qNum) {  //route + iata : ex: /identity/vn
        	if (comp && identity && qNum){
        		qNum = App.question;
        		
        		if(qNum == 3||qNum == 4||qNum == 5||qNum == 6||qNum == 7) {
        			$("#btn_terminer").remove();
        			checkQuestionOptional = true;
        		}
        		
        		if(qNum == 8) {
        			$("#btn_passer").remove();
        			checkQuestionMultiple = true;
        		}
        		
        		var var_lc_question = {question : App.questions[qNum], company : comp, questionOptional : checkQuestionOptional, questionMultiple : checkQuestionMultiple};
            		
    			if (var_lc_question){
        			App.network.startLoader();
        			setLanguageAndBuildPage(var_lc_question);
        			App.network.stopLoader();
    			}
    
        	} else{
//        		gotoListCompanies();
        	}   
          
        }.bind(this);
        
        var setLanguageAndBuildPage = function(question){
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
                    buildPage(question);
                });
            } catch(err) {
                localStorage.clear();
                location.reload();
            }
        };
        
     // Build the page
        var buildPage = function(question) {
            // Set the id after datas has been downloaded
            this.$el.attr("id", "main-module");

            console.log("QuestionController: Building page...");
            // Get the user name
          
            var var_lc_header = this.$el.find("div[data-role='header']");
            var var_lc_content = this.$el.find("div[data-role='content']");

            // Get template flights list
            var var_lc_compileHeader 	= Handlebars.compile(TemplateHeader);
            var var_lc_compileTemplate = Handlebars.compile(TemplateContent);

            // Replace header and content by templates
            var_lc_header.replaceWith(var_lc_compileHeader);
            var_lc_content.replaceWith(var_lc_compileTemplate(question));
       
            //Remove footer
            $("[data-role='footer']").empty().removeClass("app-footer");
            
        
            // Bind events buttons, calendar, items list            
            bindingEventsPage();
        }.bind(this);

        var gotoListIdentities = function() {
        	App.reponses = [];
            App.router.run(App.routes.IDENTITIES);
        };

     // Bind events in the page
        var bindingEventsPage = function() {
            console.log("QuestionController: Set event handler for the view...");
            // Get root, content and header references for callbacks
            var var_lc_content = this.$el.find("div[data-role='content']");
            var var_lc_header = this.$el.find("div[data-role='header']");

            // Bind logout event to icon
            var_lc_header.find("#a_headerBack").click(function(){
            	gotoListIdentities();
            });
            
            function objectPropInArray(array, prop, val) {
          	  if (array.length > 0 ) {
          	    for (i in array) {
          	      if (array[i][prop] === val) {
          	        return true;
          	      }
          	    }
          	  }
          	  return false;  
          }
          
          function findIndexValueInArray(array, valueToFind) {
              var i = array.length;
              while( i-- ) {
                  if( array[i].val === valueToFind ) break;
              }
              
              return i;
          }

          
          // Bind events to list flight items 
          //$('.hub').css('cursor', 'pointer');
          var_lc_content.find(".hub").each(function() {
              $(this).click(function() {
              	
              	//Xu ly reponse ma client da chon
              	var var_lc_reponseR = $(this).data("reponse-res");
              	var var_lc_reponseV = $(this).data("reponse-val");
                            	
              	if(App.question < 8) {
              		$(this).css("background", "gray");
              		
              		reponseArr.push({"r" : var_lc_reponseR, "val" : var_lc_reponseV});
              		App.reponses.push({"rNum" : "R" + App.question, "res" : reponseArr});            	                   	        

                 		App.question++;
                      App.router.run(App.routes.QUESTION); 
              	}
              	
                 	else {
                 		
                 		if (objectPropInArray(reponseArr, 'r', var_lc_reponseR)) {
                 			$(this).css("background", "white");
                 			
                 			var index = findIndexValueInArray(reponseArr, var_lc_reponseV);
                 			var_lc_reponseArr.splice( index, 1 );
                 		}
                 			
                 		else {
                 			$(this).css("background", "gray");
                 			
                 			reponseArr.push({"r" : var_lc_reponseR, "val" : var_lc_reponseV});
                 		}
                 	}
              	                	
              });
          });           
          
          
          var_lc_content.find("#btn_passer").click(function(){
          	// Xu ly reponse == null o question optional 
          	
          	App.reponses.push({"rNum" : "R" + App.question, "res" : reponseArr});
          	
          	App.question++;
              App.router.run(App.routes.QUESTION);
          	
          });
          
          var_lc_content.find("#btn_terminer").click(function(){
        	  reponseArr.sort(function(a, b){
        			 return a.val - b.val;
        		})
        		
          	// Xu ly reponse multiple o question multiple            	
          	App.reponses.push({"rNum" : "R" + App.question, "res" : reponseArr});
          	
          	App.router.run(App.routes.THANK);
          });

      }.bind(this);
     
  };

  return questionController;
});
        