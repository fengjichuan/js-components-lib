var Menu = Class.create();
Menu.prototype = {
	initialize: function() {
		try {
			this.f = typeof getLocation == 'function' ? getLocation().folder : 'main';
		} catch(e) {}
	},
	/*
	 * e: button id or element
	 * a: parentNode (default document.body)
	 * c: data list
	 */
	init: function(e, a, c, classname, dir, positioned, lr) {
		// lr: 菜单是否沿着元素的左下方向出现（默认右下）
		this.positioned = positioned;
		try {
			Event.stopObserving($(e), 'click', this.showMenu.bind(this, e, a, c, classname, true, dir));
			Event.stopObserving(document.body, 'click', this.closeMenu.bindAsEventListener(this));
		} catch(e) {}
		Event.observe($(e), 'click', this.showMenu.bind(this, e, a, c, classname, true, dir));
		Event.observe(document.body, 'click', this.closeMenu.bindAsEventListener(this));
		try {
			if (lr) {
				$(e).setAttribute('left_dir', 'true');
			}
		} catch(e) {}
	},
	initContextMenu: function(e, a, c, classname, dir) {
		try {
			Event.stopObserving($(e), 'contextmenu', this.showMenu.bind(this, e, a, c, classname, false, dir));
			Event.stopObserving(document.body, 'mouseup', this.closeMenu.bindAsEventListener(this));
		} catch(e) {}
		Event.observe($(e), 'contextmenu', this.showMenu.bind(this, e, a, c, classname, false, dir));
		Event.observe(document.body, 'mouseup', this.closeMenu.bindAsEventListener(this));
	},
	getDimensions: function() {
		// var _h = (document.compatMode != 'BackCompat' ? document.documentElement.scrollHeight : document.body.scrollHeight) || 0;
		// var _w = (document.compatMode != 'BackCompat' ? document.documentElement.clientWidth : document.body.clientWidth) || 0;
		var _h = DOM.sohuMailMain.scrollHeight,
		_w = DOM.sohuMailMain.scrollWidth;
		return {width: _w, height: _h};
	},
	getBrowserVersion: function() {
		var userAgent = navigator.userAgent.toLowerCase();
		return (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1]
	},
	isIE6: function() {
		return Prototype.Browser.IE && this.getBrowserVersion() <= 6.0;
	},
	showMenu: function(e, a, c, classname, flag, dir, event) {
		if(c.length == 0) return;
		Event.stop(event);
		var _lr = $(e).left_dir ? $(e).left_dir : $(e).getAttribute('left_dir');
		if (flag) {
			// var _POS = this.positioned ? Position.positionedOffset : Position.cumulativeOffset;
			var _POS = Position.cumulativeOffset;
			this._x = _POS($(e))[0];
			this._y = _POS($(e))[1] + Element.getHeight($(e));
		} else {
			this._x = Event.pointerX(event);
			this._y = Event.pointerY(event);
		}
		if(!this.menuDIV || typeof this.menuDIV != 'object') {
			this.menuDIV = document.createElement('div');
			Element.setStyle(this.menuDIV, {
				position: 'absolute',
				top: '-1000px',
				left: '-1000px',
				zIndex: 999999,
				display: 'none'
			});
			// var ifr = this.isIE6() ? '<iframe style="background:transparent;position:absolute;z-index:9981;top:0px;left:0px;overflow:hidden;border:0px;" frameborder=0 src="javascript:document.open();document.write(\'<html><head></head><body></body></html>\');document.close();"></iframe>' : '';
			this.menuDIV.innerHTML = '<div class="'+ classname +'"></div>';
									// + ifr;
			if(!a || a == null) a = document.body;
			$(a).appendChild(this.menuDIV);
			this.menuCon = this.menuDIV.getElementsByTagName('div')[0];
			try {
				// this.menuIfr = this.menuDIV.getElementsByTagName('iframe')[0];
			} catch(e) {}
		}
		var _j = (typeof c == 'string' || Object.isElement(c));
		if (_j) {
			Element.update(this.menuCon, c);
		} else {
			var _html = [];
			/*
			var _createlist = function(el, arr, index, html, group){
				var style = group ? 'border-bottom: 1px solid #AAAAAA;' : '';
				if (index == 0) html.push('<div style="border:1px solid white;padding:1px;">');
				
				if (el.url && el.url.strip() != '') {
					html.push('<a hidefocus="true" href="' + el.url + '">');
				}
				else {
					html.push('<a hidefocus="true" href="'+ this.f +'" onclick="return false;">');
				}
				html.push(el.text);
				html.push('</a>');
				if (index == (arr.length - 1)) html.push('</div>');
			}.bind(this);
			var _c = [];
			c.each(function(item, index){
				if (item.title) {
					_html.push('<h5>' + item.title + '</h5>');
					item.list.each(function(_item, _index){
						if (index == (c.length - 1)) {
							_createlist(_item, item.list, _index, _html, false);
						}
						else {
							_createlist(_item, item.list, _index, _html, true);
						}
					});
					_c.push(item.list);
				}
				else 
					if (Object.isArray(item)) {
						item.each(function(_item, _index){
							if (index == (c.length - 1)) {
								_createlist(_item, item, _index, _html, false);
							}
							else {
								_createlist(_item, item, _index, _html, true);
							}
						});
					}
					else {
						_createlist(item, c, index, _html, false);
					}
			});
			this.menuCon.innerHTML = _html.join('');
			_c = _c.length == 0 ? c.flatten() : _c.flatten();
			$A(this.menuCon.getElementsByTagName('a')).each(function(item, index){
				if (typeof _c[index].onclick == 'function') {
					item.onclick = function(){
						_c[index].onclick();
						return false;
					};
				} else if(typeof _c[index].onclick == 'string') {
					item.onclick = new Function(_c[index].onclick);
				}
			});
			*/
			_html.push('<div style="border:1px solid white;padding:1px;"><table cellspacing=0 cellpadding=0 style="border:0;"><tbody>');
			c.each(function(item, index) {
				_html.push('<tr><td><div class="normal">'+ item.text +'</div></td></tr>');
			});
			_html.push('</tbody></table></div>');
			this.menuCon.innerHTML = _html.join('');
			$A($(this.menuCon).getElementsByClassName('normal')).each(function(item, index) {
				item.onmouseover = function(event) {
					Element.addClassName(item, 'over');
				};
				item.onmouseout = function(event) {
					Element.removeClassName(item, 'over');
				};
				item.onclick = function(event) {
					c[index].onclick();
				};
			});
		}
		this.menuCon.className = 'menu-box-shadow ' + classname;
		this.menuCon.style.width = '';
		this.menuCon.style.height = '';
		Element.show(this.menuDIV);
		this._w = Element.getWidth(this.menuCon);
		this._h = Element.getHeight(this.menuCon);
		var min_w = Element.getWidth($(e));
		var min_h = Element.getHeight($(e));
		var tb_el = this.menuCon.getElementsByTagName('table')[0];
		if(this._w < min_w) {
			Element.setStyle(this.menuCon, {width: min_w + 'px'});
			this._w = min_w;
			tb_el.style.width = this._w - 4 + 'px';
		}
		
		var dw = this.getDimensions().width;
		var dh = this.getDimensions().height;
		var mb = (this.getDimensions().height / 2);
		// var ifrh = this._h;
		if(this._h > mb && !_j) {
			this._w += 20;
			Element.setStyle(this.menuCon, {width: this._w + 'px', height: mb + 'px', overflowX: 'hidden', overflowY: 'auto'});
			this._h = mb;
		}
		if((this._x + this._w) >= dw) {
			var _left = flag ? this._x + min_w - this._w : this._x - this._w;
		} else {
			if (_lr) {
				var _left = this._x - this._w + min_w;
			} else {
				var _left = this._x;
			}
		}
		if((this._y + this._h) >= dh && !dir) {
			var _top = flag ? this._y - min_h - this._h : this._y - this._h;
		} else {
			var _top = this._y;
		}
		// var _left = this._x;
		// var _top = this._y;
		Element.setStyle(this.menuDIV, {left: _left + 'px', top: _top + 'px'});
		// if(this.menuIfr) Element.setStyle(this.menuIfr, {width: this._w + 'px', height: this._h + 'px'});
		return false;
	},
	closeMenu: function() {
		try {
			Element.hide(this.menuDIV);
			this.menuCon.style.width = '';
			try {
				$A(this.menuCon.getElementsByTagName('*')).each(function(item) {
					item.onmouseover = item.onmouseout = item.onclick = null;
				});
			} catch(e) {}
		} catch(e) {}
	}
};
var menu = new Menu();
