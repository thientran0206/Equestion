$(document).bind("mobileinit", function()
{
	if (navigator.userAgent.indexOf("Android") != -1) {
		$.mobile.allowCrossDomainPages = true;
	    $.mobile.zoom.enabled = false;
	    $.mobile.buttonMarkup.hoverDelay = 0; //defaults 200
	    $.mobile.defaultDialogTransition = 'none';
	    $.mobile.defaultPageTransition = 'none';
	}
});