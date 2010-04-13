var Dialog = Class.create();
Dialog.prototype = {
	initialize: function() {
		this.dialog = null;
		this.createLayer();
		this.createDialog();
	},
	// 获取浏览器的宽高
	getDimensions: function() {
		var _h = (document.compatMode != 'BackCompat' ? document.documentElement.clientHeight : document.body.clientHeight) || 0;
		var _w = (document.compatMode != 'BackCompat' ? document.documentElement.clientWidth : document.body.clientWidth) || 0;
		return {width: _w, height: _h};
	},
	// 获取提示信息的坐标位置
	getPositions: function(el) {
		el = $(el);
		var _top  = ( this.getDimensions().height - Element.getHeight(el) ) / 2;
		var _left = ( this.getDimensions().width - Element.getWidth(el) ) / 2;
		return {left: _left, top: _top};
	},
	createLayer: function() {
		this.shadow_layer = document.createElement('div');
		document.body.appendChild(this.shadow_layer);
		Element.setStyle(this.shadow_layer, {backgroundColor: '#FFFFFF', opacity: 0.3, position: 'absolute', left: '0px', top: '0px', zIndex: 9997, width: '100%',display:'none'});
	},
	showLayer: function() {
		var h = this.getDimensions().height;
		var w = this.getDimensions().width;
		if(!this.shadow_layer || this.shadow_layer == null) this.createLayer();
		Element.show(this.shadow_layer);
		Element.setStyle(this.shadow_layer, {height: h + 'px', width: w + 'px'});
	},
	createDialog: function() {
		if(this.dialog) return this.dialog.firstChild;
		this.dialog = document.createElement('div');
		// this.dialog.setAttribute('id', this.element_id);
		document.body.appendChild(this.dialog);
		with(this.dialog.style) {
			position   = 'absolute';
			zIndex     = 10000;
			fontFamily = 'Arial,Helvetica,sans-serif';
			fontSize   = '12px';
			width      = '300px';
			height     = '120px';
			top        = (this.getDimensions().height - 120) / 2 + 'px';
			left       = (this.getDimensions().width - 300) / 2 + 'px';
			display    = 'none';
		};
		var _alert = ['<div class="dialog_box menu-box-shadow">',
					  '<div class="amv title"><div class="title_con"></div>',
					  '</div>',
					  '<div style="width:98%;height:auto;"></div>',
					  '</div>',
					  '<iframe src="javascript:;document.open();document.write(\'<html><head><\/head><body><\/body><\/html>\');document.close();" style="background:transparent;width:310px;position:absolute;z-index:9998;top:0px;left:0px;overflow:hidden;border:0px;" frameborder=0></iframe>'].join('');
		this.dialog.innerHTML = _alert;
		this.content = this.dialog.getElementsByTagName('div')[0].childNodes[1];
		// this.dialog.firstChild.firstChild.lastChild.onclick = this.close.bindAsEventListener(this);
		Event.observe(window, 'resize', this.onResizeCallback.bindAsEventListener(this));		
		this.drag = new Draggable(this.dialog, {
            // scroll:$('main_body_box'),
            snap: function(x, y, draggable) {
                function constrain(n, lower, upper){
                    if (n > upper) 
                        return upper;
                    else 
                        if (n < lower) 
                            return lower;
                        else 
                            return n;
                }
                var element_dimensions = Element.getDimensions(draggable.element);
                var parent_dimensions = Element.getDimensions(draggable.element.previousSibling);
                return [constrain(x, 0, (parent_dimensions.width - 12) - element_dimensions.width), constrain(y, 0, (parent_dimensions.height - 22) - element_dimensions.height)];
            },
            handle: this.dialog.firstChild.firstChild,
			zindex: 10001,
            starteffect: false,
            endeffect: false
        });
		return this.dialog.firstChild;
	},
	setDefaultSize: function() {
		var _w = this.dialog.offsetWidth;
		var _h = this.dialog.offsetHeight;
		var style = {width:_w+'px', height:_h+'px'};
		this.dialog.getElementsByTagName('iframe')[0].style.height = _h + 'px';
		var _style = {top:(this.getDimensions().height - _h) / 2 + 'px',left:(this.getDimensions().width - _w) / 2 + 'px'};
		Element.setStyle(this.dialog, _style);
	},
	alert: function() {
		var defaults = {
			title: USE_SYS.title + '邮箱提示：',
			info: '这是当前的系统提示信息...... ',
			click: function(event) {},
			element: null
    	};
 	    var options = Object.extend(defaults, arguments[0] || { });
		var dlg = this.createDialog();
		dlg.firstChild.firstChild.innerHTML = options.title;
		var content = '<div><div class="alert_content"><div class="ico"><span class="am alert_icon"></span></div><div class="con">'+ options.info +'</div></div><div class="alert_button"><input type="button" value=" 确　定 " /></div></div>';
		this.content.innerHTML = content;
		var _input = this.content.getElementsByTagName('input')[0];
		_input.onclick = function(event) {
			options.click(event);
			this.close();
		}.bindAsEventListener(this);
		this.showLayer();
		Element.show(this.dialog);
		this.setDefaultSize();
		var _t = setTimeout(function() {
			clearTimeout(_t);
			_t = null;
			_input.focus();
		}, 100);
	},
	confirm: function() {
		var defaults = {
			title: USE_SYS.title + '邮箱提示：',
			info: '您确定要关闭当前的对话框吗？',
			confirm: '确　定',
			cancel: '取　消',
			click: function(event) {},
			cancelclick: function(event) {}
    	};
 	    var options = Object.extend(defaults, arguments[0] || { });
		var dlg = this.createDialog();
		dlg.firstChild.firstChild.innerHTML = options.title;
		var content = '<div><div class="alert_content"><div class="ico"><span class="am confirm_icon"></span></div><div class="con">'+ options.info +'</div></div><div class="confirm_button"><input type="button" value=" '+ options.confirm +' " /><input type="button" value=" '+ options.cancel +' " /></div></div>';
		this.content.innerHTML = content;
		var _input = dlg.getElementsByTagName('input')[0];
		_input.onclick = function(event) {
			options.click(event);
			this.close();
		}.bindAsEventListener(this);
		dlg.getElementsByTagName('input')[1].onclick = function(event){
			options.cancelclick(event);
			this.close();
		}.bindAsEventListener(this);
		this.showLayer();
		Element.show(this.dialog);
		this.setDefaultSize();
		var _t = setTimeout(function() {
			clearTimeout(_t);
			_t = null;
			_input.focus();
		}, 100);
	},
	prompt: function() {
		var defaults = {
			title: USE_SYS.title + '邮箱提示：',
			info: '脚本提示',
			prompt: 'test',
			click: function(value, event) {alert(value);}
    	};
 	    var options = Object.extend(defaults, arguments[0] || { });
		var dlg = this.createDialog();
		dlg.firstChild.firstChild.innerHTML = options.title;
		var content = '<div><div class="prompt_content"><div><span class="am prompt_icon"></span></div><div class="con">'+ options.info +'<br /><input type="input" value="'+ options.prompt +'" /></div></div><div style="text-align: center;clear:both;"><input type="button" style="height: 25px; width: 80px; text-align: center;margin:0px 12px;" value=" 确　定 " /><input type="button" style="height: 25px; width: 80px; text-align: center;margin:0px 12px;" value=" 取　消 " /></div></div>';
		this.content.innerHTML = content;
		dlg.getElementsByTagName('input')[1].onclick = function(event) {
			var _value = dlg.getElementsByTagName('input')[0].value;
			options.click(_value, event);
			this.close();
		}.bindAsEventListener(this);
		dlg.getElementsByTagName('input')[2].onclick = this.close.bindAsEventListener(this);
		this.showLayer();
		Element.show(this.dialog);
		this.setDefaultSize();
	},
	_custom: function() {
		var defaults = {
			title: USE_SYS.title + '邮箱提示：',
			html: '<div><div style="padding: 8px 20px; height: 50px;"> 脚本提示 </div><div style="text-align: center;"><input type="button" style="height: 25px; width: 80px; text-align: center;margin:0px 12px;" value=" 保　存 " /><input type="button" style="height: 25px; width: 80px; text-align: center;margin:0px 12px;" value=" 不　保　存 " /><input type="button" style="height: 25px; width: 80px; text-align: center;margin:0px 12px;" value=" 取　消 " onclick="_dialog.close();_dialog.closeCustom();" /></div></div>',
			style: {width:'500px', height:'150px'}
      		// width: 350,
			// height: 150
    	};
		var options = Object.extend(defaults, arguments[0] || { });
		var dlg = this.createDialog();
		dlg.firstChild.firstChild.innerHTML = options.title;
		this.content.innerHTML = options.html;
		Element.setStyle(dlg, options.style);
		Element.setStyle(this.dialog.getElementsByTagName('iframe')[0], options.style);
		var _style = Object.extend(options.style, {top:(this.getDimensions().height - parseInt(options.style.height)) / 2 + 'px',left:(this.getDimensions().width - parseInt(options.style.width)) / 2 + 'px'});
		Element.setStyle(this.dialog, _style);
		this.showLayer();
		Element.show(this.dialog);
	},
	custom: function() {
		
		var defaults = {
			title: USE_SYS.title + '邮箱提示：',
			html: '<div style="width:100%;height:100%;border:1px solid red;"><div id="layer"> index </div><div> test </div><div><input type="button" value="close" onclick="_dialog.closeCustom();" /></div></div>',
			style: {width:'500px', height:'150px', backgroundColor:'white'},
			dragid: 'layer'
    	};
		var options = Object.extend(defaults, arguments[0] || { });
		this.customDiv = document.createElement('div');
		Element.setStyle(this.customDiv, options.style);
		this.customDiv.innerHTML = options.html;
		document.body.appendChild(this.customDiv);
		
		var _style = {top:(this.getDimensions().height - parseInt(options.style.height)) / 2 + 'px',left:(this.getDimensions().width - parseInt(options.style.width)) / 2 + 'px', position:'absolute', zIndex: '999999'};
		this.showLayer();
		Element.setStyle(this.customDiv, _style);
		var did = $(options.dragid);
		
		this.dragCustom = new Draggable(this.customDiv, {
            snap: function(x, y, draggable) {
                function constrain(n, lower, upper){
                    if (n > upper) 
                        return upper;
                    else 
                        if (n < lower) 
                            return lower;
                        else 
                            return n;
                }
                var element_dimensions = Element.getDimensions(draggable.element);
                var parent_dimensions = Element.getDimensions(draggable.element.parentNode);
                return [constrain(x, 0, (parent_dimensions.width - 12) - element_dimensions.width), constrain(y, 0, (parent_dimensions.height - 22) - element_dimensions.height)];
            },
            
            handle: did,
			zindex: 10001,
            starteffect: false,
            endeffect: false
        });
        
	},
	close: function() {
		try {
			Element.hide(this.dialog);
			Element.hide(this.shadow_layer);
			try {
				$A(this.content.getElementsByTagName('*')).each(function(item) {
					item.onclick = null;
				});
			} catch(e) {}
			this.content.innerHTML = '';
		} catch(e) {}
	},
	// 如果是自定义的弹出层，关闭时重置他的宽度高度
	closeCustom: function() {
		/*
		var _sty = {width:'auto', height:'auto'};
		var dlg = this.createDialog();
		if(dlg) Element.setStyle(dlg, _sty);
		if(this.dialog) Element.setStyle(this.dialog, _sty);
		*/
		try {
			Element.hide(this.shadow_layer);
			if(this.dragCustom) {
				this.dragCustom.destroy();
				this.dragCustom = null;
			}
			if(this.customDiv) {
				this.customDiv.parentNode.removeChild(this.customDiv);
				this.customDiv = null;
			}
		} catch(e) {}
	},
	onResizeCallback: function() {
		if(!Element.visible(this.shadow_layer)) return;
		if(this.shadow_layer) Element.setStyle(this.shadow_layer, {
			height: this.getDimensions().height + 'px',
			width: this.getDimensions().width + 'px'
		});
		if(this.dialog) Element.setStyle(this.dialog, {
			top: this.getPositions(this.dialog).top + 'px',
			left: this.getPositions(this.dialog).left + 'px'
		});
	}
};
var _dialog = new Dialog();
