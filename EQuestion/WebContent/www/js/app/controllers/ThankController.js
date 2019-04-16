define([ 'handlebars', 'text!templates/ThankTemplate.html',
		'text!templates/ThankHeaderTemplate.html', 'jquery', 'q',
		'jquery.mobile', 'datepicker' ], function(Handlebars, TemplateContent,
		TemplateHeader, $, Q) {

	var ThankController = function($el) {
		this.$el = $el;

		// Show the page with network service
		this.showThank = function(route, comp, identity, reponse) {
			if (comp && identity && reponse) {
				//do something
				//alert(JSON.stringify(reponse));

				App.today = null;
				App.today = setToday();
				//				var thank = {dateTime : today, identity : identity, company : comp.IATA, reponse : JSON.parse(reponse)};
				var thank = {
					dateTime : App.today,
					identity : identity,
					company : comp.IATA,
					reponses : reponse
				};


				//alert(JSON.stringify(thank));

				App.network.startLoader();
				setLanguageAndBuildPage(thank);
				App.network.stopLoader();
			} else {
				//do something else
			}

		}.bind(this);

		var setToday = function() {
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			var yyyy = today.getFullYear();
			var hh = today.getHours();
			var min = today.getMinutes();

			if (dd < 10) {
				dd = '0' + dd;
			}

			if (mm < 10) {
				mm = '0' + mm;
			}

			if (hh < 10) {
				hh = '0' + hh;
			}

			if (min < 10) {
				min = '0' + min;
			}

			today = dd + '-' + mm + '-' + yyyy + ' / ' + hh + ':' + min;

			return today;
		}

		var setLanguageAndBuildPage = function(thank) {
			var language = navigator.language || navigator.userLanguage;

			if (!localStorage.language) {
				if (language == "fr" || language == "uk" || language == "en") {
					if (language == "en") {
						localStorage.language = "uk";
					} else {
						localStorage.language = language;
					}
				} else {
					localStorage.language = "fr";
				}
			}

			$.i18n({
				locale : localStorage.language
			});
			try {
				$.i18n().load(
						'js/lib/jquery.i18n/_' + $.i18n().locale + '.json',
						$.i18n().locale).done(function(result) {
					buildPage(thank);
				});
			} catch (err) {
				localStorage.clear();
				location.reload();
			}
		};

		// Build the page
		var buildPage = function(thank) {
			// Set the id after datas has been downloaded
			this.$el.attr("id", "main-module");

			console.log("ThankController: Building page...");
			// Get the user name

			var header = this.$el.find("div[data-role='header']");
			var content = this.$el.find("div[data-role='content']");

			// Get template flights list
			var compileHeader = Handlebars.compile(TemplateHeader);
			var compileTemplate = Handlebars.compile(TemplateContent);

			// Replace header and content by templates
			header.replaceWith(compileHeader);
			content.replaceWith(compileTemplate(thank));

			//Remove footer
			$("[data-role='footer']").empty().removeClass("app-footer");

			// Bind events buttons, calendar, items list            
			bindingEventsPage();
		}.bind(this);

		var submit = function(form) {
			App.network.startLoader();
			//Print here
			//print();
			App.network.stopLoader();
		};

		var gotoListCompanies = function() {
			App.router.run(App.routes.COMPANIES);
		};

		var printToFile = function() {
			var div = newWinToPrint();
			
			var w = window.open('', '_system', 'location=yes');
			
			$(w.document.body).html(div);
			w.print()
		};
		
		function newWinToPrint() {
			var style	= $('<style>');
			
			var st00	= "@page {size: landscape; margin:0.5cm;}"; //@page {size: portrait } /*ou landscape */
			var st01 	= ".cell_imp{border:1px solid grey;font-size:60%;}";
			var st02	= ".cellule_imp{border: 1px solid grey;background-color: CECECE;font-size:60%;font-weight: bold;}";
			var st03 	= ".table_imp{-webkit-print-color-adjust: exact; margin:3px; border-collapse: collapse;text-align: center;border:1px solid grey; }";
			
			style.append(st00);
			style.append(st01);
			style.append(st02);
			style.append(st03);

			var body	= 			$('<div>');

			var div 	=           $('<div>'); 
			var table   =           $('<table style="border-collapse:collapse; border:0; width:100%">');
			var numPage = 			"1/1";
			
//			div.append(table);
			
			var res1 = '<div>Date / Heure : <b>' + App.today + '</b></div>';
			div.append(res1);
			
			var res2 = '<div>Nom & Prenom : <b>' + App.identity.name_01 + ' ' + App.identity.name_02 + '</b></div>';
			div.append(res2);
			var res3 = '<div>Compagnie : <b>' + App.company.IATA + '</b></div>';
			div.append(res3);
			
			var res4 = '<div>Vos reponses :</div>';
			div.append(res4);
			
			var res5 = '<ul style="padding-left:45px">';
			
			var res6 = '';
			for(var i in App.reponses) {
				res6 += '<li style="list-style:circle"><b>' + App.reponses[i].rNum + ' : ';
				for (var j in App.reponses[i].res)
					res6 += '<i>' + App.reponses[i].res[j].r + '</i>';
			}
			
			div.append(res5);
			div.append(res6);		
			
			return div;
		}

		// Bind events in the page
		var bindingEventsPage = function() {
			console.log("ThankController: Set event handler for the view...");

			var content = this.$el.find("div[data-role='content']");
			var header = this.$el.find("div[data-role='header']");

			// Bind logout event to icon
			header.find("#headerBack").click(function() {
				gotoListCompanies();
			});

			this.$el.find("#form-login").validate({
				submitHandler : submit
			});

			//print
			//			this.$el.find("#flagsBar").click(function(){
			//				printToFile();
			//			});

			content.find("#butPrint").click(function() {
				printToFile();
			});

		}.bind(this);

		this.thank = function() {
			console.log("Print...");
			this.translate();
		}.bind(this);
	};

	return ThankController;
});