/*
//	jQuery viewPointPubSub viewpoint
//	adamchow2326@yahoo.com.au
//	
//	bind element to detect if it is in viewpoint when on DOM ready, window scroll and window resize.
//	The plugin will trigger a each supplied callback when element is:
//	'inView', 'offView', 'offTop', 'offRight', 'offBottom', 'offLeft', 'affixTop', 'offAffixTop'
*/

(function(document, window, factory) {
	"use strict";
	if (typeof jQuery === "undefined" && NIMBUS_READY) {
		NIMBUS_READY.callbacks.push(factory);
	} else {
		factory();
	}
}(document, window, function(){
	"use strict";
	
	var viewpoint,
	pluginName = "viewpoint",
	verion = "1.0.0",
	defaultOptions = {
		scrollElement: window,
		contentPane: null,
		eventCheckViewPoint: "checkViewPoint",
		eventNamespace: ".viewpoint",
		inView: undefined,
		offView: undefined,
		offTop: undefined,
		offRight: undefined,
		offBottom: undefined,
		offLeft: undefined,
		topOffset: undefined, // threshold for detection 
		rightOffset: undefined,
		bottomOffset: undefined,
		leftOffset: undefined,
		delay: 70
	};
	
	function Viewpoint(element, pluginSelector, opt) {
		// check if opt define any function
		this.constructor = Viewpoint;
		if (element && $.isPlainObject(opt)) {
			if ($.isFunction(opt.inView) || 
			$.isFunction(opt.offView) || 
			$.isFunction(opt.offTop) || 
			$.isFunction(opt.offRight) || 
			$.isFunction(opt.offBottom) ||
			$.isFunction(opt.offLeft) ||
			$.isFunction(opt.affixTop) ||
			$.isFunction(opt.offAffixTop)) {
				this.pluginSelector = pluginSelector;
				this.options = $.extend({}, defaultOptions, opt);
			} else {
				return;
			}
			return this.init(element);
		}
	}
    
    Viewpoint.prototype = {
		sWindow: null,
		isCalled: "",
		isAffixTopCalled: "",
		isDisable: false,
		currentState: {},
        init: function (element) {
			var self = this;
			self.sWindow = $(self.options.scrollElement);	
			// check if window or detect scroll element exits and is scrollable
			if (!self.sWindow.length) {
				throw "scrollElement not found";
			}
			if (typeof self.options.contentPane === "string") {
				self.$contentPane = $(self.options.contentPane);
				if (!self.$contentPane.length) {
					throw "contentPane not found";
				}
			}
			self.element = element;
			self.$element = $(element);
			self.setupEvents();
        },
		setupEvents: function() {
			var self = this,
			triggerCheckViewpoint,
			debounceScrollTimer = null,
			debounceResizeTimer = null;
			
			// bind "checkViewPoint" event and check if element in viewpoint
			// flag isCalled to called relevant callbacks
			self.$element.on(self.options.eventCheckViewPoint, function(eData){
				// update current state
				self.updateCurrentState();
					
				if (self.options.affixTop && self.currentState.isAffixTop) { 
					if(self.isAffixTopCalled !== "affixTop") {
						self.options.affixTop(self.$element, self.currentState);
						self.isAffixTopCalled = "affixTop";
					}
				} else if (self.options.offAffixTop) {
					if (self.isAffixTopCalled !== "offAffixTop") {
						self.options.offAffixTop(self.$element, self.currentState);
						self.isAffixTopCalled = "offAffixTop";
					}
				}		
				
				if (self.isInViewPoint()) {
					if (self.options.inView && self.isCalled !== "inView") {
						self.options.inView(self.$element, self.currentState);
						self.isCalled = "inView";
					}
				} else {
					if (self.options.offView) {
						if (self.isCalled !== "offView"){
							self.options.offView(self.$element, self.currentState);
							self.isCalled = "offView";
						}
					}
					if (self.options.offTop && self.currentState.isOffTop) {
						if (self.isCalled !== "offTop"){
							self.options.offTop(self.$element, self.currentState);
							self.isCalled = "offTop";
						}
					}
					if (self.options.offRight && self.currentState.isOffRight) {
						if (self.isCalled !== "offRight"){
							self.options.offRight(self.$element, self.currentState);
							self.isCalled = "offRight";
						}
					}
					if (self.options.offBottom && self.currentState.isOffBottom) {
						if (self.isCalled !== "offBottom"){
							self.options.offBottom(self.$element, self.currentState);
							self.isCalled = "offBottom";
						}
					}
					if (self.options.offLeft && self.currentState.isOffLeft) {
						if (self.isCalled !== "offLeft"){
							self.options.offLeft(self.$element, self.currentState);
							self.isCalled = "offLeft";
						}
					}
				}
			});
			
			triggerCheckViewpoint = function(event) {
				self.$element.trigger({
					type: self.options.eventCheckViewPoint,
					eData: event
				});
			};
			
			// bind document ready to check on first load
			$(document).ready(function(event){
				if (self.isDisable) {
					return;
				}
				triggerCheckViewpoint(event);
			});
			
			// bind window scroll event and trigger "sWindowscroll" event
			self.sWindow.on(("scroll" + self.options.eventNamespace), function(event){
				if (self.isDisable) {
					return;
				}
				clearTimeout(debounceScrollTimer);
				debounceScrollTimer = setTimeout(function(event) {
					triggerCheckViewpoint(event);
				}, self.options.delay);
			});
			
			// update sWindow size variable on window resize
			self.sWindow.on(("resize" + self.options.eventNamespace), function(event){
				if (self.isDisable) {
					return;
				}
				clearTimeout(debounceScrollTimer);
				debounceResizeTimer = setTimeout(function(event) {
					triggerCheckViewpoint(event);
				}, self.options.delay);
			});
			return this;
		},	
		updateCurrentState: function() {
			var self = this,
			$elementPos = (self.$contentPane) ? self.$element.position() : self.$element.offset();
			
			self.currentState.winWidth = self.sWindow.width();
			self.currentState.winHeight = self.sWindow.height();
			self.currentState.winScrollTop = self.sWindow.scrollTop();
			self.currentState.winScrollLeft = self.sWindow.scrollLeft();
			self.currentState.elementWidth = self.$element.width();
			self.currentState.elementHeight = self.$element.height();
			self.currentState.elementOffsetTop = $elementPos.top;
			self.currentState.elementOffsetLeft = $elementPos.left;
			self.currentState.foldWidth = self.currentState.winWidth + self.currentState.winScrollLeft;
			self.currentState.foldHeight = self.currentState.winHeight + self.currentState.winScrollTop;
			self.currentState.isAffixTop = self.affixTop();
		},		
		isInViewPoint: function() {
			var self = this;
			self.currentState.isOffTop = self.checkOffTop();
			self.currentState.isOffRight = self.checkOffRight();
			self.currentState.isOffBottom = self.checkOffBottom();
			self.currentState.isOffLeft = self.checkOffLeft();
			self.currentState.isInViewPoint = (!self.currentState.isOffTop && !self.currentState.isOffRight && !self.currentState.isOffBottom && !self.currentState.isOffLeft);
			return self.currentState.isInViewPoint;
		},
		checkOffTop: function() {
			var self = this,
			offset = (typeof self.options.topOffset === "number" ) ? self.options.topOffset : self.currentState.elementHeight;
			return self.currentState.winScrollTop >= ((self.currentState.elementOffsetTop + self.currentState.elementHeight) - offset);
		},
		checkOffRight: function() { 
			var self = this,
			offset = (typeof self.options.rightOffset === "number" ) ? self.options.rightOffset : 0 - self.currentState.elementWidth;
			return self.currentState.foldWidth <= (self.currentState.elementOffsetLeft - offset);
		},
		checkOffBottom: function() {
			var self = this,
			offset = (typeof self.options.bottomOffset === "number" ) ? self.options.bottomOffset : 0 - self.currentState.elementHeight;
			return self.currentState.foldHeight <= (self.currentState.elementOffsetTop - offset);
		},
		checkOffLeft: function() {
			var self = this,
			offset = (typeof self.options.leftOffset === "number" ) ? self.options.leftOffset : self.currentState.elementWidth;
			return self.currentState.winScrollLeft >= ((self.currentState.elementOffsetLeft + self.currentState.elementWidth) - offset);
		},
		affixTop: function() {
			var self = this,
			offset = (typeof self.options.topOffset === "number" ) ? self.options.topOffset : 0;
			return self.currentState.winScrollTop >= (self.currentState.elementOffsetTop - offset);
		},
		disable: function() {
			var self = this;
			self.isDisable = true;
		},
		enable: function() {
			var self = this;
			self.isDisable = false;
		}
    };
	
	// jQuery bridge 
    $.fn.viewpoint = function (options) {
		var pluginSelector = this.selector,
		methodName, 
		pluginInstance, 
		obj = {};
		// if options is a config object, return new instance of the plugin
		if ($.isPlainObject(options) || !options) {
			return this.each(function() {
				if (!$.data(this, pluginName)) { // prevent multiple instancate plugin
					pluginInstance = new Viewpoint(this, pluginSelector, options);
					$.data(this, pluginName, pluginInstance); // store reference of plugin name
					
					obj[pluginName] = function(elem) { 
						return $(elem).data(pluginName) !== undefined;
					};
					$.extend($.expr[":"], obj); //Adds custom jQuery pseudo selectors
					
					return pluginInstance; // use multiple instance
				}
			});
		}
		// if call method after plugin init. return methid call
		else if (typeof arguments[0] === "string") {
			pluginInstance = $.data(this[0], pluginName);
			if (pluginInstance) {
				methodName = arguments[0];
				if (pluginInstance[methodName]) {
					return pluginInstance[methodName].apply(pluginInstance, Array.prototype.slice.call(arguments, 1));
				}
			}
		}
    };
	
	$.fn.viewpoint.version = verion;	
	
}));
