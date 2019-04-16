define(['handlebars',
        'text!templates/QuestionTemplate.html',
        'text!templates/QuestionHeaderTemplate.html',
        'jquery',
        'q',
        'jquery.mobile',
        'datepicker'],
    function (Handlebars,TemplateContent,TemplateHeader,$,Q) {

    var QuestionController = function ($el) {

    	var reponseArr = [];
    	
		//Bien kiem tra question obtional
		var checkQuestionOptional = false;
		//Bien kiem tra question co multiple choice
		var checkQuestionMultiple = false;
    	
        this.$el = $el;

        // Show the page with network service
        this.showQuestion = function(route, comp, identity, qNum) {  //route + iata : ex: /identity/vn
        	if (comp && identity && qNum){
        		qNum = App.question;
        		
        		if(qNum == 3||qNum == 4||qNum == 5||qNum == 6||qNum == 7) {
        			$("#butTerminer").remove();
        			checkQuestionOptional = true;
        		}
        		
        		if(qNum == 8) {
        			$("#butPasser").remove();
        			checkQuestionMultiple = true;
        		}
        		
        		var question = {question : App.questions[qNum], company : comp, questionOptional : checkQuestionOptional, questionMultiple : checkQuestionMultiple};
            		
    			if (question){
        			App.network.startLoader();
        			setLanguageAndBuildPage(question);
        			App.network.stopLoader();
    			}
    
        	} else{
//        		gotoListCompanies();
        	}   
          
        }.bind(this);               

        var setLanguageAndBuildPage = function(question){
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
          
            var header = this.$el.find("div[data-role='header']");
            var content = this.$el.find("div[data-role='content']");

            // Get template flights list
            var compileHeader 	= Handlebars.compile(TemplateHeader);
            var compileTemplate = Handlebars.compile(TemplateContent);

            // Replace header and content by templates
            header.replaceWith(compileHeader);
            content.replaceWith(compileTemplate(question));
       
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
            var content = this.$el.find("div[data-role='content']");
            var header = this.$el.find("div[data-role='header']");

            // Bind logout event to icon
            header.find("#headerBack").click(function(){
            	gotoListIdentities();
            });
            
            
//            var processReponse = function(reponseR, reponseV) {
//            	
//            	if(App.question < 4) {
//
//            		reponseArr.push({"r" : reponseR, "val" : reponseV});
//            		App.reponses.push({"rNum" : "R" + App.question, "res" : reponseArr});
//                	            		
//               		App.question++;
//                    App.router.run(App.routes.QUESTION); 
//            	}
//            	//App.question == 4
//               	else {
//               		reponseArr.push({"r" : reponseR, "val" : reponseV});              		           	
//               	}
//            }

                  
                       
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
            content.find(".hub").each(function() {
                $(this).click(function() {
                	
                	//Xu ly reponse ma client da chon
                	var reponseR = $(this).data("reponse-res");
                	var reponseV = $(this).data("reponse-val");
                              	
                	if(App.question < 8) {
                		$(this).css("background", "gray");
                		
                		reponseArr.push({"r" : reponseR, "val" : reponseV});
                		App.reponses.push({"rNum" : "R" + App.question, "res" : reponseArr});            	                   	        

                   		App.question++;
                        App.router.run(App.routes.QUESTION); 
                	}
                	//App.question == 4
                   	else {
                   		
                   		if (objectPropInArray(reponseArr, 'r', reponseR)) {
                   			$(this).css("background", "white");
                   			
                   			var index = findIndexValueInArray(reponseArr, reponseV);
                    		reponseArr.splice( index, 1 );
                   		}
                   			
                   		else {
                   			$(this).css("background", "gray");
                   			
                   			reponseArr.push({"r" : reponseR, "val" : reponseV});
                   		}
                   	}
                	                	
                });
            });           
            
            
            content.find("#butPasser").click(function(){
            	// Xu ly reponse == null o question optional 
            	
            	App.reponses.push({"rNum" : "R" + App.question, "res" : reponseArr});
            	
            	App.question++;
                App.router.run(App.routes.QUESTION);
            	
            });
            
            content.find("#butTerminer").click(function(){
       			reponseArr.sort(function(a, b){
          			 return a.val - b.val;
          		})
          		
            	// Xu ly reponse multiple o question multiple            	
            	App.reponses.push({"rNum" : "R" + App.question, "res" : reponseArr});
            	
            	App.router.run(App.routes.THANK);
            });

        }.bind(this);
       
    };

    return QuestionController;
});
