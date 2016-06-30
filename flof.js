/**
 * @fileoverview utilities for load css asynchronously or from web storage
 * @author cleudsoncunha@gmail.com | https://github.com/cleudson (Cleudson Cunha)
 */
(function(_localStorage, _sessionStorage){
	var flof = function(sheets){
		"use strict";
		// asserts if web storage is available
		var canStore = (_localStorage && _sessionStorage) != null;
		// capture the way the arguments is passed
		var regArg = /(\[object )(.*)(\])/i;
		var argType = regArg.exec(Object.prototype.toString.call( sheets ))[2];
		var stylesheets = (argType === "Array") ? sheets : ((argType === "Object") ? [sheets] : arguments);
		// interator of sheets
		var sheetsIndex;
		// prefixx for update time
		var updatePreffix = "Update_";
		// actual time
		var now = new Date();
		/**
	      * @desc checks if the css information on local storage must be renewed
	    */
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
		/**
	      * @desc cleans local storage
	      * @param object key updateEntry - key that references update time
	      * @param object key targetConten - key that references css content
	    */
		function cleanLocal(updateEntry, targetContent){
			delete _localStorage[updateEntry];
			delete _localStorage[targetContent];
		}
		/**
	      * @desc general function to create event listener
	      * @param object elem - element that will receive listener
	      * @param string event - event type
	      * @param function func - function that will called on event
	    */				
		function addEventListener(elem, event, func) {
	        elem.addEventListener ? elem.addEventListener(event, func, false) : elem.attachEvent && elem.attachEvent("on" + event, func)
	    }
	    /**
	      * @desc appends elements o hmtl head tag
	      * @param object elem - html node that will be appended
	    */	
	    function appendOnHead (elem){
	    	document.getElementsByTagName("head")[0].appendChild(elem);
	    }
	    /**
	      * @desc inserts style tag with css content
	      * @param string cssContent - css rules on style tag
	    */	
	    function insertStyleNode(cssContent) {
	        var styleNode = document.createElement("style");
	        styleNode.innerHTML = cssContent;
	        appendOnHead(styleNode);
	    }
	    /**
	      * @desc inserts link tag with css url
	      * @param string cssUrl - URL of the css file
	    */	
	    function insertLinkNode(cssUrl){
	    	var linkElement = document.createElement("link");
            linkElement.href = cssUrl;
            linkElement.rel = "stylesheet";
            linkElement.type = "text/css";
            appendOnHead(linkElement);
	    }
	    /**
	      * @desc check if callback exists and can be called
	      * @param function callback - function that will be called
	    */	
	    function checkCallback (callback){
	    	if(callback && (typeof callback === "function")) {
	    		callback();
	    	}
	    }
	    /**
	      * @desc brings stylesheets content or url to document
	    */	
			
	    function getStyleSheet() {
			sheetsIndex = ++sheetsIndex || 0;
	    	if(sheetsIndex < stylesheets.length){
			    var cssUrl = (stylesheets[sheetsIndex]["css"] || stylesheets[sheetsIndex]).toString().replace(".css", "") + ".css";
			    var updateTime = Math.abs(stylesheets[sheetsIndex]["update"]);
			    // storage type choosen by the developer
			    var chosenStorage = stylesheets[sheetsIndex]["storage"];
			    // sets if the web storage will local, session or not allowed
			    var storageType = (chosenStorage === "local") ? _localStorage : ((chosenStorage === false) ? false : _sessionStorage);
			    var cssContent;
			    // if web storage exists and the storage is allowed
		        if (canStore && storageType){
		        	// if the stylesheet content is already in storage
		            if (storageType[cssUrl]) {
		            	insertStyleNode(storageType[cssUrl]);
		            	getStyleSheet();
		            }
		            else {
		            	// first time adds css link calling
		            	if(!_localStorage["flofActive"] && !_sessionStorage["flofActive"]){
		            		insertLinkNode(cssUrl);
		            	}
		            	// second time adds css inside style tag, creating a xhr request
		            	else{
			                var request = new XMLHttpRequest;
			                request.open("GET", cssUrl, true);
			                var i = sheetsIndex;
			                addEventListener(request, "load", function() {
			                	// request is successfull
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
			// all loops ocurred
			else{
				storageType["flofActive"] = "true";
			}

	    };
		checkUpdate();
		getStyleSheet(); 
	};
	window.flof = flof;
})(window.localStorage, window.sessionStorage);