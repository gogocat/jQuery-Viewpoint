/*
*	jQueryDeclear
*	Copyright (c) 2014, Adam Chow
*	BSD License
*	[https://github.com/gogocat/jQuery-Declarative]
*/

/* JSOL
 * Copyright 2010, Google Inc.
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *     * Neither the name of Google Inc. nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function($, env) {
	"use strict";

	var enableDebug = false,
		trim =  /^(\s|\u00A0)+|(\s|\u00A0)+$/g,
		JSOL = {},
		originalAttr;
	
	// Use constructor
	function Use(context){
		this.ctx = context;
	}
	
	// jQueryDeclare constructor
	function jQueryDeclare(selector, plugin) {
		var self = this;
		self.constructor = jQueryDeclare;
		if (typeof selector === "string" && typeof plugin === "string") {
			self.use = new Use(self);
			self.pluginSelector = $.trim(selector);
			self.pluginName = $.trim(plugin).replace("$.fn.", "");
			self.attrSelector = self.pluginSelector.replace(/^\[|.+\[/,"").replace("]","");
			return self;
		}
	}
  
	
	jQueryDeclare.prototype = {
		pluginOption: {},
		init: function() {
			var self = this,
				$element = $(self.pluginSelector),
				onReady = function($element) {
					self.element = $element || $(self.pluginSelector);
					if (self.element.length) {
						self.element.each(function(index, el) {
							var thisElement = $(this),
								thisAttrOptions = self.getAttrOptions(thisElement),
								thisPluginOptions = {};
							if(typeof self.before === "function"){
								self.before(thisElement, self);
							}
							thisPluginOptions = $.extend({}, self.pluginOption, thisAttrOptions);
							self.assignPlugin(thisElement, thisPluginOptions);
							if(typeof self.after === "function"){
								self.after(thisElement, self);
							}
						});
					}
				};

			if ($element.length) {
				onReady($element);
			} else {
				$(document).ready(function() {
					onReady();
				});
			}
			return self;
		},
		getAttrOptions: function(element) {
			var self = this,
				attrOptions = element.attr(self.attrSelector),
				ret = {};
			if(attrOptions) {
				ret = evalAttr(attrOptions);
			}
			return ret; 
		},
		assignPlugin: function(element, pluginOptions) {
			var self = this;
			element[self.pluginName](pluginOptions);
		}
	};
	
	Use.prototype = {
		option: function(option) {
			var self = this;
			if ($.isPlainObject(option)) {
				$.extend(self.ctx.pluginOption, option);
			}
			return self.ctx;
		},
		setAttrSelector: function(attrSelector) {
			var self = this;
			if(typeof attrSelector === "string") {
				self.ctx.attrSelector = attrSelector;
			}
			return self.ctx;
		},
		
		before: function(fn) {
			var self = this;
			if(typeof fn === "function") {
				self.ctx.before = fn;
			}
			return self.ctx;
		},
		after: function(fn) {
			var self = this;
			if(typeof fn === "function") {
				self.ctx.after = fn;
			}
			return self.ctx;
		},
		debug: function(isEnable) {
			var self = this;
			enableDebug = (isEnable === false) ? false : true;
			return self.ctx;
		}
	};
	
	/*
	* JSOL [https://github.com/daepark/JSOL]
	*/
	JSOL.parse = function(text) {
		// make sure text is a "string"
		if (typeof text !== "string" || !text) {
			return null;
		}
		// Make sure leading/trailing whitespace is removed
		text = text.replace(trim, "");
		// Make sure the incoming text is actual JSOL (or Javascript Object Literal)
		// Logic borrowed from http://json.org/json2.js
		if ( /^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
			.replace(/'[^'\\\n\r]*'|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
			.replace(/(?:^|:|,)(?:\s*\[)+/g, ":")
			/** everything up to this point is json2.js **/
			/** this is the 5th stage where it accepts unquoted keys **/
			.replace(/\w*\s*\:/g, ":")) ) {
			return (new Function("return " + text))();
		}
		else {
			if (enableDebug) {
				throw("Invalid JSOL: " + text);
			}
		}
	};
	
	// evaluate attr sting options to javascript object
	// @opt example "{sample:'name', sampleBoolean: true}"
	// @return {sample:'name', sampleBoolean: true}
	function evalAttr(opt) {
		var ret = JSOL.parse(opt) || {};
		return ret;
	}
	
	// decorate $.fn.attr
	// $(element).attr() return a JSON object
	originalAttr = $.fn.attr;
	$.fn.attr = function() {
		var obj;
		if(arguments.length === 0) {
			if(this.length === 0) {
				return null;
			}
			obj = {};
			$.each(this[0].attributes, function() {
				if(this.specified) {
					obj[this.name] = this.value;
				}
			});
			return obj;
		}
		return originalAttr.apply(this, arguments);
	};
	
	// extend jQuery
	$.extend({
		evalAttr: function(opt) {
			return evalAttr(opt);
		}
	});
	
	// set $declare to global
	env.$declare = function(selector, plugin) {
		return new jQueryDeclare(selector, plugin);
	};
	
	
})(jQuery, typeof window !== "undefined" ? window : this);