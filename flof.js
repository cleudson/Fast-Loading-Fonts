(function(){
	var flof = function(sheets){
		"use strict";
		var canStore = (window.localStorage && window.sessionStorage) != null;
		var regArg = /(\[object )(.*)(\])/i;
		var argType = regArg.exec(Object.prototype.toString.call( sheets ))[2];
		var stylesheets = (argType === "Array") ? sheets : ((argType === "Object") ? [sheets] : arguments);
		var sheetsIndex;
		var updatePreffix = "Update_";
		var now = new Date();
		function checkUpdate ( storageType ) {
			if (storageType.length){
		    	for(var key in storageType){
		    		if(key.indexOf(updatePreffix) != -1){
		    			var updateEntry = key;
		    			var updateContent = key.toString().replace(updatePreffix,"");
		    			var updateDateTime = new Date(parseInt(storageType[key]));
		    			if(updateDateTime < now ){
		    				delete storageType[updateEntry];
		    				delete storageType[updateContent];
		    			}
		    		}
				}
			}
		}
		function addEventListener(elem, event, func) {
	        elem.addEventListener ? elem.addEventListener(event, func, false) : elem.attachEvent && elem.attachEvent("on" + event, func)
	    }

	    function appendOnHead (elem){
	    	document.getElementsByTagName("head")[0].appendChild(elem);
	    }
	    function insertStyleNode(cssContent) {
	        var styleNode = document.createElement("style");
	        styleNode.innerHTML = cssContent;
	        appendOnHead(styleNode);
	    }
	    function checkCallback (callback){
	    	if(callback && (typeof callback === "function")) {
	    		if(!canStore && callback === ("error" || "loading")){
	    			console("This Browser do not supports Browser Storage. 'Error' or 'loading' are not allowed.");
	    		}
	    		else{
	    			callback();
	    		}
	    	}
	    }

			
	    function getStyleSheet() {
			sheetsIndex = ++sheetsIndex || 0;
	    	if(sheetsIndex < stylesheets.length){
	    		

			    var cssUrl = (stylesheets[sheetsIndex]["css"] || stylesheets[sheetsIndex]).toString().replace(".css", "") + ".css";

			    var updateTime = Math.abs(stylesheets[sheetsIndex]["update"]);
			    var storageType = stylesheets[sheetsIndex]["storage"] === "local" ? window.localStorage : window.sessionStorage;
			    var cssContent;

		        if (canStore){
		            if (storageType[cssUrl]) {
		            	insertStyleNode(storageType[cssUrl]);
		            	getStyleSheet();

		            }
		            else {
		                var request = new XMLHttpRequest;
		                request.open("GET", cssUrl, true);
		                var i = sheetsIndex;
		                addEventListener(request, "load", function() {
		                    if(request.readyState === 4){
		                    	if(request.status < 400){
		                    		cssContent = request.responseText;
		                    		storageType[updatePreffix + cssUrl] = now.setDate( now.getDate() + ( ( updateTime || 12 )/24 ) );
		                    		storageType[cssUrl] = cssContent;
									insertStyleNode(cssContent);
									checkCallback(stylesheets[i]["ready"]);
		                    	};
		                    }
		                });
		                addEventListener(request, "loadstart", checkCallback(stylesheets[i]["loading"]));
		                addEventListener(request, "error", checkCallback(stylesheets[i]["error"]));
		                request.send();
		                getStyleSheet();
		            }
		        }
		        else {
		            var linkElement = document.createElement("link");
		            linkElement.href = cssUrl;
		            linkElement.rel = "stylesheet";
		            linkElement.type = "text/css";
		            appendOnHead(linkElement);
		            checkCallback(stylesheets[i]["loading"]);
		            checkCallback(stylesheets[i]["ready"]);
		            checkCallback(stylesheets[i]["error"]);
		            getStyleSheet();
		        }

			}

	    };
		if(canStore){
			checkUpdate(localStorage);
			checkUpdate(sessionStorage);
		};
		getStyleSheet(); 
	};
	window.flof = flof;
})();