var $ = require('jquery');

function createCgi(url, settings) {
	var self = this;
	if (typeof url == 'string') {
		url = {url: url};
	}
	settings = $.extend({dataType: 'json'}, settings, url);
	url = url.url;
	var queue = [];
	var jqXhr;
	
	function cgiFn(data, callback, options) {
		var opts = {url: typeof url == 'function' ? url() : url};
		if (typeof data == 'function') {
			options = callback;
			callback = data;
			data = null;
		} else {
			opts.data = data;
		}
		
		options = $.extend({}, settings, options, opts);
		if (jqXhr) {
			var mode = options.mode;
			if (mode == 'ignore') {
				return;
			}
			if (mode == 'cancel') {
				jqXhr.abort();
			} else if (mode == 'chain') {
				queue.push([data, callback, options]);
			}
		}
		
		var execCallback = function(data, xhr) {
			jqXhr = null;
			callback && callback.call(this, data, xhr);
			var args = queue.shift();
			args && cgiFn.apply(self, args);
		};
		options.success = function(data, statusText, xhr) {
			execCallback.call(this, data, xhr);
		};
		options.error = function(xhr) {
			execCallback.call(this, false, xhr)
		};
		
		return (jqXhr = $.ajax(options));
	}
	
	return cgiFn;
}

function create(obj, settings) {
	var cgi = {};
	Object.keys(obj).forEach(function(name) {
		cgi[name] = createCgi(obj[name], settings);
	});
	return cgi;
}

module.exports = create;