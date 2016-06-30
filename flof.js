(function(_localStorage, _sessionStorage){
	var flof = function(sheets){
		"use strict";
		var canStore = (_localStorage && _sessionStorage) != null;
		var regArg = /(\[object )(.*)(\])/i;
		var argType = regArg.exec(Object.prototype.toString.call( sheets ))[2];
		var stylesheets = (argType === "Array") ? sheets : ((argType === "Object") ? [sheets] : arguments);
		var sheetsIndex;
		var updatePreffix = "Update_";
		var now = new Date();
		function checkUpdate () {
			if (_localStorage.length){
		    	for(var key in _localStorage){
		    		if(key.indexOf(updatePreffix) != -1){
		    			var updateEntry = key;
		    			var updateContent = key.toString().replace(updatePreffix,"");
		    			var updateDateTime = new Date(parseInt(_localStorage[key]));
		    			if(updateDateTime < now ){
		    				cleanLocal(updateEntry, updateContent);
		    			}
		    		}
				}
			}
		}
		function cleanLocal(updateEntry, targetContent){
			delete _localStorage[updateEntry];
			delete _localStorage[targetContent];
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
	    function insertLinkNode(cssUrl){
	    	var linkElement = document.createElement("link");
            linkElement.href = cssUrl;
            linkElement.rel = "stylesheet";
            linkElement.type = "text/css";
            appendOnHead(linkElement);
	    }
	    function checkCallback (callback){
	    	if(callback && (typeof callback === "function")) {
	    		callback();
	    	}
	    }

			
	    function getStyleSheet() {
			sheetsIndex = ++sheetsIndex || 0;
	    	if(sheetsIndex < stylesheets.length){
	    		

			    var cssUrl = (stylesheets[sheetsIndex]["css"] || stylesheets[sheetsIndex]).toString().replace(".css", "") + ".css";

			    var updateTime = Math.abs(stylesheets[sheetsIndex]["update"]);
			    var chosenStorage = stylesheets[sheetsIndex]["storage"];
			    var storageType = (chosenStorage === "local") ? _localStorage : ((chosenStorage === false) ? false : _sessionStorage);
			    var cssContent;

		        if (canStore && storageType){
		            if (storageType[cssUrl]) {
		            	insertStyleNode(storageType[cssUrl]);
		            	getStyleSheet();
		            }
		            else {
		            	// first time adds css link calling
		            	if(!_localStorage["flofActive"] && !_sessionStorage["flofActive"]){
		            		insertLinkNode(cssUrl);
		            		storageType["flofActive"] = "true";
		            	}
		            	// second time adds css inside style tag
		            	else{
			                var request = new XMLHttpRequest;
			                request.open("GET", cssUrl, true);
			                var i = sheetsIndex;
			                addEventListener(request, "load", function() {
			                    if(request.readyState === 4 && request.status < 400){
		                    		cssContent = request.responseText;
		                    		storageType[cssUrl] = cssContent;
									insertStyleNode(cssContent);
									checkCallback(stylesheets[i]["ready"]);
									if(storageType === _localStorage){
										// inserts update time
										storageType[updatePreffix + cssUrl] = now.setDate( now.getDate() + ( ( updateTime || 6 )/24 ) );
									}
									else{
										// cleans former update time in localstorage
										cleanLocal((updatePreffix + cssUrl), cssUrl);
									}

			                    }
			                    // request error
			                    else{
			                    	insertLinkNode(stylesheets[i]["fallback"]);
			                    }
			                });
			                addEventListener(request, "error", checkCallback(stylesheets[i]["error"]));
			                request.send();
			                // call next stylesheet
			                getStyleSheet();
			            }
		            }
		        }
		        else {
		            insertLinkNode(cssUrl);
		            // call next stylesheet
		            getStyleSheet();
		        }
			}

	    };
		checkUpdate();
		getStyleSheet(); 
	};
	window.flof = flof;
})(window.localStorage, window.sessionStorage);