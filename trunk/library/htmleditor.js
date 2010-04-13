var HTMLEditor = Class.create();
HTMLEditor.prototype = {
    initialize: function(){
        // var self = this;
		if(arguments[0]) {
			this.showitems = arguments[0];
		}
		this.domain = isDomain ? localDomain : undefined;
        this.body = $('sohuMailMain');
		this.loaded = false;
		try {
			this.f = typeof getLocation == 'function' ? getLocation().folder : 'main';
		} catch(e) {}
        this.all = [{
            name: 'Bold',
            text: '',
            title: '加粗',
            area: [20, 20],
			eventname: 'se_bold',
			classname: 'editor-bold'
        },
        {
            name: 'justifyleft',
            text: '',
            title: '左对齐',
            area: [20, 20],
			eventname: 'se_jleft',
			classname: 'editor-jleft'
        },
        {
            name: 'fontselect',
            text: '字体',
            title: '字体',
            area: [50, 20],
			eventname: 'se_fontselect',
			classname: 'editor-font',
            click: function(event){
                this.showLayers(this.createFontLayer(), event);
            }.bind(this)
        }, {
            name: 'fontsizeselect',
            text: '字号',
            title: '字号',
            area: [50, 20],
			eventname: 'se_fontsize',
			classname: 'editor-font',
            click: function(event){
                this.showLayers(this.createFontSizeLayer(), event);
            }.bind(this)
        }, {
            name: 'forecolor',
            text: '',
            title: '字体颜色',
            area: [20, 20],
			eventname: 'se_color',
			classname: 'editor-color',
            click: function(event){
                this.showLayers(this.createColorLayer('fore'), event);
            }.bind(this)
        },
        {
            name: 'insertimage',
            text: '',
            title: '增加图片',
            area: [20, 20],
			eventname: 'se_image',
			classname: 'editor-image',
            click: function(event){
                this.createImageLink();
            }.bind(this)
        }, {
            name: 'createlink',
            text: '',
            title: '超链接',
            area: [20, 20],
			eventname: 'se_link',
			classname: 'editor-link',
            click: function(event){
                this.createLink();
            }.bind(this)
        }, {
            name: 'sign',
            text: '',
            title: '个性签名',
            area: [20, 20],
			eventname: 'se_sign',
			classname: 'editor-sign',
            click: function(event){
            	writemail.changeSign(this);
            }.bind(this)
        }, 
		{
			name: 'letter',
			text: '信纸',
			id: 'use_letter',
			title: '展开信纸预览',
			area: [50, 20],
			eventname: 'se_letter',
			classname: 'editor-letter',
			// 是否需要在图标后面显示文字
			istext: true,
			click: function(event) {
				writemail.showLetter();
			}
		}, {
			name: 'line',
			text: '|',
			title: '',
			area: [6, 20],
			classname: 'editor-line'
		}, {
			name: 'postcard',
			text: '使用明信片',
			title: '使用明信片',
			area: [84, 20],
			eventname: 'se_postcard',
			classname: 'editor-postcard',
			// 是否需要在图标后面显示文字
			istext: true,
			click: function(event) {
				changePanel('composeCardMail', null, null, true);
			}
		}, {
			name: 'line',
			text: '|',
			title: '',
			area: [6, 20],
			classname: 'editor-line'
		}, {
			name: 'convey',
			text: '使用魔法情书',
			title: '使用魔法情书',
			area: [96, 20],
			eventname: 'se_convey',
			classname: 'editor-convey',
			// 是否需要在图标后面显示文字
			istext: true,
			click: function(event) {
				changePanel('userMail', null, null, true);
			}
		}
		];
        // 显示字体等的浮动层
        this.layers = [];
        Event.observe(this.body, 'click', function(event){
			try {
				this.hideLayers();
			} catch(e) {}
        }.bind(this));
        
    },
	// 初始化编辑器中的事件
	initEvent: function(editorElement) {
		var self = this;
		var _tmp_dl = [
			{name: 'se_bold', click: function(EL, event) {
				self.format('Bold');
			}},
			{name: 'se_jleft', click: function(EL, event) {
				self.format('justifyleft');
			}},
			{name: 'se_fontselect', click: function(EL, event) {
				self.showLayers(self.createFontLayer(), event);
			}},
			{name: 'se_fontsize', click: function(EL, event) {
				self.showLayers(self.createFontSizeLayer(), event);
			}},
			{name: 'se_color', click: function(EL, event) {
				self.showLayers(self.createColorLayer('fore'), event);
			}},
			{name: 'se_image', click: function(EL, event) {
				self.createImageLink();
			}},
			{name: 'se_link', click: function(EL, event) {
				self.createLink();
			}},
			{name: 'se_sign', click: function(EL, event) {
				writemail.changeSign(self);
			}},
			{name: 'se_letter', click: function(EL, event) {
				writemail.showLetter();
			}},
			{name: 'se_postcard', click: function(EL, event) {
				changePanel('composeCardMail', null, null, true);
			}},
			{name: 'se_convey', click: function(EL, event) {
				changePanel('userMail', null, null, true);
			}},
			{name: 's_editor_change', click: function(EL, event) {
				writemail.clickEditorChange();
			}}
		];
		Event.observe(editorElement, 'click', function(event) {
			var EL = $(event.target);
			try {
				_tmp_dl.each(function(item) {
					var e = self.getEventNode(EL, item.name);
					if(e) {
						item.click(EL, event);
						Event.stop(event);
					}
					return false;
				});
			} catch(e) {}
			return false;
		});
		Event.observe(editorElement, 'mouseover', function(event) {
			var EL = $(event.target);
			try {
				_tmp_dl.each(function(item) {
					var e = self.getEventNode(EL, item.name);
					if (e) {
						self.itemOver(e, event);
					}
					Event.stop(event);
					return false;
				});
			} catch(e) {}
		});
		Event.observe(editorElement, 'mouseout', function(event) {
			var EL = $(event.target);
			try {
				_tmp_dl.each(function(item) {
					var e = self.getEventNode(EL, item.name);
					if (e) {
						self.itemOut(e, event);
					}
					Event.stop(event);
					return false;
				});
			} catch(e) {}
		});
	},
	// 根据classname获取需要触发事件的节点
	getEventNode: function(targetnode, classname) {
		var _hascname = function(el, cname) {
			if(Element.hasClassName(el, cname)) {
				return el;
			} else {
				return false;
			}
		};
		return _hascname(targetnode, classname) || _hascname(targetnode.parentNode, classname) || _hascname(targetnode.parentNode.parentNode, classname);
	},
    create: function(id, callback) {
        if (this.editorArea) 
            return;
        this.Area = $(id);
        this.editorArea = document.createElement('div');
		Element.addClassName(this.editorArea, 'html-editor');
		this.Area.appendChild(this.editorArea);
        this.editorBar = document.createElement('div');
		Element.addClassName(this.editorBar, 'operate-bar');
        this.all.each(function(item){
            if (typeof item != 'object') 
                return;
			var _div = this.createItem(item);
			if(this.showitems) {
				if(!this.showitems.include(item.name.toLowerCase())) _div.style.display = 'none';
			}
            this.editorBar.appendChild(_div);
        }.bind(this));
		if(!this.showitems) this.editorBar.appendChild(this.createEditorModeItem());
        this.editorIframe = document.createElement('div');
		Element.setStyle(this.editorIframe, {
			width: '100%',
            height: 'auto',
            clear: 'both',
            margin: '0px',
            padding: '0px'
		});
        this.editorArea.appendChild(this.editorBar);
        this.editorArea.appendChild(this.editorIframe);
        this.setDm = this.domain ? 'document.domain = \'' + this.domain + '\';' : '';
        var _src = 'javascript:document.open(\'text\/html\',\'replace\');' + this.setDm + 'document.write(\'<html><head><style>body{background-color:#FFFFFF;margin:4px;font-size:14px;font-family:宋体;margin:5px;_margin-left:4px;}pre{white-space: pre-wrap;white-space: -moz-pre-wrap;white-space: -pre-wrap;white-space: -o-pre-wrap;word-wrap: break-word;}p{margin:0px;}</style></head><body><br /><div id=iframe_loaded></div></body></html>\');if(parent.Prototype.Browser.IE){try{document.body.contentEditable=true;}catch(e){}}else{try{document.designMode=\'on\';document.execCommand(\'useCSS\', false, true);}catch(e){}}document.close();';
        var editorIfr = '<iframe style="height:100%;width:100%;border:0px;margin:0px;padding:0px;background-color:#FFFFFF;" frameborder=0 src="' + _src + '"></iframe>';
		if(Editor && Editor.HtmlEditor) {
			this.editorIframe.appendChild(Editor.HtmlEditor.cloneNode(true));
		} else {
			this.editorIframe.innerHTML = editorIfr;
		}
		
		// return;
		this.HtmlEditor = this.editorIframe.firstChild;
        this.HtmlEditor.src = _src;
		var self = this;
		try {
			Event.observe(this.HtmlEditor, 'load', function(event){
				self.ifronload();
			});
		} catch(e) {}
		var _event = function() {
			var _t = setTimeout(function(){
				clearTimeout(_t);
				_t = null;
				try {
					var ifrd = self.HtmlEditor.contentWindow.document;
					var ifrd_loaded = ifrd.getElementById('iframe_loaded');
					try {
						var _j = ifrd && ifrd.body.innerHTML && ifrd.body.innerHTML != '' && ifrd_loaded;
					} catch(e) {}
					if (_j) {
						self.ifronload();
						ifrd_loaded.parentNode.removeChild(ifrd_loaded);
						ifrd_loaded = null;
						try {
							// self.listenCursor();
						} catch(e) {}
						try {
							if (callback) callback();
						} catch(e) {}
					} else {
						_event();
						return false;
					}
				} catch(e) {
					_event();
					return false;
				}
				// self.ifronload();
			}, 200);
		};
		_event();  // fix ie, opera, safari bug
		// var _h = Element.getHeight(this.editorArea);
		var _h = Element.getHeight(this.Area);
		if(_h > 0) this.editorIframe.style.height = (_h - 32) + 'px';
		// 初始化事件
		try {
			this.initEvent(this.Area);
		} catch(e) {}
    },
	ifronload: function() {
		var ifrd = this.HtmlEditor.contentWindow.document;
		if(Prototype.Browser.IE){
			try {
				ifrd.body.contentEditable = true;
			}catch(e){}
		} else {
			try {
				ifrd.designMode = 'on';
				ifrd.execCommand('useCSS', false, true);
			}catch(e){}
		}
		Event.observe(ifrd, 'click', function(event) {
			this.hideLayers();
		}.bind(this));
	},
    createItem: function(par){
        var div = document.createElement('div');
        div.setAttribute('title', par.title);
		if(par.id) {
			div.setAttribute('id', par.id);
		}
		var _style = {
            'width': par.area[0] + 'px',
            'height': par.area[1] + 'px'
		};
		Element.addClassName(div, 'item ' + par.eventname);
		if(par.name == 'line') {
			var _html = '<div class="am '+ par.classname +'" style="width:' + par.area[0] + 'px;height:' + par.area[1] + 'px;line-height:20px;display:block;"></div>';
			div.innerHTML = _html;
			return div;
		}
        Element.setStyle(div, _style);
		var _html = !par.istext ? 
					'<a hidefocus="true" href="'+ this.f +'" class="am '+ par.classname +'" style="width:' + par.area[0] + 'px;height:' + par.area[1] + 'px;line-height:20px;display:block;text-decoration:none;color:#333333;"><span style="font-size:12px;margin:6px;width:100%;height:100%;">' + par.text + '</span></a>' :
					'<a hidefocus="true" href="'+ this.f +'" class="am '+ par.classname +'" style="width:20px;height:20px;line-height:20px;display:block;text-decoration:none;color:#333333;float:left;"></a><span style="font-size:12px;">' + par.text + '</span>';
		div.innerHTML = _html;
        return div;
    },
	// 元素鼠标over out的状态
	itemOver: function(el, event) {
		try {
			var _f = el.isfocus ? el.isfocus : el.getAttribute('isfocus');
			if(_f == 'true') return false;
		} catch(e) {}
		try {
			Element.addClassName(el, 'item-focus');
		} catch(e) {}
		Event.stop(event);
		return false;
	},
	itemOut: function(el, event) {
		try {
			var _f = el.isfocus ? el.isfocus : el.getAttribute('isfocus');
			if(_f == 'true') return false;
		} catch(e) {}
		try {
			Element.removeClassName(el, 'item-focus');
		} catch(e) {}
		Event.stop(event);
		return false;
	},
	// 创建特殊的操作图标
	createEditorModeItem: function() {
		var div = document.createElement('div');
		Element.addClassName(div, 'item item-bold item-edit s_editor_change');
		div.innerHTML = ' 纯文本 ';
        return div;
	},
    // 显示层
    showLayers: function(func, event){
        this.hideLayers();
        Event.stop(event);
        var _s = func;
		
		var div = $(event.target);
		div = div.nodeName.toLowerCase() == 'div' ? div : div.parentNode.nodeName.toLowerCase() == 'div' ? div.parentNode : div.parentNode.parentNode.nodeName.toLowerCase() == 'div' ? div.parentNode.parentNode : null;
        if(!div) return false;
		// var div = event.srcElement ? event.srcElement : event.target;
        var pos = Position.cumulativeOffset(div);
        // var pos = Position.page(div);
        var _h = Element.getHeight(div);
        Element.setStyle(_s, {
            left: (pos[0]) + 'px',
            top: (pos[1] + _h + 2) + 'px',
            display: 'block'
        });
        return false;
    },
    // 隐藏所有的层
    hideLayers: function() {
		try {
			if (this.layers && this.layers.length > 0) {
				this.layers.each(function(item){
					Element.hide(item);
				});
			}
		} catch(e) {}
    },
    // 字体样式层
    createFontLayer: function(){
        if (this.fontLayer) 
            return this.fontLayer;
        this.fontLayer = document.createElement('div');
        with (this.fontLayer.style) {
            position = 'absolute';
            left = top = '0px';
            zIndex = 100009;
            width = '150px';
            height = '240px';
            overflowX = 'hidden';
            overflowY = 'auto';
            backgroundColor = 'white';
            border = '1px solid #838383';
            display = 'none';
        };
        var fontface = ['宋体', '黑体', '楷体', '隶书', '仿宋体', '幼圆', 'Arial', 'Arial Black', 'Arial Narrow', 'Century Gothic', 'Comic Sans MS', 'Courier New', 'MS Sans Serif', 'Script', 'Verdana', 'Times New Roman', 'WingDings'];
        var a = [];
        for (var k = 0; k < fontface.length; k++) {
            a.push('<a hidefocus="true" href="'+ this.f +'" onclick="return false;" style="font:normal 12px ' + fontface[k] + ';color:black;display:block;height:16px;line-height:16px;padding:2px;text-decoration:none;">' + fontface[k] + '</a>');
        }
        this.fontLayer.innerHTML = a.join('');
        var self = this;
        $A(this.fontLayer.getElementsByTagName('a')).each(function(item){
            item.onmouseover = function(){
                this.style.backgroundColor = '#E5E5E5';
            };
            item.onmouseout = function(){
                this.style.backgroundColor = '';
            };
			item.onclick = function() {
				self.format('fontname', item.innerHTML);
                return false;
			};
        });
        this.body.appendChild(this.fontLayer);
		try {
			this.layers.push(this.fontLayer);
		} catch(e) {}
        return this.fontLayer;
    },
    // 字体大小层
    createFontSizeLayer: function(){
        if (this.fontSizeLayer) 
            return this.fontSizeLayer;
        this.fontSizeLayer = document.createElement('div');
        with (this.fontSizeLayer.style) {
            position = 'absolute';
            left = top = '0px';
            zIndex = 100010;
            width = '120px';
            height = 'auto';
            backgroundColor = 'white';
            border = '1px solid #838383';
            display = 'none';
        };
        var fontsize = [{
            name: '极小',
            size: '8pt',
			font: 1
        }, {
            name: '较小',
            size: '10pt',
			font: 2
        }, {
            name: '小',
            size: '12pt',
			font: 3
        }, {
            name: '中',
            size: '14pt',
			font: 4
        }, {
            name: '大',
            size: '18pt',
			font: 5
        }, {
            name: '较大',
            size: '24pt',
			font: 6
        }, {
            name: '极大',
            size: '36pt',
			font: 7
        }];
        var a = [];
        fontsize.each(function(item) {
            a.push('<a hidefocus="true" href="'+ this.f +'" onclick="return false;" style="font-size:' + item.size + ';color:black;display:block;width:116px;padding:2px;text-decoration:none;line-height:120%;"> '+ item.name +' </a>');
        }.bind(this));
        this.fontSizeLayer.innerHTML = a.join('');
        var self = this;
        $A(this.fontSizeLayer.getElementsByTagName('a')).each(function(item, index){
            item.onmouseover = function(){
                this.style.backgroundColor = '#E5E5E5';
            };
            item.onmouseout = function(){
                this.style.backgroundColor = '';
            };
			item.onclick = function(event) {
				self.format('fontsize', fontsize[index].font);
                return false;
			};
        });
        this.body.appendChild(this.fontSizeLayer);
		try {
			this.layers.push(this.fontSizeLayer);
		} catch(e) {}
        return this.fontSizeLayer;
    },
    // 创建字体颜色层
    createColorLayer: function(type){
        var t = type + 'ColorLayer';
        if (this[t]) 
            return this[t];
        this[t] = document.createElement('div');
        with (this[t].style) {
            position = 'absolute';
            left = top = '0px';
            zIndex = 100011;
            width = 'auto';
            height = 'auto';
            backgroundColor = 'white';
            border = '1px solid #838383';
            display = 'none';
        };
        var color = [['#000000', '#993300', '#333300', '#003300', '#003366', '#000080', '#333399', '#333333'], ['#800000', '#FF6600', '#808000', '#008000', '#008080', '#0000FF', '#666699', '#808080'], ['#FF0000', '#FF9900', '#99CC00', '#339966', '#33CCCC', '#3366FF', '#800080', '#999999'], ['#FF00FF', '#FFCC00', '#FFFF00', '#00FF00', '#00FFFF', '#00CCFF', '#993366', '#C0C0C0'], ['#FF99CC', '#FFCC99', '#FFFF99', '#CCFFCC', '#CCFFFF', '#99CCFF', '#CC99FF', '#FFFFFF']];
        var r = color.length;
        var c = color[0].length;
        var tr = [];
        for (var i = 0; i < r; i++) {
            var td = [];
            for (var j = 0; j < c; j++) {
                td.push('<td style="padding:2px;"><a hidefocus="true" href="'+ this.f +'" colorattr="'+ color[i][j] +'"><div style="font-size:0;width:11px;height:11px;background:' + color[i][j] + ';border:1px solid #808080;cursor:pointer;"></div></a></td>');
            }
            tr.push('<tr>' + td.join("") + '</tr>');
        }
        this[t].innerHTML = '<table width=""><tbody>' + tr.join("") + '</tbody></table>';
        this.body.appendChild(this[t]);
		var self = this;
		$A(this[t].getElementsByTagName('a')).each(function(item) {
			var _color = item.colorattr ? item.colorattr : item.getAttribute('colorattr');
			item.onclick = function(event) {
				self.format(type + 'color', _color);
				return false;
			};
		});
		try {
			this.layers.push(this[t]);
		} catch(e) {}
        return this[t];
    },
    // 添加图片
    createImageLink: function(){
        var v = window.prompt('插入图片', 'http://');
        if (!v || v == null || v.strip() == 'http://' || v.strip() == '') 
            return;
        this.format('insertimage', v);
    },
    // 创建超链接
    createLink: function(){
        var v = window.prompt('请输入链接 (如:http://www.sohu.com/):', 'http://');
        if (!v || v == null || v.strip() == 'http://' || v.strip() == '') 
            return;
        this.format('createlink', v);
    },
    format: function(type, para){
        var ifrd = this.HtmlEditor.contentWindow.document;
        // var ifrd = frames[this.ifr_name].document;
        ifrd.body.focus();
        !para ? (Prototype.Browser.IE ? ifrd.execCommand(type) : ifrd.execCommand(type, false, false)) : ifrd.execCommand(type, false, para);
        ifrd.body.focus();
    },
	// 返回编辑器区域的内容
	c: function(){
		return this.HtmlEditor.contentWindow;
	},
    getContent: function(){
        return this.c().document.body.innerHTML;
    },
    setContent: function(c){
        this.c().document.body.innerHTML = c;
    },
    focus: function(){
        this.c().focus();
    },
	blur: function() {
		// this.c().blur();
	},
	// 获得光标所在区域的父节点
	getSelectParentNode: function() {
		var _selection, _range, _range_text, _D = this.c();
		if(Prototype.Browser.IE) {
			return  _D.document.selection.createRange().parentElement();
			_selection = _D.selection;
            _range = _selection.createRange();
            _range_text = _range.text;
		} else {
			_selection = _D.getSelection();
        	_range = _selection.getRangeAt(0);
            _range_text = _range.toString();
			
			var startRangeNode = _range.startContainer;
            if (startRangeNode.nodeType == 3) {
            	// var textNode = startRangeNode;
                // startRangeNode = textNode.parentNode;
				return startRangeNode;
            } else {
                if (startRangeNode.tagName.toLowerCase() == 'html') {
                	startRangeNode = startRangeNode.childNodes[0].nextSibling;
           		}
           	}
            return startRangeNode;
		}
	},
	
	// 获得编辑器的光标
	getCursor: function() {
		if(Prototype.Browser.IE) {
			return this.c().selection;
		} else {
			return this.c().getSelection();
		}
	},
	// 发现有blockquote，将其断行
	cutBlockquote: function(node) {
		var n = node ? node : this.getSelectParentNode();
		if(!this.nodeListArray) this.nodeListArray = [];
		if(n && n.nodeName.toLowerCase() != 'body') {
			this.nodeListArray.push(n.nodeName.toLowerCase());
			arguments.callee.apply(this, [n.parentNode]);
		}
		return this.nodeListArray;
	},
	
	setCaret: function() {
		try {
			this.caretPos = this.c().document.selection.createRange().duplicate();
		} catch(e) {}
	},
	
	listenCursor: function() {
		var _event = ['select', 'click', 'keyup'];
		_event.each(function(item) {
			try {
				Event.observe(this.c().document, item, this.setCaret.bindAsEventListener(this));
			} catch(e) {}
		}.bind(this));
	},
	
	// 编辑器中光标相关的函数
	getSel : function() {
		var w = this.c();
		return w.getSelection ? w.getSelection() : w.document.selection;
	},
	
	getRng : function() {
		var s = this.getSel(), r, isIE = Prototype.Browser.IE;
		try {
			if (s)
				r = s.rangeCount > 0 ? s.getRangeAt(0) : (s.createRange ? s.createRange() : this.c().document.createRange());
		} catch (ex) { }
		if (!r)
			r = isIE ? this.c().document.body.createTextRange() : this.c().document.createRange();
		return r;
	},
	
	setSelect: function(el, start, end) {
		var isIE = Prototype.Browser.IE, s = this.getSel(), r = this.getRng();
		try {
			if (isIE) {
				r.moveToElementText(el);
				r.collapse(1);
				r.moveStart('character', start);
				r.moveEnd('character', end);
				r.select();
			} else {
				r.setStart(el, start);
				r.setEnd(el, end);
				if (s) {
					s.removeAllRanges();
					s.addRange(r);
				}
			}
		} catch(e) {}
	},
	
    destroy: function() {
		try {
			this.HtmlEditor.focus();
		} catch(e) {}
		try {
			if (this.layers) {
				this.layers.each(function(item){
					if (item.onclick) item.onclick = null;
					if (item.onmouseover) item.onmouseover = null;
					if (item.onmouseout) item.onmouseout = null;
					item = null;
				});
				this.layers = null;
			}
		} catch(e) {}
        try {
            Event.stopObserving(this.body, 'click', function(event){
                this.hideLayers();
            }.bind(this));
        } catch (e) { }
		// 清除闭包，防止内存泄露
		try {
			Event.stopObserving(this.Area, 'click');
			Event.stopObserving(this.Area, 'mouseover');
			Event.stopObserving(this.Area, 'mouseout');
		} catch(e) {}
        try {
            if (this.HtmlEditor) 
                Element.remove(this.HtmlEditor);
            if (this.editorArea) 
                Element.remove(this.editorArea);
        } catch (e) {}
    }
};

