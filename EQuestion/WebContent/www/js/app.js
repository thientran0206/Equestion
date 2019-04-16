/**
 * Created by docdoku on 17/03/15.
 *
 * Start point to eCustomer client app
 *
 */
requirejs.config({
    // Base dir for all js
    baseUrl: 'js/lib',
    // paths and aliases
    paths: {
        jquery: 'jquery',
        handlebars:'handlebars',
        text: 'text',
        pathparser:'pathparser',
        'jquery.mobile': 'jquery.mobile',
        'jquery.slides.min':'jquery.slides.min',
        app: '../app',
        view: '../app/view',
        service: '../app/service',
        controllers: '../app/controllers',
        hnv: '../app/hnv',
        templates: '../app/templates',
        jsPDF:'./jsPDF/jspdf',
        jsPDFaddimage:'./jsPDF/jspdf.plugin.addimage',
        jsPDFfromHtml:'./jsPDF/jspdf.plugin.from_html',
        jsPDFfontsMetrics:'./jsPDF/jspdf.plugin.standard_fonts_metrics',
        jsPDFtextToSize:'./jsPDF/jspdf.plugin.split_text_to_size',
        jsPDFcell:'./jsPDF/jspdf.plugin.cell',
        jsPDFAutoTable:'./jsPDF/jspdf.plugin.autotable',      
        jsSlides:	'jquery.slides.min'
    },
    shim: {
        'jquery.validate': 'jquery.validate',
        'jquery.i18n/jquery.i18n':'jquery.i18n/jquery.i18n',
        'jquery.i18n/jquery.i18n.messagestore':'jquery.i18n/jquery.i18n.messagestore',
        'jquery.i18n/jquery.i18n.fallbacks':'jquery.i18n/jquery.i18n.fallbacks',
        'jquery.i18n/jquery.i18n.parser':'jquery.i18n/jquery.i18n.parser',
        'jquery.i18n/jquery.i18n.emitter':'jquery.i18n/jquery.i18n.emitter',
        'jquery.i18n/jquery.i18n.language':'jquery.i18n/jquery.i18n.language',

        'jsPDF':{
            exports: 'window'
        },

        'jsPDFaddimage':{
            deps:['jsPDF'],
            exports: 'jsPDF'
        },

        'jsPDFfromHtml':{
            deps:['jsPDF'],
            exports: 'jsPDF'
        },

        'jsPDFfontsMetrics':{
            deps:['jsPDF'],
            exports: 'jsPDF'
        },

        'jsPDFtextToSize':{
            deps:['jsPDF'],
            exports: 'jsPDF'
        },

        'jsPDFcell':{
            deps:['jsPDF'],
            exports: 'jsPDF'
        },

        'jsPDFAutoTable':{
            deps:['jsPDF'],
            exports: 'jsPDF'
        }

    },
    waitSeconds : 120
});

var App = {       
    paths : {
        'PATH_FOLDER_IMAGE': "./img/logo/planesTails_none.png"
    },
    // Globals Constants keys local storage
    keys : {
    	KEY_STORAGE_CREDENTIAL: "KEY_STORAGE_CREDENTIAL",
        KEY_COMP_LIST: "KEY_COMP_LIST",
        
        	
        KEY_STORAGE_CREDENTIAL: "KEY_STORAGE_CREDENTIAL",
        KEY_FLIGHT_LIST: "KEY_FLIGHT_LIST",
        KEY_FLIGHT_DETAIL: '/flights/',
        KEY_STORAGE_PROFILE: 'KEY_STORAGE_PROFILE',
        KEY_TOPUSH: 'toPush'
    },
    // Globals Constants routes
    routes : {
        HOME 		: "/",
        COMPANIES	: "/companies",
        IDENTITIES	: "/identities",
        
        COMPANY		: "/company",
        IDENTITY	: "/identity",
        
        QUESTION	: "/question",
        THANK		: "/thank",
        
        QUESTIONS: "/questions",
        QUESTION01: "/question01",
        QUESTION02: "/question02",
        QUESTION03: "/question03",
        QUESTION04: "/question04",       
       
        DB_ROUTE	: '/EQuestion/db',
    },
    format : {
        DATE_FORMAT_FR : "dd-mm-yy",
        DATE_FORMAT_FR_SLASH : "dd/mm/yy",
        DATE_FORMAT_DATABASE : "yy-mm-dd"       
    },
    roles : {        
        REG : "REG"
    },
    
    db : {
    	companies:
		[ {'IATA': 'AF', 	'logo': './img/logo/planesTails_AF.png'},
		  {'IATA': 'AN', 	'logo': './img/logo/planesTails_AN.png'},
		  {'IATA': 'CZ', 	'logo': './img/logo/planesTails_CZ.png'},
		  {'IATA': 'DL', 	'logo': './img/logo/planesTails_DL.png'},
		  {'IATA': 'EY', 	'logo': './img/logo/planesTails_EY.png'},
		  {'IATA': 'JL', 	'logo': './img/logo/planesTails_JL.png'},
		  {'IATA': 'KE', 	'logo': './img/logo/planesTails_KE.png'},
		  {'IATA': 'TN', 	'logo': './img/logo/planesTails_TN.png'},
		  {'IATA': 'UA', 	'logo': './img/logo/planesTails_UA.png'},        				  
		  {'IATA': 'VN', 	'logo': './img/logo/planesTails_VN.png'},		  
        ],
        identities:{        		
        	'AF':
    			[ {'name_01': 'AF01', 	'name_02': 'AF01_'},
    			  {'name_01': 'AF02', 	'name_02': 'AF01_'},
    			  {'name_01': 'AF03', 	'name_02': 'AF01_'},
    			  {'name_01': 'AF04', 	'name_02': 'AF01_'},
    			  {'name_01': 'AF05', 	'name_02': 'AF01_'},
    			  {'name_01': 'AF06', 	'name_02': 'AF01_'},
    			  {'name_01': 'AF07', 	'name_02': 'AF01_'},
    			  {'name_01': 'AF08', 	'name_02': 'AF01_'},			  
    			  {'name_01': 'AF09', 	'name_02': 'AF01_'}			
                ],
             'VN':
    			[ {'name_01': 'VN01', 	'name_02': 'AF01_'},
    			  {'name_01': 'VN02', 	'name_02': 'AF01_'},
    			  {'name_01': 'VN03', 	'name_02': 'AF01_'},
    			  {'name_01': 'VN04', 	'name_02': 'AF01_'},
    			  {'name_01': 'VN05', 	'name_02': 'AF01_'},
    			  {'name_01': 'VN06', 	'name_02': 'AF01_'},
    			  {'name_01': 'VN07', 	'name_02': 'AF01_'},
    			  {'name_01': 'VN08', 	'name_02': 'AF01_'},			  
    			  {'name_01': 'VN09', 	'name_02': 'AF01_'}			
    			]
        }    
    
    },
    
    questions : {
    	1: {'q':"Q1", "res": [{r:"r11", val: 1},{r:"r12", val: 2}, {r:"r13", val:3},{r:"r14", val:4}]},
    	2: {'q':"Q2", "res": [{r:"r21", val: 1},{r:"r22", val: 2}, {r:"r23", val:3},{r:"r24", val:4}]},
    	3: {'q':"Q3", "res": [{r:"r31", val: 1},{r:"r32", val: 2}, {r:"r33", val:3},{r:"r34", val:4}]},
    	4: {'q':"Q4", "res": [{r:"r41", val: 1},{r:"r42", val: 2}, {r:"r43", val:3},{r:"r44", val:4}]},
    	5: {'q':"Q5", "res": [{r:"r51", val: 1},{r:"r52", val: 2}, {r:"r53", val:3},{r:"r54", val:4}]},
    	6: {'q':"Q6", "res": [{r:"r61", val: 1},{r:"r62", val: 2}, {r:"r63", val:3},{r:"r64", val:4}]},
    	7: {'q':"Q7", "res": [{r:"r71", val: 1},{r:"r72", val: 2}, {r:"r73", val:3},{r:"r74", val:4}]},
    	8: {'q':"Q8", "res": [{r:"r81", val: 1},{r:"r82", val: 2}, {r:"r83", val:3},{r:"r84", val:4}]}
    },
    
    reponses : []
};

// Start the main app logic.
requirejs([
        'controllers/RouteController',   
        'service/NetWorking',   
        'handlebars',
        'jquery',
        'jquery.mobile',
        'datepicker',
        'cordova.js'],
    function (RouteController, NetWorking, Handlebars, $) {

    $(document).ready(function() {
        //-khai bao-------------------
    	var initHandlerbarsHelpers = function() {
            // Register handlebar helper to add image
            Handlebars.registerHelper("getImage", function(path) {
                // Helper to put planes tails icons for each company
                return "<img src='" + path + "' onerror='this.src = \"./img/logo/planesTails_none.png\"'>";
            });
    
            Handlebars.registerHelper('t', function(i18n_key, complement) {
                var result;
                if(typeof complement === "string"){
                    var key = i18n_key + complement;
                    result = $.i18n(key);
                } else {
                    result = $.i18n(i18n_key);
                }

                return new Handlebars.SafeString(result);
            });

            Handlebars.registerHelper('equal', function(val1, val2, options){
                if(val1 == val2) {
                    return options.fn(this);
                }
                return options.inverse(this);
            });
        };
        
        var isMobileOrTablet = function() {
			var check = false;
			(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
			return check;
		};
		
        var initApp = function() {   
        	 // create global networking service
            App.network = new NetWorking();
            // create global router
            App.router = new RouteController();
            // start routes registration
            App.router.init();
          
            if (!isMobileOrTablet()) {              
            } else {               
                document.addEventListener("deviceready", onDeviceReady, false);
            }
            
            // run home page if no already connected else run flights page
            if (localStorage.getItem(App.keys.KEY_STORAGE_CREDENTIAL) === null || localStorage.getItem(App.keys.KEY_STORAGE_PROFILE) === null) {
                console.log("Begin : no keys stored...");
                App.router.run(App.routes.HOME);
            } else {
                console.log("Begin : with key stored...");              
                App.router.run(App.routes.HOME);
            }
            App.currentDate = $.datepicker.formatDate(App.format.DATE_FORMAT_FR,new Date());
           
        };

        //-khoi dong chuong trinh-------------------
        initHandlerbarsHelpers();
        initApp();

        var lastStatus = "";
        function onDeviceReady() {
            document.addEventListener("offline", eventOffline, false);
            document.addEventListener("online", eventOnline, false);
            document.addEventListener("pause", eventPause, false);
            checkConnection();
        }

        function checkConnection() {
            var networkState = navigator.connection.type;
                      console.log("NETWORK CHANGED : ", networkState);
            if(networkState != lastStatus){
                lastStatus = networkState;
                console.log("Network connection switched to : ", networkState);
                modifyBaseUrl(networkState);
            }
        }

        function modifyBaseUrl(networkState){
            switch(networkState){
                case Connection.ETHERNET:
                case Connection.WIFI:
                    console.log("INTERNAL API SET");
                    App.paths.BASE_URL_API = App.paths.url_list[App.environment].INTERNAL.BASE_URL_API;
                    App.paths.BASE_URL_PLANE_TAILS = App.paths.url_list[App.environment].INTERNAL.BASE_URL_PLANE_TAILS;
                    break;
                case Connection.CELL:
                case Connection.CELL_2G:
                case Connection.CELL_3G:
                case Connection.CELL_4G:
                    console.log("EXTERNAL API SET");
                    App.paths.BASE_URL_API = App.paths.url_list[App.environment].EXTERNAL.BASE_URL_API;
                    App.paths.BASE_URL_PLANE_TAILS = App.paths.url_list[App.environment].EXTERNAL.BASE_URL_PLANE_TAILS;
                    break;
                case Connection.UNKNOWN:
                case Connection.NONE:
                    console.log("no connection");
                    break;
                default:
                    console.log("no connection");
            }
        }

        //Is fired when connection is lost
        function eventOffline(){
            checkConnection();
        }

        //Is fired when connection is backed up
        function eventOnline(){
            checkConnection();
            // Check if there are updates to push
            App.network.checkIfUpdateToPush();
        }

        //Is fired when application is paused
        function eventPause(){
            //TODO: Erase plane related localstorage stuff ? Have to dial about that
        }
    });
});
