define([ 'handlebars', 'text!templates/LoginHeaderTemplate.html',
		'text!templates/LoginTemplate.html', 'misc/sha1', 'jquery',
		'jquery.i18n/jquery.i18n', 'jquery.i18n/jquery.i18n.messagestore',
		'jquery.i18n/jquery.i18n.fallbacks', 'jquery.i18n/jquery.i18n.parser',
		'jquery.i18n/jquery.i18n.emitter', 'jquery.i18n/jquery.i18n.language',
		'text!jquery.i18n/_fr.json', 'text!jquery.i18n/_uk.json',
		'jquery.validate', 'jquery.mobile', 'datepicker' ], function(
		Handlebars, TemplateContent, TemplateHeader, sha1, $) {

	var loginController = function($el) {
		this.$el = $el;
		var var_lc_self = this; // local

		var makeCrypto = function(mdp) {
			var var_lc_crypto = CryptoJS.SHA1(
					CryptoJS.SHA1(mdp).toString(CryptoJS.enc.Hex) + 'Servair')
					.toString(CryptoJS.enc.Hex);
			return var_lc_crypto;
		};

		this.do_lc_translate = function(error) {
			var var_lc_language = navigator.language || navigator.userLanguage;

			if (!localStorage.language) {
				if (var_lc_language == "fr" || var_lc_language == "uk"
						|| var_lc_language == "en") {
					if (var_lc_language == "en") {
						localStorage.language = "uk";
					} else {
						localStorage.language = var_lc_language;
					}

				} else {
					localStorage.language = "fr";
				}
			}

			try {
				$.i18n({
					locale : localStorage.language
				});
				$.i18n().load(
						'js/lib/jquery.i18n/_' + $.i18n().locale + '.json',
						$.i18n().locale).done(function() {
							var_lc_self.do_lc_buildPage(error);
				});
			} catch (e) {
				localStorage.clear();
				location.reload();
			}
		};

		this.do_lc_buildPage = function(error) {
			var var_lc_header = this.$el.find("div[data-role='header']");
			var var_lc_content = this.$el.find("div[data-role='content']");
			var var_lc_footer = this.$el.find("div[data-role='footer']");

			var var_lc_compiledHeader = Handlebars.compile(TemplateHeader);
			var var_lc_compiledContent = Handlebars.compile(TemplateContent);

			// Replace header and content by templates
			var_lc_header.replaceWith(var_lc_compiledHeader);
			var_lc_content.replaceWith(var_lc_compiledContent);

			var_lc_self.do_lc_bindingEventsPage();
		};

		this.do_lc_bindingEventsPage = function() {
			var var_lc_content = this.$el.find("div[data-role='content']");
			var var_lc_header = this.$el.find("div[data-role='header']");

			this.$el.find("#form-login").validate({
				submitHandler : submit
			});
		};

		var submit = function(form) {
			App.network.startLoader();
			showCompanyList();
			App.network.stopLoader();
		};

		var showCompanyList = function() {
			localStorage.clear();
			App.router.run(App.routes.COMPANIES);
		};

		var switchLangage = function(language) {
			if (!language) {
				if (localStorage && localStorage.language) {
					language = localStorage.language;
				} else {
					language = 'fr';
				}
			}
			$.i18n({
				locale : language
			});
			localStorage.language = language;
			App.router.run(App.routes.HOME);
		};

		this.do_lc_login = function() {
			console.log("----------login----------");
			this.do_lc_translate();
		}.bind(this);
	};
	
	return loginController;
});