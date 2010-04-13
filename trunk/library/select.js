var Select = Class.create();
Select.prototype = {
	initialize: function() {
		Event.observe(document.body, 'click', function(event) {
			try {
				if(this.sellist) {
					this.clearSelectList(this.sellist);
				}
			} catch(e) {}
		}.bind(this));
	},
	init: function(el, options, cname) {
		this.sel = null;
		this.sellist = null;
		
		this.el = el = $(el);
		this.options = options;
		this.cname = cname ? cname : '';
		var _d = document.createElement('div');
		this.sel = _d;
		var _csel = '<table cellspacing=0 cellpadding=0 class="custom-select"><tbody><tr><td class="sel-td"><div class="sel-text">'+ options[0].text +'</div></td><td><div class="am sel-arrow"></div></td></tr></tbody></table>';
		_d.innerHTML = _csel;
		el.appendChild(_d);
		var _bt = _d.getElementsByTagName('div')[1];
		Event.observe(_bt, 'click', function(event) {
			Event.stop(event);
			try {
				this.createSelectList();
			} catch(e) {}
		}.bind(this));
		Event.observe(_bt, 'mouseover', function(event) {
			try {
				Element.addClassName(this, 'sel-arrow-over');
			} catch(e) {}
		});
		Event.observe(_bt, 'mouseout', function(event) {
			try {
				Element.removeClassName(this, 'sel-arrow-over');
			} catch(e) {}
		});
		Event.observe(_bt, 'mousedown', function(event) {
			try {
				Element.addClassName(this, 'sel-arrow-down');
			} catch(e) {}
		});
		Event.observe(_bt, 'mouseup', function(event) {
			try {
				Element.removeClassName(this, 'sel-arrow-down');
			} catch(e) {}
		});
	},
	createSelectList: function() {
		try {
			if(this.sellist) {
				this.clearSelectList(this.sellist);
			}
		} catch(e) {}
		var _html = [];
		var _w = Element.getWidth(this.sel);
		_html.push('<table cellspacing=0 cellpadding=0 class="custom-select-list"><tbody>');
		this.options.each(function(item) {
			var _s = item.text == this.sel.getElementsByTagName('div')[0].innerHTML ? ' td-st-over' : '';
			_html.push('<tr><td class="td-st'+ _s +'" style="width:'+ _w +'px;"><div style="margin:auto 4px;white-space:nowrap;">'+ item.text +'</div></td></tr>');
		}.bind(this));
		_html.push('</tbody></table>');
		var _d = document.createElement('div');
		_d.innerHTML = _html.join('');
		this.sellist = _d;
		var self = this;
		var _sel_td = $A(_d.getElementsByTagName('td'));
		_sel_td.each(function(item, index) {
			Event.observe(item, 'click', function(event) {
				try {
					self.options[index].exec(event);
				} catch(e) {}
				try {
					self.sel.getElementsByTagName('div')[0].innerHTML = self.options[index].text;
				} catch(e) {}
			});
			Event.observe(item, 'mouseover', function(event) {
				_sel_td.each(function(item) {
					Element.removeClassName(item, 'td-st-over');
				});
				try {
					Element.addClassName(this, 'td-st-over');
				} catch(e) {}
			});
			/*
			Event.observe(item, 'mouseout', function(event) {
				try {
					Element.removeClassName(this, 'td-st-over');
				} catch(e) {}
			});
			*/
		});
		var _POS = Position.cumulativeOffset;
		var _x = _POS(this.sel)[0];
		var _y = _POS(this.sel)[1] + Element.getHeight(this.sel);
		Element.setStyle(_d, {
			position: 'absolute',
			top: _y + 'px',
			left: _x + 'px',
			zIndex: 999999
		});
		DOM.sohuMailMain.appendChild(_d);
		Event.observe(_d, 'click', function(event) {
			this.clearSelectList(_d);
		}.bind(this));
	},
	clearSelectList: function(el) {
		$A($(el).getElementsByTagName('*')).each(function(item) {
			try {
				item.onclick = null;
				item.onmouseover = null;
				item.onmouseout = null;
			} catch(e) {}
			try {
				Event.stopObserving(item, 'click');
				Event.stopObserving(item, 'mouseover');
				Event.stopObserving(item, 'mouseout');
			} catch(e) {}
			try {
				Element.remove(el);
				el = null;
			} catch(e) {}
		});
	}
};
// var _select = new Select();
