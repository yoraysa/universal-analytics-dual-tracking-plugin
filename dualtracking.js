	/**
	 *  Universal Analytics Dual Tracking Plugin
	 */
(function(){
	function providePlugin(pluginName, pluginConstructor) {
		var ga = window[window['GoogleAnalyticsObject'] || 'ga'];
		if (typeof ga == 'function') {
		ga('provide', pluginName, pluginConstructor);
	  }
	}

	var DualTracking = function(tracker, config) {
		this.tracker = tracker;
		this.property = config.property, 
		this.isDebug = config.debug;
		this.transport = config.transport || 'beacon';
	};
	
	/**
	 * 
	 */
	DualTracking.prototype.doDualTracking = function() {
		this.debug('DualTracking: Init');
		if(!this.property || !this.property.match(/^UA-([0-9]*)-([0-9]{1,2}$)/)){
			this.debug('DualTracking: Error. Bad Property ID Format (UA-XXXXXX-YY)');
			return 0;		
		}else{
			window.__gaDualTracking = {};
			window.__gaDualTracking.property = this.property;
			window.__gaDualTracking.transport = this.transport;
		}
		
		var originalSendHitTask = this.tracker.get('sendHitTask');
		this.tracker.set('sendHitTask', function(model) {
			this.debug('DualTracking: Init');
			var payLoad = model.get('hitPayload');
			var data = (payLoad).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
			data.tid = window.__gaDualTracking.property;
			
			originalSendHitTask(model);
			this.debug('DualTracking: Prepare Hit');
			var newPayload = Object.keys(data).map(function(key) { return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]); }).join('&');
			if(__gaDualTracking.transport=="image"){
				this.debug('DualTracking: Send Image Hit');
				var i=new Image(1,1);
				i.src="https://www.google-analytics.com/collect"+"?"+newPayload;i.onload=function(){return;}				
			}else if(__gaDualTracking.transport=="beacon"){
				this.debug('DualTracking: Send Beacon Hit');
				navigator.sendBeacon("https://www.google-analytics.com/collect", newPayload);
			}			
		});
	}

	/**
	 * Displays a debug message in the console, if debugging is enabled.
	 */
	DualTracking.prototype.debug = function(message) {
		if (this.isDebug && typeof console != 'undefined')
			console.debug(message);
	};

	providePlugin('dualtracking', DualTracking);  	
})();
