var AddressFilter = Class.create();
AddressFilter.prototype = {
	initialize: function(e, a, c) {
		this.inputElement = e;
		this.sparentNode = a;
		this.contactLists = c;
		this.___flag = 0;
		this.entryEndBreak = false;
		this.searchModule = false;
		$(e).setAttribute('autocomplete', 'off');
		var self = this;
		$(e).onfocus = function() {
			src_focus_id = this.id ? this.id : this.getAttribute('id');
			try {
				self.contactLists = reAutoLists();
			} catch(e) {}
		};
		try {
			Event.stopObserving($(e), 'keyup', this.kefunc.bindAsEventListener(this));
			Event.stopObserving(document.body, 'click', this.closeFilter.bindAsEventListener(this));
		} catch(e) {}
		Event.observe($(e), 'keyup', this.kefunc.bindAsEventListener(this));
		Event.observe(document.body, 'click', this.closeFilter.bindAsEventListener(this));
	},
	init: function() {
	},
	clear: function() {
		try {
			$(this.inputElement).removeAttribute('autocomplete');
		} catch(e) {}
		if(this.kefunc) Event.stopObserving($(this.inputElement), 'keyup', this.kefunc.bindAsEventListener(this));
		if(this.closeFilter) Event.stopObserving(document.body, 'click', this.closeFilter.bindAsEventListener(this));
	},
	kefunc: function(event) {
		event = event || window.event;
		if(event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 13) return;
		this.start(this.inputElement, this.sparentNode, this.contactLists);
		Event.stop(event);
	},
	// e: 需要关联的Node
	// a: 隶属于parentNode
	// c: contactLists
	start: function(e, a, c) {
		this._currentObject = null;
		if (!this.filterDIV || typeof this.filterDIV != 'object') {
			this.filterDIV = document.createElement('div');
			// var _pos = Position.cumulativeOffset($(e));
			var _pos = Position.positionedOffset($(e));
			with (this.filterDIV.style) {
				position = "absolute";
				top = _pos[1] + Element.getHeight($(e)) + "px";
				left = _pos[0] + "px";
				zIndex = "1000001";
			};
			this.filterDIV.innerHTML = '<table collspace=0 collpadding=0 class="menu-box-shadow at-cplt"></table>'
									  +'<iframe style="background:transparent;position:absolute;z-index:9991;top:0px;left:0px;overflow:hidden;border:0px;" src="javascript:document.open();document.write(\'<html><head></head><body></body></html>\');document.close();"></iframe>';
			$(a).appendChild(this.filterDIV);
			this.filterTable = this.filterDIV.getElementsByTagName('table')[0];
			this.filterIfr = this.filterDIV.getElementsByTagName('iframe')[0];
		}
		// 相匹配的用户邮箱地址
		var _c = [];
		var _v = $(e).value.toLowerCase().strip();
		if($(e).value.include(',') || $(e).value.include(';')) {
			_v = _v.replace(/\;/ig, ',');
			var __v = _v.split(',');
			if(__v.length > 1) _v = __v[__v.length-1].strip();
		}
		if(typeof(c) == "object" && c.length > 0) {
			var __tmp = [];
			for(var i=0,l=c.length;i<l;i++) {
				if(_v.blank()) break;
				if(typeof c[i] != 'object') {
					if(!c[i].blank() && c[i].toLowerCase().startsWith(_v)) {
						_c.push('<tr><td class="cur-pt"><b>'+ c[i].substring(0, _v.length) +'</b>'+ c[i].substring(_v.length) +'</td></tr>');
					}
					continue;
				}
				if(__tmp.indexOf(c[i].email) < 0) {
					__tmp.push(c[i].email);
				} else {
					continue;
				}
				if(c[i].nickname && c[i].nickname.toLowerCase().startsWith(_v)) {
					_c.push('<tr><td class="cur-pt"><b>\"'+ c[i].nickname.substring(0, _v.length) +'</b>'+ c[i].nickname.substring(_v.length) +'\"&lt;'+ c[i].email +'&gt;</td></tr>');
				} else if(c[i].email && c[i].email.toLowerCase().startsWith(_v)) {
					_c.push('<tr><td class="cur-pt">\"'+ c[i].nickname +'\"&lt;<b>'+ c[i].email.substring(0, _v.length) +'</b>'+ c[i].email.substring(_v.length) +'&gt;</td></tr>');
				} else if(c[i].pinyin && c[i].pinyin != '') {
					var _py = c[i].pinyin.split(' ');
					if(_py.length > 0) {
						for(var _i=0;_i<_py.length;_i++) {
							if(_py[_i].toLowerCase().startsWith(_v)) {
								_c.push('<tr><td class="cur-pt">\"'+ c[i].nickname +'\"&lt;'+ c[i].email +'&gt;</td></tr>');
								break;
							}
						}
					} else {
						if(c[i].pinyin.toLowerCase().startsWith(_v)) {
							_c.push('<tr><td class="cur-pt">\"'+ c[i].nickname +'\"&lt;'+ c[i].email +'&gt;</td></tr>');
						}
					}
				}
			}
		}
		if (_c.length == 0) {
			Element.hide(this.filterDIV);
			return;
		}
		var _table = '<tbody>'
					+ _c.join('')
					+'</tbody>';
		Element.update(this.filterTable, _table);
		this.dataList = $A(this.filterTable.getElementsByTagName('td'));
		this.dlen = this.dataList.length;
		Element.show(this.filterDIV);
		var _w = Element.getWidth(this.filterTable);
		var _h = Element.getHeight(this.filterTable);
		Element.setStyle(this.filterIfr, {width: _w + 'px', height: _h + 'px'});
		this.dataList.each(function(item, index) {
			item.onclick = function(event) {
				this.clkfunc(event);
			}.bindAsEventListener(this);
			item.onmouseover = function(event) {
				this._over(item);
			}.bindAsEventListener(this);
			item.setAttribute('index', index);
			/*
			item.onmouseout = function(event) {
				this._out(item);
			}.bindAsEventListener(this);
			*/
		}.bind(this));
		this._currentObject = this.dataList[0];
		try {
			Event.stopObserving($(this.inputElement), 'keydown', this.kdfunc);
		} catch(e) {}
		this.keyObserve(this.filterTable);
	},
	// 注册document.body对象的click事件的回调函数
	dclk: function() {
	},
	closeFilter: function() {
		if(this.filterDIV) Element.hide(this.filterDIV);
	},
	_flag: false,
	_over: function(el) {
		el = $(el);
		if(this._focus_el) {
			this._focus_el.removeClassName('item-over');
		}
		this._focus_el = el;
		this.__index = el.getAttribute('index');
		el.addClassName('item-over');
		this._currentObject = el;
	},
	// 注册document.body对象keydown事件的回调函数
	kdfunc: function(event) {
	},
	// 注册document.body对象的click事件的回调函数（for select contact）
	clkfunc: function(event) {
	},
	keyObserve: function(tb) {
		this._listlength = this.dataList.length;
		this._over(this._currentObject);
		var self = this;
		this.clkfunc = function(event) {
			try {
				var _v = $(this.inputElement).value;
				_v = _v.replace(/\;/ig, ',');
				_v = _v.split(',');
				_v.pop();
				var _comma = this.searchModule ? '' : ',';
				_v = _v.length > 0 ? _v.join(',') + _comma : '';
				var _c = this._currentObject.innerHTML;
				_c = _c.stripTags();
				_c = _c.unescapeHTML();
				if (_v.include(_c)) {
					$(this.inputElement).value = _v.replace(/\/n/ig, '');
				} else {
					var __v = _v + _c;
					__v = __v.strip().endsWith(',') ? __v : __v + _comma;
					$(this.inputElement).value = __v.replace(/\/n/ig, '');
				}
				writemail.addressbook_use_list = 1;
				var self = this;
				setTimeout(function(){
					$(self.inputElement).focus();
				}, 1);
			} catch(e) {}
		}.bind(this);
		this.kdfunc = function(event) {
			event = event || window.event;
			switch(event.keyCode) {
				case 40:
					/*
					if (Object.isElement(this._currentObject) && this._currentObject.nextSibling) {
						this._currentObject = this._currentObject.nextSibling;
					} else {
						this._currentObject = this._currentObject.parentNode.firstChild;
					}
					*/
					this.__index = parseInt(this.__index);
					this._currentObject = this.dataList[(this.__index+1)%this.dlen];
					if(this._currentObject && Object.isElement(this._currentObject))
						this._over(this._currentObject);
					// this.___flag = 1;
					writemail.addressbook_use_list = 1;
					break;
				case 38:
					/*
					if (Object.isElement(this._currentObject) && this._currentObject.previousSibling) {
						this._currentObject = this._currentObject.previousSibling;
					} else {
						this._currentObject = this._currentObject.parentNode.lastChild;
					}
					*/
					this.__index = parseInt(this.__index);
					this._currentObject = this.dataList[((this.__index-1)+this.dlen)%this.dlen];
					if(this._currentObject && Object.isElement(this._currentObject))
						this._over(this._currentObject);
					// this.___flag = 1;
					writemail.addressbook_use_list = 1;
					break;
				case 13:
					$(this.inputElement).blur();
					this.clkfunc(event);
					this.closeFilter();
					// this.___flag = 1;
					writemail.addressbook_use_list = 1;
					break;
				/*
				case 9:
					$(this.inputElement).blur();
					this.clkfunc(event);
					this.closeFilter();
					break;
				*/
				default:
					break;
			};
		}.bind(this);
		Event.observe($(this.inputElement), 'keydown', this.kdfunc);
	}, 
	// 自动匹配菜单是否被使用过
	isActive: function() {
		try {
			return this.___flag ? this.___flag : 0;
		} catch(e) {
			return 0;
		}
	},
	destroy: function() {
		try {
			this.clear();
		} catch(e) { }
		try {
			if(this.filterDIV) {
				var _event = ['onclick', 'onkeydown', 'onkeyup', 'onkeypress', 'onmouseover', 'onmouseout'];
				$A(this.filterDIV.getElementsByTagName('*')).each(function(item) {
					_event.each(function(_item) {
						if(item[_item]) item[_item] = null;
					});
				});
				Element.remove(this.filterDIV);
				this.filterDIV = null;
			}
		} catch(e) {}
	}
};