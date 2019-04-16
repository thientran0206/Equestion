/**
 * Created by H&V on 19/02/2016.
 */

define([
    'handlebars',
    'jquery'],
    function (Handlebars,$) {

    var JsonProcessing = function () {

        this.processFlightList = function (JsonObj) {
            var actualCodeClient;
            var jsonText = "";
            var saveFlights = [];
            $.each(JsonObj, function(index, value) {
                //avoid to add double flight in json
                if(saveFlights.indexOf(value.codeClient + value.numVol) != -1){
                    return;
                }
                else{
                    saveFlights.push(value.codeClient + value.numVol);
                }
                // Init the first client
                if(index == 0) {
                    actualCodeClient = value.codeClient;
                    jsonText += '{ "companies" : [{ "codeClient" : "' + value.codeClient +
                        '", "libClient" : "' + value.libClient +
                        '", "flights" : [';
                }

                // Check if the client have changed
                if(value.codeClient != actualCodeClient) {
                    // Erase the last coma after adding flight
                    if(jsonText.substr(jsonText.length - 1, 1) == ',') {
                        jsonText = jsonText.substring(0,jsonText.length-1);
                    }

                    jsonText += ']}, { "codeClient" : "' + value.codeClient +
                        '", "libClient" : "' + value.libClient +
                        '", "flights" : [';
                    actualCodeClient = value.codeClient;
                }

                // Add a flight for the actual client if numVol doesn't contains only letters (fake flight)
                if( !value.numVol.match(/^[a-zA-Z]/) ){
                    jsonText += '{ "codeClient" : "' + value.codeClient +
                        '", "numVol" : "' + value.numVol +
                        '", "heureDep" : "' + value.heureDep +
                        '", "codeEscale" : "' + value.codeEscale + '"},';
                }
            });

            // Check if the JSON resulting is not empty
            if(jsonText == "") {
                return JSON.parse("[]");
            }

            // Erase the last comma if needed
            if(jsonText.slice(-1) == ",") {
                jsonText = jsonText.substring(0,jsonText.length-1);
            }
            jsonText += ']}]}';

            return JSON.parse(jsonText);
        };

        var escape = function(key, val) {
            if (typeof(val)!="string") return val;
            return val
                .replace(/[\\]/g, '\\\\')
                .replace(/[\/]/g, '\\/')
                .replace(/[\b]/g, '\\b')
                .replace(/[\f]/g, '\\f')
                .replace(/[\n]/g, '\\n')
                .replace(/[\r]/g, '\\r')
                .replace(/[\t]/g, '\\t')
                .replace(/[\"]/g, '\\"')
                .replace(/\\'/g, "\\'");
        };

        this.processGlobalParticularities = function(jsonObj){

            // This method is not safe.
            // OBJECT => STRING => OBJECT : wtf ?
            // Create directly an object instead of a string 
            
            var jsonText = "";
            jsonObj = JSON.parse(JSON.stringify(jsonObj,escape));

            $.each (jsonObj, function(index, value) {
                if(index == 0){
                    jsonText += '{ "messages" : [{ "id": "' + value.id +
                    '", "endDate" : "' + value.endDate +
                    '", "startDate" : "' + value.startDate +
                    '", "flights" : "' + ((value.flights === "all") ? "" : value.flights) +'"'+
                    ', "comment" : "' + value.comment +
                    '", "centerId" : "' + value.center.id +
                    '", "dbLinkName" : "' + value.center.dbLinkName +
                    '"}';
                }
                else{
                     jsonText += ',{ "id": "' + value.id +
                     '", "endDate" : "' + value.endDate +
                     '", "startDate" : "' + value.startDate +
                     '", "flights" : "' + ((value.flights === "all") ? "" : value.flights) +'"'+
                     ', "comment" : "' + value.comment +
                     '", "centerId" : "' + value.center.id +
                     '", "dbLinkName" : "' + value.center.dbLinkName +
                     '"}';
                }
            });
            if(jsonText == ""){
                 jsonText = '{}';
            }
            else{
                 jsonText += ']}';
            }
            return JSON.parse(jsonText);
        };

        var arrayPrefixArticleExcluded = ["SW", "SL", "DI", "BB", "LA", "CARBO"];
        var articleExcludedForPsv = ["AP", "RF", "SB", "CA", "KB", "DI"];

        var classOrder = ["P", "J", "C", "W", "S", "Y", "M", "A", "B"];

        var orderClassesArray = function(classesArray,classesOrderArray){
            //order classes
            var newClassesArray = [];
            for(var i=0; i<classesOrderArray.length; i++){
                var classeName = classesOrderArray[i];
                if( classesArray[classeName] ){
                    newClassesArray.push( classesArray[classeName] );
                    classesArray[classeName] = null;
                }
            }
            //add classes not present in 'classesOrderArray'
            for(var curClasse in classesArray){
                if(classesArray[curClasse] !== null){
                    newClassesArray.push( classesArray[curClasse] );
                }
            }
            return newClassesArray;
        };

        var orderCommandeArray = function(commandeArray, order) {
            var newCommandeArray = {};

            order.forEach(function(classe) {
                if (commandeArray[classe]) {
                    newCommandeArray[classe] = commandeArray[classe];
                    commandeArray[classe] = null;
                }
            });

            for (var key in commandeArray) {
                if (commandeArray[key] != null) {
                    newCommandeArray[key] = commandeArray[key];
                }
            }

            return newCommandeArray;
        };


        this.processFlightDetail = function(flightDetail) {
            var classesArray = [];
            var officeArray = [];

            for (var key in flightDetail.commandes) {
                var hasAj = false;
                var tabComByClasse = flightDetail.commandes[key];
                var cumulRepas = 0;

                var nbRgml = 0;
                var nbSpml = 0;
                var nbAj = 0;

                var psv = [];

                tabComByClasse.forEach(function (elem) {
                    if (elem.codeOffice != '-') {
                        if (officeArray.indexOf(elem.codeOffice) == -1) {
                            officeArray.push(elem.codeOffice);
                        }
                    }

                    //psv constructor
                    if(elem.codeClasse != "A" && elem.codeClasse != "B" && elem.numTronc == 1){
                        if (elem.article.codeArticle.indexOf("COMPLEMENT") == -1) {
                            var typeMeal = elem.article.codeArticle.substring(0, 2);
                            if (articleExcludedForPsv.indexOf(typeMeal) == -1 && !elem.special) {
                                psv[parseInt(elem.ordreService)] = elem.article.codeArticle.substring(0, 9);
                            }
                        }
                    }

                    if (elem.nbAju == null) {
                        elem.nbAju = 0;
                    }
                    elem.hasAj = false;
                    if (elem.nbAju != 0 ||  elem.ajust) {
                        elem.hasAj = true;
                    }
                    
                    try{
                    	if (elem.hasAjust) elem.hasAj =true;
                    }catch(e){}
                   

                    var exclude = false;
                    arrayPrefixArticleExcluded.forEach(function (prefix) {
                        exclude = exclude || (elem.article.codeArticle.indexOf(prefix) == 0);
                    });

                    if (elem.codeClasse == "A" || elem.codeClasse == "B") {
                        if (elem.numTronc == 1 && !exclude && !elem.isComplement) {
                            cumulRepas += (elem.cdeInit + elem.nbAju);
                            if (elem.nbAju > 0) {
                                nbAj += elem.nbAju;
                            }
                            if(elem.special){
                                nbSpml += elem.cdeInit;
                            }
                            else{
                                nbRgml += elem.cdeInit;
                            }
                        }
                    } else {
                        if (elem.ordreService != null && (elem.ordreService == 1) && elem.numTronc == 1 && !exclude && !elem.isComplement) {
                            cumulRepas += (elem.cdeInit + elem.nbAju);
                            if (elem.nbAju > 0) {
                                nbAj += elem.nbAju;
                            }
                            if(elem.special){
                                nbSpml += elem.cdeInit;
                            }
                            else{
                                nbRgml += elem.cdeInit;
                            }
                        }
                    }

                    if (nbAj > 0) {
                        hasAj = true;
                    }
                });

                var classe = {
                    codeClasse : key , hasAj : hasAj , summary: cumulRepas, nbAJ: nbAj, nbSPML: nbSpml, nbRGML: nbRgml, psv: psv
                };

                classesArray[key] = classe;
            }

            //correct summary for classes A and B
            var ajustClassB = false;
            if (classesArray.A) {
                if (parseInt(classesArray.A.summary) > 3) {
                    ajustClassB = true;
                    classesArray.A.summary = Math.floor(classesArray.A.summary/ 2);
                    classesArray.A.summary = Math.floor(classesArray.A.nbSPML / 2);
                    classesArray.A.summary = Math.floor(classesArray.A.nbRGML / 2);
                }
                classesArray.A.version = classesArray.A.summary;
                classesArray.A.hasVersion = true;
            }

            if (classesArray.B) {
                if (ajustClassB) {
                	classesArray.B.summary = Math.floor(classesArray.B.summary /2);
                	classesArray.B.summary = Math.floor(classesArray.B.nbSPML / 2);
                	classesArray.B.summary = Math.floor(classesArray.B.nbRGML / 2);
                }
                classesArray.B.version = classesArray.B.summary;
                classesArray.B.hasVersion = true;
            }

            classesArray = orderClassesArray(classesArray, classOrder);

            if (!flightDetail.classes)
            	Handlebars.Utils.extend(flightDetail,{classes:classesArray});
            else
            	flightDetail.classes = classesArray;

            if (!flightDetail.offices)
            	Handlebars.Utils.extend(flightDetail,{offices:officeArray});
            else
            	flightDetail.offices = officeArray;

            flightDetail.commandes = orderCommandeArray(flightDetail.commandes, classOrder);
        };

        this.storeUpdateToPush = function(url, data, method) {
            // The object which contains all the informations for update.
            var objectToPush = {
                "method": method,
                "url": url,
                "obj": data
            };

            // json for the flight
            var toPush = JSON.parse(localStorage.getItem(App.keys.KEY_TOPUSH));

            if (toPush == null) {
                toPush = [];
            }

            // Insert in the json a new object to send to the server when the connexion will be back.
            toPush.push(objectToPush);

            App.network.storeFlightJson(App.keys.KEY_TOPUSH, toPush);
        };
    };

    return JsonProcessing;
    
});