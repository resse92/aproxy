var $ = require('jquery');
var util = require('./util');

function ListModal(list, data) {
	var self = this;
	self.list = Array.isArray(list) ? list : [];
	data = data || {};
	self.data = {};
	self.list.forEach(function(name) {
		var item = self.data[name] = data[name] || {};
		item.key = item.key || util.getKey();
		item.name = name;
	});
}

var proto = ListModal.prototype;

proto._getList = function(prop) {
	var list = [];
	var data = this.data;
	Object.keys(data)
			.forEach(function(name) {
				var item = data[name];
				if (item && item[prop]) {
					list.push(item);
				}
			});
	return list;
};

proto._setBoolProp = function(name, prop, bool) {
	var item = this.get(name);
	if (item) {
		item[prop] = bool !== false;
	}
	this.filter();
	return item;
};

proto.exists = function(name) {
	return this.list.indexOf(name) != -1;
};

proto.add = function(name, value) {
	if (!name || this.get(name)) {
		return false;
	}
	this.list.push(name);
	var item = this.data[name] = {
		key: util.getKey(),
		name: name,
		value: value || ''
	};
	this.filter();
	return item;
};

proto.set = function(name, value) {
	var item = this.get(name);
	if (item) {
		if (typeof value == 'string') {
			item.value = value;
		} else {
			$.extend(item, value);
		}
	}
};

proto.get = function(name) {
	
	return this.data[name];
};

proto.getByKey = function(key) {
	for (var i in this.data) {
		var item = this.data[i];
		if (item.key == key) {
			return item;
		}
	}
};

proto.setSelected = function(name, selected) {
	
	return this._setBoolProp(name, 'selected', selected);
};

proto.getSelectedList = function() {
	
	return this._getList('selected');
};

proto.setChanged = function(name, changed) {

	return this._setBoolProp(name, 'changed', changed);
};

proto.getChangedList = function() {
	
	return this._getList('changed');
};

proto.clearAllActive = function() {
	var data = this.data;
	Object.keys(data).forEach(function(name) {
		data[name].active = false;
	});
};

proto.clearAllSelected = function() {
	var data = this.data;
	Object.keys(data).forEach(function(name) {
		data[name].selected = false;
	});
};

proto.setActive = function(name, active) {
	var item = this.get(name);
	if (item) {
		active = active !== false;
		active && this.clearAllActive();
		item.active = active;
	}
	return item;
};

proto.getActive = function() {
	for (var i in this.data) {
		var item = this.data[i];
		if (item.active) {
			return item;
		}
	}
};

proto.remove = function(name) {
	var index = this.getIndex(name);
	if (index != -1) {
		this.list.splice(index, 1);
		delete this.data[name];
		return true;
	}
};

proto.rename = function(name, newName) {
	if (!name || !newName || name == newName) {
		return;
	}
	
	var index = this.getIndex(name);
	if (index != -1) {
		this.list[index] = newName;
		var item = this.data[name];
		delete this.data[name];
		this.data[newName] = item;
		item.name = newName;
		this.filter();
		return true;
	}
};

proto.getIndex = function(name) {
	return this.list.indexOf(name);
};

proto.getSibling = function(name) {
	var index = this.getIndex(name);
	name = this.list[index + 1] || this.list[index - 1];
	return name && this.data[name];
};

/**
 * 默认根据name过滤
 * selected[s, active, a]: 根据激活的过滤
 */
proto.search = function(keyword, disabledType) {
	this._type = '';
	this._keyword = typeof keyword != 'string' ? '' : keyword.trim();
	if (!disabledType && this._keyword && /^(selected|s|active|a):(.*)$/.test(keyword)) {
		this._type = RegExp.$1;
		this._keyword = RegExp.$2.trim();
	}
	this.filter();
	return !this._keyword;
};

proto.filter = function() {
	var keyword = this._keyword;
	var list = this.list;
	var hasFilterType = !!this._type;
	var data = this.data;
	
	if (!keyword) {
		list.forEach(function(name) {
			var item = data[name];
			item.hide = hasFilterType && !item.selected;
		});
		return;
	}
	
	list.forEach(function(name) {
		var item = data[name];
		item.hide = hasFilterType && !item.selected || (name || '').indexOf(keyword) == -1;
	});
	return list;
}

proto.prev = function() {
	var list = this.list;
	var len = list.length;
	if (!len) {
		return;
	}
	var activeItem = this.getActive();
	var index = activeItem ? list.indexOf(activeItem.name) : len - 1;
	var data = this.data;
	for (var i = index - 1; i >= 0; i--) {
		var item = data[list[i]];
		if (!item.hide) {
			return item;
		}
	}
	
	for (var i = len - 1; i > index; i--) {
		var item = data[list[i]];
		if (!item.hide) {
			return item;
		}
	}
};

proto.next = function() {
	var list = this.list;
	var len = list.length;
	if (!len) {
		return;
	}
	var activeItem = this.getActive();
	var index = activeItem ? list.indexOf(activeItem.name) : 0;
	var data = this.data;
	for (var i = index + 1; i < len; i++) {
		var item = data[list[i]];
		if (!item.hide) {
			return item;
		}
	}
	
	for (var i = 0; i < index; i++) {
		var item = data[list[i]];
		if (!item.hide) {
			return item;
		}
	}
};

module.exports = ListModal;