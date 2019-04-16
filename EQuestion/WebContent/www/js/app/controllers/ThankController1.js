define([ 'handlebars', 'text!templates/ThankTemplate.html',
		'text!templates/ThankHeaderTemplate.html', 'jquery', 'q',
		'jquery.mobile', 'datepicker' ], function(Handlebars, TemplateContent,
		TemplateHeader, $, Q) {

	var thankController = function($el) {
		this.$el = $el;

		// Show the page with network service
		this.do_lc_showThank = function(route, comp, identity, reponse) {
			if (comp && identity && reponse) {
				//do something
				//alert(JSON.stringify(reponse));

				App.today = null;
				App.today = setToday();
				//				var thank = {dateTime : today, identity : identity, company : comp.IATA, reponse : JSON.parse(reponse)};
				var var_lc_thank = {
					dateTime : App.today,
					identity : identity,
					company : comp.IATA,
					reponses : reponse
				};


				//alert(JSON.stringify(thank));

				App.network.startLoader();
				setLanguageAndBuildPage(var_lc_thank);
				App.network.stopLoader();
			} else {
				//do something else
			}

		}.bind(this);

		var setToday = function() {
			var var_lc_today = new Date();
			var var_lc_dd = var_lc_today.getDate();
			var var_lc_mm = var_lc_today.getMonth() + 1; //January is 0!
			var var_lc_yyyy = var_lc_today.getFullYear();
			var var_lc_hh = var_lc_today.getHours();
			var var_lc_min = var_lc_today.getMinutes();

			if (var_lc_dd < 10) {
				var_lc_dd = '0' + var_lc_dd;
			}

			if (var_lc_mm < 10) {
				var_lc_mm = '0' + var_lc_mm;
			}

			if (var_lc_hh < 10) {
				var_lc_hh = '0' + var_lc_hh;
			}

			if (var_lc_min < 10) {
				var_lc_min = '0' + var_lc_min;
			}

			var_lc_today = var_lc_dd + '-' + var_lc_mm + '-' + var_lc_yyyy + ' / ' + var_lc_hh + ':' + var_lc_min;

			return var_lc_today;
		}

		var setLanguageAndBuildPage = function(thank) {
			var var_lc_language = navigator.language || navigator.userLanguage;

			if (!localStorage.language) {
				if (var_lc_language == "fr" || var_lc_language == "uk" || var_lc_language == "en") {
					if (var_lc_language == "en") {
						localStorage.language = "uk";
					} else {
						localStorage.language = var_lc_language;
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

			var var_lc_header = this.$el.find("div[data-role='header']");
			var var_lc_content = this.$el.find("div[data-role='content']");

			// Get template flights list
			var var_lc_compileHeader = Handlebars.compile(TemplateHeader);
			var var_lc_compileTemplate = Handlebars.compile(TemplateContent);

			// Replace header and content by templates
			var_lc_header.replaceWith(var_lc_compileHeader);
			var_lc_content.replaceWith(var_lc_compileTemplate(thank));

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
			var var_lc_div = newWinToPrint();
			
			var var_lc_w = window.open('', '_system', 'location=yes');
			
			$(var_lc_w.document.body).html(var_lc_div);
			var_lc_w.print()
		};
		
		function newWinToPrint() {
			var var_lc_style	= $('<style>');
			
			var var_lc_st00	= "@page {size: landscape; margin:0.5cm;}"; //@page {size: portrait } /*ou landscape */
			var var_lc_st01 	= ".cell_imp{border:1px solid grey;font-size:60%;}";
			var var_lc_st02	= ".cellule_imp{border: 1px solid grey;background-color: CECECE;font-size:60%;font-weight: bold;}";
			var var_lc_st03 	= ".table_imp{-webkit-print-color-adjust: exact; margin:3px; border-collapse: collapse;text-align: center;border:1px solid grey; }";
			
			var_lc_style.append(var_lc_st00);
			var_lc_style.append(var_lc_st01);
			var_lc_style.append(var_lc_st02);
			var_lc_style.append(var_lc_st03);

			var var_lc_body	= 			$('<div>');

			var var_lc_div 	=           $('<div>'); 
			var var_lc_table   =           $('<table style="border-collapse:collapse; border:0; width:100%">');
			var var_lc_numPage = 			"1/1";
			
//			div.append(table);
			
			var var_lc_res1 = '<div>Date / Heure : <b>' + App.today + '</b></div>';
			var_lc_div.append(var_lc_res1);
			
			var var_lc_res2 = '<div>Nom & Prenom : <b>' + App.identity.name_01 + ' ' + App.identity.name_02 + '</b></div>';
			var_lc_div.append(var_lc_res2);
			var var_lc_res3 = '<div>Compagnie : <b>' + App.company.IATA + '</b></div>';
			var_lc_div.append(var_lc_res3);
			
			var var_lc_res4 = '<div>Vos reponses :</div>';
			var_lc_div.append(var_lc_res4);
			
			var var_lc_res5 = '<ul style="padding-left:45px">';
			
			var var_lc_res6 = '';
			for(var i in App.reponses) {
				var_lc_res6 += '<li style="list-style:circle"><b>' + App.reponses[i].rNum + ' : ';
				for (var j in App.reponses[i].res)
					var_lc_res6 += '<i>' + App.reponses[i].res[j].r + '</i>';
			}
			
			var_lc_div.append(var_lc_res5);
			var_lc_div.append(var_lc_res6);		
			
			return var_lc_div;
		}

		// Bind events in the page
		var bindingEventsPage = function() {
			console.log("ThankController: Set event handler for the view...");

			var var_lc_content = this.$el.find("div[data-role='content']");
			var var_lc_header = this.$el.find("div[data-role='header']");

			// Bind logout event to icon
			var_lc_header.find("#a_headerBack").click(function() {
				gotoListCompanies();
			});

			this.$el.find("#form-login").validate({
				submitHandler : submit
			});

			//print
			//			this.$el.find("#flagsBar").click(function(){
			//				printToFile();
			//			});

			var_lc_content.find("#div_butPrint").click(function() {
				printToFile();
			});

		}.bind(this);

		this.thank = function() {
			console.log("Print...");
			this.translate();
		}.bind(this);
	};

	return thankController;
});