/*
//	jQuery viewPointPubSub viewpoint
//	adamchow2326@yahoo.com.au
//	
//	bind element to detect if it is in viewpoint when on DOM ready, window scroll and window resize.
//	The plugin will trigger a each supplied callback when element is:
//		'inView', 'offView', 'offTop', 'offRight', 'offBottom' or 'offLeft'
*/

(function ($, document, window) {
	"use strict";
    var viewpoint,
		pluginName = "viewpoint",
		verion = "1.0.0",
		defaultOptions = {
			scrollElement: window,
			eventCheckViewPoint: "checkViewPoint",
			eventNamespace: ".viewpoint",
			inView: null,
			offView: null,
			offTop: null,
			offRight: null,
			offBottom: null,
			offLeft: null,
			topOffset: 0, // threshold for detection 
			rightOffset: 0,
			bottomOffset: 0,
			leftOffset: 0,
			delay: 50
		},
		Viewpoint = function (element, pluginSelector, opt) {
			// check if opt define any function
			if (element && $.isPlainObject(opt)) {
				if ($.isFunction(opt.inView) || 
					$.isFunction(opt.offView) || 
					$.isFunction(opt.offTop) || 
					$.isFunction(opt.offRight) || 
					$.isFunction(opt.offBottom) ||
					$.isFunction(opt.offLeft)) {
					this.pluginSelector = pluginSelector;
					this.options = $.extend(defaultOptions, opt);
				} else {
					return;
				}
				return this.init(element);
			}
		};
    
    Viewpoint.prototype = {
		sWindow: null,
		isCalled: "",
		currentState: {},
        init: function (element) {
			var self = this;
			self.sWindow = $(self.options.scrollElement);	
			// check if window or detect scroll element exits and is scrollable
			if (self.sWindow.length) {
				self.element = element;
				self.$element = $(element);
				self.setupEvents();
			}
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
				if (self.isInViewPoint()) {
					if (self.options.inView && self.isCalled !== "inView") {
						self.options.inView(eData);
						self.isCalled = "inView";
					}
				} else {
					if (self.options.offView) {
						if (self.isCalled !== "offView"){
							self.options.offView(eData);
							self.isCalled = "offView";
						}
					}
					if (self.options.offTop) {
						if (self.isCalled !== "offTop"){
							self.options.offTop(eData);
							self.isCalled = "offTop";
						}
					}
					if (self.options.offRight) {
						if (self.isCalled !== "offRight"){
							self.options.offRight(eData);
							self.isCalled = "offRight";
						}
					}
					if (self.options.offBottom) {
						if (self.isCalled !== "offBottom"){
							self.options.offBottom(eData);
							self.isCalled = "offBottom";
						}
					}
					if (self.options.offLeft) {
						if (self.isCalled !== "offLeft"){
							self.options.offLeft(eData);
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
				triggerCheckViewpoint(event);
			});
			
			// bind window scroll event and trigger "sWindowscroll" event
			self.sWindow.on(("scroll" + self.options.eventNamespace), function(event){
				clearTimeout(debounceScrollTimer);
				debounceScrollTimer = setTimeout(function(event) {
					triggerCheckViewpoint(event);
				}, self.options.delay);
			});
			
			// update sWindow size variable on window resize
			self.sWindow.on(("resize" + self.options.eventNamespace), function(event){
				clearTimeout(debounceScrollTimer);
				debounceResizeTimer = setTimeout(function(event) {
					triggerCheckViewpoint(event);
				}, self.options.delay);
			});
			return this;
		},	
		updateCurrentState: function() {
			var self = this;
			self.currentState.winWidth = self.sWindow.width();
			self.currentState.winHeight = self.sWindow.height();
			self.currentState.winScrollTop = self.sWindow.scrollTop();
			self.currentState.winScrollLeft = self.sWindow.scrollLeft();
			self.currentState.elementWidth = self.$element.width();
			self.currentState.elementHeight = self.$element.height();
			self.currentState.elementOffsetTop = self.$element.offset().top;
			self.currentState.elementOffsetLeft = self.$element.offset().left;
			self.currentState.foldWidth = self.currentState.winWidth + self.currentState.winScrollLeft;
			self.currentState.foldHeight = self.currentState.winHeight + self.currentState.winScrollTop;
		},		
		isInViewPoint: function() {
			var self = this;
			self.currentState.isoffTop = self.checkTop();
			self.currentState.isOffRight = self.checkRight();
			self.currentState.isOffBottom = self.checkBottom();
			self.currentState.isOffLeft = self.checkLeft();
			self.currentState.isInViewPoint = (!self.currentState.isoffTop && !self.currentState.isOffRight && !self.currentState.isOffBottom && !self.currentState.isOffLeft);
			return self.currentState.isInViewPoint;
		},
		checkTop: function() {
			var self = this;		
			return self.currentState.winScrollTop >= ((self.currentState.elementOffsetTop + self.currentState.elementHeight) - self.options.topOffset);
		},
		checkRight: function() { 
			var self = this;	
			return self.currentState.foldWidth <= (self.currentState.elementOffsetLeft - self.options.rightOffset);
		},
		checkBottom: function() {
			var self = this;
			return self.currentState.foldHeight <= (self.currentState.elementOffsetTop - self.options.bottomOffset);
		},
		checkLeft: function() {
			var self = this;
			return self.currentState.winScrollLeft >= ((self.currentState.elementOffsetLeft + self.currentState.elementWidth) - self.options.leftOffset);
		}
    };
 
	// jQuery bridge 
    $.fn.viewpoint = function (options) {
		var currentPlugin, methodName, pluginInstance, 
			pluginSelector = this.selector,
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
			if ($.data(this[0], pluginName)) {
				methodName = arguments[0];
				currentPlugin = $.data(this[0], pluginName);
				if (currentPlugin[methodName]) {
				  return (currentPlugin[methodName].apply(pluginInstance, Array.prototype.slice.call(arguments, 1)));
				}
			}
		}
    };
	$.fn.viewpoint.version = verion;

}(jQuery, document, window));
