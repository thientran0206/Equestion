define([ 'handlebars', 'text!templates/LoginHeaderTemplate.html',
		'text!templates/LoginTemplate.html', 'misc/sha1', 'jquery',
		'jquery.i18n/jquery.i18n', 'jquery.i18n/jquery.i18n.messagestore',
		'jquery.i18n/jquery.i18n.fallbacks', 'jquery.i18n/jquery.i18n.parser',
		'jquery.i18n/jquery.i18n.emitter', 'jquery.i18n/jquery.i18n.language',
		'text!jquery.i18n/_fr.json', 'text!jquery.i18n/_uk.json',
		'jquery.validate', 'jquery.mobile', 'datepicker' ], function(
		Handlebars, TemplateContent, TemplateHeader, sha1, $) {

	var LoginController = function($el) {
		this.$el = $el;
		var self = this;
		// Helper to make crtyo password
		var makeCrypto = function(mdp) {
			var crypto = CryptoJS.SHA1(
					CryptoJS.SHA1(mdp).toString(CryptoJS.enc.Hex) + 'Servair')
					.toString(CryptoJS.enc.Hex);
			return crypto;
		};

		this.translate = function(error) {
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

			try {
				$.i18n({
					locale : localStorage.language
				});

				$.i18n().load(
						'js/lib/jquery.i18n/_' + $.i18n().locale + '.json',
						$.i18n().locale).done(function() {
					self.buildPage(error);
				});
			} catch (e) {
				localStorage.clear();
				location.reload();
			}
		};

		this.buildPage = function(error) {

			var header = this.$el.find("div[data-role='header']");
			var content = this.$el.find("div[data-role='content']");
			var footer = this.$el.find("div[data-role='footer']");

			var compiledHeader = Handlebars.compile(TemplateHeader);
			var compiledContent = Handlebars.compile(TemplateContent);

			// Replace header and content by templates
			header.replaceWith(compiledHeader);
			content.replaceWith(compiledContent);

			self.bindingEventsPage();
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

		// Bind events in the page
		this.bindingEventsPage = function() {
			var content = this.$el.find("div[data-role='content']");
			var header = this.$el.find("div[data-role='header']");

			this.$el.find("#form-login").validate({
				submitHandler : submit
			});
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

		this.login = function() {
			console.log("Login...");
			this.translate();
		}.bind(this);
	};

	return LoginController;
});