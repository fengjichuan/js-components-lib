// 扩展Draggable, 为明信片定制
var CardDraggable = Class.create();
CardDraggable.prototype = Object.extend({}, Draggable.prototype);
Object.extend(CardDraggable.prototype, {
    draw: function(point) {
        var pos = Position.cumulativeOffset(this.element);
        if (this.options.ghosting) {
            var r = Position.realOffset(this.element);
            pos[0] += r[0] - Position.deltaX;
            pos[1] += r[1] - Position.deltaY;
        }
        
        var d = this.currentDelta();
        pos[0] -= d[0];
        pos[1] -= d[1];
        
        if (this.options.scroll && (this.options.scroll != window && this._isScrollChild)) {
            pos[0] -= this.options.scroll.scrollLeft - this.originalScrollLeft;
            pos[1] -= this.options.scroll.scrollTop - this.originalScrollTop;
        }
        
        var p = [0, 1].map(function(i){
            return (point[i] - pos[i] - this.offset[i])
        }.bind(this));
        
        if (this.options.snap) {
            if (Object.isFunction(this.options.snap)) {
                p = this.options.snap(p[0], p[1], this);
            } else {
                if (Object.isArray(this.options.snap)) {
                    p = p.map(function(v, i){
                        return (v / this.options.snap[i]).round() * this.options.snap[i]
                    }.bind(this));
                } else {
                    p = p.map(function(v){
                        return (v / this.options.snap).round() * this.options.snap
                    }.bind(this));
                }
            }
        }
        
        var style = this.element.style;
		if(!this._element) this._element = $('user_image_shadow');
        if ((!this.options.constraint) || (this.options.constraint == 'horizontal')) {
			style.left = p[0] + "px";
			if(this._element) this._element.style.left = postCard.area_l + p[0] + postCard.card_pos[0] + 'px';
		}
        if ((!this.options.constraint) || (this.options.constraint == 'vertical')) {
			style.top = p[1] + "px";
			if(this._element) this._element.style.top = postCard.area_t + p[1] + postCard.card_pos[1] + 'px';
		}
        
        if (style.visibility == "hidden") 
            style.visibility = ""; // fix gecko rendering
    }
});

var PostCard = Class.create();
PostCard.prototype = {
	initialize: function(img, card, textarea, template, params) {
		if(this.drag) {
			try {
				this.drag.destroy();
				this.drag = null;
			} catch(e) {}
		}
		this.img = img;
		this.card = card;
		this.textarea = textarea;
		this.template = template;
		// this.img_w = Element.getWidth($(this.img));
		// this.img_h = Element.getHeight($(this.img));
		this.imgProperty = {};
		// this.init();
		this.listenCard();
		this.zoomImg();
		this.index = 0;
		this.is_drag = false;
		this.params = {
			frame: 50,
			multiple: 4
		};
		if(params) {
			for(var key in params) {
				if(params[key]) this.params[key] = params[key];
			}
		}
		this.textarea_mouseover = function() {
			Element.addClassName($(this.textarea + '_range'), 'hover');
		};
		this.textarea_mouseout = function() {
			Element.removeClassName($(this.textarea + '_range'), 'hover');
		};
		this.card_dblclick = function(up) {
			if(this.dbclick || (this.index >= this.params.frame && up) || (this.index <= 0 && !up)) return;
			this.dbclick = true;
			var _this = this;
			var up = up;
			setTimeout(function() {
				var i = 0;
				var timer = null;
				var self = _this;
				var _up = up;
				var _list = [];
				timer = setInterval(function() {
					if (i >= 10) {
						clearInterval(timer);
						timer = null;
						self.dbclick = false;
						return;
					}
					if(_up) {
						self.index = self.index + 1;
					} else {
						self.index = self.index - 1;
					}
					if (!_list.include(self.index)) {
						_list.push(self.index);
						self.scrollImg(null, self.index);
						i++;
					}
				}, 27);
			}, 100);
		};
		
		this.show_slider = function(event) {
			var pointer = [Event.pointerX(event) + $('sohuMailMain').scrollLeft, Event.pointerY(event) + $('sohuMailMain').scrollTop];
			if(Position.within($('postcard_slider'), pointer[0], pointer[1])) {
				if($('postcard_slider').style.visibility == 'hidden') $('postcard_slider').style.visibility = 'visible';
			}
		};
		Event.observe(this.textarea, 'mouseover', this.textarea_mouseover.bindAsEventListener(this));
		Event.observe(this.textarea, 'mouseout', this.textarea_mouseout.bindAsEventListener(this));
		Event.observe(this.card, 'dblclick', this.card_dblclick.bindAsEventListener(this, true));
		Event.observe($('postcard_option_area'), 'mousemove', this.show_slider.bindAsEventListener(this));
	},
	init: function(pro) {
		// this.initImgSize();
		if (pro.imgwidth && pro.imgheight) {
			this.img_w = pro.imgwidth;
			this.img_h = pro.imgheight;
		} else {
			this.img_w = Element.getWidth($(this.img));
			this.img_h = Element.getHeight($(this.img));
		}
		if (pro.areawidth && pro.areaheight) {
			this.card_w = pro.areawidth;
			this.card_h = pro.areaheight;
		} else {
			this.card_w = Element.getWidth($(this.card));
			this.card_h = Element.getHeight($(this.card));
		}
		/*
		this.img_w = Element.getWidth($(this.img));
		this.img_h = Element.getHeight($(this.img));
		this.card_w = Element.getWidth($(this.card));
		this.card_h = Element.getHeight($(this.card));
		*/
		this.card_pos = Position.positionedOffset($(this.card));
		// this.img_pos = this.getImgPos();
		this.img_pos = [0,0];
		/*
		this.center_pointer = [this.card_pos[0] + (this.card_w / 2), this.card_pos[1] + (this.card_h / 2)];
		this.img_center = [
			this.img_w - this.img_pos[0] - (this.card_w / 2),
			this.img_h - this.img_pos[1] - (this.card_h / 2),
		];
		*/
		// 初始化的时候图片左上角相对卡片中心区域的坐标
		this.fixPos(this.img_w, this.img_h);
	},
	// 获取图片的大小
	initImgSize: function() {
		this.img_w = Element.getWidth($(this.img));
		this.img_h = Element.getHeight($(this.img));
	},
	// 获取图片的坐标地址
	getImgPos: function() {
		var _l = Element.getStyle($(this.img), 'left');
		var _t = Element.getStyle($(this.img), 'top');
		_l = _l.replace(/px/, '');
		_t = _t.replace(/px/, '');
		return [_l*1, _t*1];
	},
	// 获取图片距离用户可见区域中心的x,y距离值
	getImgCenter: function() {
		// var _l = this.center_pointer[0] - (this.img_pos[0] + this.card_pos[0] - this.img_w + this.card_w);
		// var _t = this.center_pointer[1] - (this.img_pos[1] + this.card_pos[1] - this.img_h + this.card_h);
		var _l = this.img_w - this.img_pos[0] - (this.card_w / 2);
		var _t = this.img_h - this.img_pos[1] - (this.card_h / 2);
		return [_l, _t];
	},
	// 重新设置图片父级div的宽度，高度，绝对定位置
	fixPos: function(w, h) {
		var _area_x = w * 2 - this.card_w;
		var _area_y = h * 2 - this.card_h;
		// html结构有调整，重写代码
		// this.area_l = this.card_pos[0] - w + this.card_w;
		// this.area_t = this.card_pos[1] - h + this.card_h;
		this.area_l = this.card_w - w;
		this.area_t = this.card_h - h;
		Element.setStyle($(this.img).parentNode, {width: _area_x + 'px', height: _area_y + 'px', position: 'absolute', zIndex: 4, left: this.area_l + 'px', top: this.area_t + 'px'});
	},
	// 每放大一帧的倍率
	rateImg: function(index) {
		return (100 + (index * this.params.multiple)) / 100;
	},
	// 鼠标滚轮事件
	// d: 滚动的方向
	// index: 图片放大到第几帧...
	scrollImg: function(d, index) {
		if (typeof index == 'number') {
			this.index = index;
			this.index = this.index > this.params.frame ? this.params.frame : this.index;
			this.index = this.index < 0 ? 0 : this.index;
		} else {
			if (d > 0) {
				if (this.index < this.params.frame) 
					this.index++;
			} else {
				if (this.index > 0) 
					this.index--;
			}
		}
		var _w = this.img_w * this.rateImg(this.index);
		var _h = this.img_h * this.rateImg(this.index);
		var _a = (this.getImgCenter()[0]) * this.rateImg(this.index);
		var _b = (this.getImgCenter()[1]) * this.rateImg(this.index);
		var _l = _w - _a - this.card_w/2;
		var _t = _h - _b - this.card_h/2;
		Element.setStyle($(this.img), {width: _w + 'px', height: _h + 'px'});
		this.fixPos(_w, _h);
		if(_l > ( - this.area_l)) _l = ( - this.area_l);
		if(_l < 0) _l = 0;
		if(_t > ( - this.area_t)) _t = ( - this.area_t);
		if(_t < 0) _t = 0;
		Element.setStyle($(this.img), {left: _l + 'px', top: _t + 'px'});
		postCardSlider._setHandlePos(this.index);
	},
	// 图片滚动事件的绑定
	zoomImg: function() {
        this.scrollfunc = function(event) {
			if (this.is_drag) return;
			Event.stop(event);
            var direct = 0;
            if (event.wheelDelta) {
                direct = event.wheelDelta > 0 ? 1 : -1;
            } else if (event.detail) {
                direct = event.detail < 0 ? 1 : -1;
            }
			writecardmail.cardMailChange = true;
            this.scrollImg(direct);
        };
        Event.observe(this.card, 'mousewheel', this.scrollfunc.bindAsEventListener(this));
        Event.observe(this.card, 'DOMMouseScroll', this.scrollfunc.bindAsEventListener(this));
		this.card_mouseover = function() {
			if(this.is_drag) return;
			Element.addClassName($(this.card + '_range'), 'hover');
			$('postcard_slider').style.visibility = 'visible';
		};
		this.card_mouseout = function() {
			if(this.is_drag) return;
			Element.removeClassName($(this.card + '_range'), 'hover');
			$('postcard_slider').style.visibility = 'hidden';
		};
		Event.observe(this.card, 'mouseover', this.card_mouseover.bindAsEventListener(this));
		Event.observe(this.card, 'mouseout', this.card_mouseout.bindAsEventListener(this));
	},
	// 拖拽、缩放的时候算坐标，让用户的可见区域始终为中心
	fixImgPos: function(l, t) {
		var _l = this.img_w - this.card_w / 2 - (Element.getWidth($(this.img)) - l - this.card_w / 2) / this.rateImg(this.index);
		var _t = this.img_h - this.card_h / 2 - (Element.getHeight($(this.img)) - t - this.card_h / 2) / this.rateImg(this.index);
		return [_l, _t];
	},
	// 图片拖拽事件的绑定
    listenCard: function() {
		try {
			if (this.drag && this.drag != undefined) 
				this.drag.destroy();
		} catch(e) {}
		var img_shd_el = $(this.img + '_shadow');
        this.drag = new CardDraggable(this.img, {
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
                var parent_dimensions = Element.getDimensions(draggable.element.parentNode);
                return [constrain(x, 0, (parent_dimensions.width) - element_dimensions.width), constrain(y, 0, (parent_dimensions.height) - element_dimensions.height)];
            },
            handle: this.card,
            zindex: 3,
            starteffect: false,
            endeffect: false,
			onStart: function() {
				this.is_drag = true;
				writecardmail.cardMailChange = true;
				var _simg = $(this.img + '_shadow');
				var _img = $(this.img);
				_simg.src = _img.src;
				Element.setStyle(_simg, {width: Element.getWidth(_img) + 'px', height: Element.getHeight(_img) + 'px', visibility: 'visible'});
			}.bind(this),
			onDrag: function() {
				// this.shadow_img_x = this.area_l + this.getImgPos()[0] + this.card_pos[0];
				// this.shadow_img_y = this.area_t + this.getImgPos()[1] + this.card_pos[1];
				// Element.setStyle(img_shd_el, {left: this.shadow_img_x + 'px', top: this.shadow_img_y + 'px'});
			}.bind(this),
			onEnd: function(element, event) {
				// 拖拽完成之后，重置图片应有的坐标点，方便下面的缩放操作
				this.img_pos = this.fixImgPos(this.getImgPos()[0], this.getImgPos()[1]);
				Element.setStyle($(this.img + '_shadow'), {visibility: 'hidden'});
				this.is_drag = false;
				if(!Position.within($('postcard_area'), Event.pointerX(event) + $('sohuMailMain').scrollLeft, Event.pointerY(event) + $('sohuMailMain').scrollTop)) {
					Element.removeClassName($('postcard_area_range'), 'hover');
					$('postcard_slider').style.visibility = 'hidden';
				}
			}.bind(this)
        });
    },
	// 获取图片相对模板的坐标，图片的缩放比例
	getImgPosition: function() {
		var a = Position.cumulativeOffset($(this.card));
		var t = Position.cumulativeOffset($(this.template));
		var m = Position.cumulativeOffset($(this.img));
		var c = Position.cumulativeOffset($(this.textarea));
		var imgw = Element.getWidth($(this.img));
		var r = imgw / this.imgProperty.imgwidth;
		var content = $('postcard_textarea').value == '点击这里填写内容．．．' ? '' : $('postcard_textarea').value;
		var params = {
			tid: this.imgProperty.tmpurl,
			mid: this.imgProperty.imgurl,
			user: mailUploadPhoto.isUser ? 1 : 0,
			x: a[0] - m[0],
			y: a[1] - m[1],
			r: r,
			cpx: this.card_pos[0],
			cpy: this.card_pos[1],
			content: content,
			cx: c[0] - t[0],
			cy: c[1] - t[1],
			cw: Element.getWidth($(this.textarea)),
			ch: Element.getHeight($(this.textarea)),
			w: Element.getWidth($(this.card)),
			h: Element.getHeight($(this.card)),
			fontcolor: colorToRGB(this.imgProperty.textcolor)
		};
		return params;
	},
	// 设置和这个模板相匹配的图片大小 
	setImgSize4Templ: function() {
		// var cw = Element.getWidth($(this.card));
		// var ch = Element.getHeight($(this.card));
		var cw = this.imgProperty.areawidth;
		var ch = this.imgProperty.areaheight;
		var cp = cw / ch;
		// var mw = Element.getWidth($(this.img));
		// var mh = Element.getHeight($(this.img));
		var mw = this.imgProperty.imgwidth;
		var mh = this.imgProperty.imgheight;
		var mp = mw / mh;
		if(cp > mp) {
			// 按照高度为基准进行图片等比例的缩放
			// mw = parseInt(cw * 1.2);
			mw = cw;
			mh = mw / mp;
		} else {
			// 按照宽度为基准进行图片等比例的缩放
			// mh = parseInt(ch * 1.2);
			mh = ch;
			mw = mh * mp;
		}
		this.img_w = mw;
		this.img_h = mh;
		this.card_w = cw;
		this.card_h = ch;
		Element.setStyle($(this.img), {width: this.img_w + 'px', height: this.img_h + 'px'});
	},
	// 设置图片的起始坐标
	setImgPos4Templ: function() {
		var left = (this.img_w - this.card_w) / 2;
		var top  = (this.img_h - this.card_h) / 2;
		Element.setStyle($(this.img), {left: left + 'px', top: top + 'px'});
		return [left, top];
	},
	// 重置模板、图片为相应的初始位置
	resetPostcard: function() {
		this.setImgSize4Templ();
		this.scrollImg(null, 0);
		// this.setImgPos4Templ();
		// this.img_pos = this.getImgPos();
		this.img_pos = this.setImgPos4Templ();
	},
	clear: function() {
		try {
			if (this.drag && this.drag != undefined) 
				this.drag.destroy();
		} catch(e) {}
		if(typeof this.textarea_mouseover == 'function') Event.stopObserving(this.textarea, 'mouseover', this.textarea_mouseover.bindAsEventListener(this));
		if(typeof this.textarea_mouseout == 'function') Event.stopObserving(this.textarea, 'mouseout', this.textarea_mouseout.bindAsEventListener(this));
		if(typeof this.scrollfunc == 'function') {
			Event.stopObserving(this.card, 'mousewheel', this.scrollfunc.bindAsEventListener(this));
        	Event.stopObserving(this.card, 'DOMMouseScroll', this.scrollfunc.bindAsEventListener(this));
		}
		if(typeof this.card_mouseover == 'function') Event.stopObserving(this.card, 'mouseover', this.card_mouseover.bindAsEventListener(this));
		if(typeof this.card_mouseout == 'function') Event.stopObserving(this.card, 'mouseout', this.card_mouseout.bindAsEventListener(this));
		if(typeof this.card_dblclick == 'function') Event.stopObserving(this.card, 'dblclick', this.card_dblclick.bindAsEventListener(this));
		if(typeof this.show_slider == 'function') Event.stopObserving($('postcard_option_area'), 'mousemove', this.show_slider.bindAsEventListener(this));
	}
};
// var postCard = new PostCard('user_image', 'card_area');

var PostCardSlider = Class.create();
PostCardSlider.prototype = {
	initialize: function(handle, direction) {
		this.handle = $(handle);
		this.track = this.handle.parentNode;
		this.direction = direction;
		if(this.drag) {
			try {
				this.drag.destroy();
				this.drag = null;
			} catch(e) {}
		}
		if(this.direction == 'horizontal') {
			this.range = Element.getWidth(this.track);
			this.handle_range = Element.getWidth(this.handle);
		} else {
			this.range = Element.getHeight(this.track);
			this.handle_range = Element.getHeight(this.handle);
		}
		this.sliderRange = this.range - this.handle_range;
		// Element.setStyle(this.handle, {position: 'relative', top: this.sliderRange + 'px'});
		this.trackPosition = Position.cumulativeOffset(this.track);
		// this.trackPosition = Position.positionedOffset(this.track);
		this.drag = new Draggable(handle, {
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
				return [constrain(x, 0, parent_dimensions.width - element_dimensions.width), constrain(y, 0, parent_dimensions.height - element_dimensions.height)];
			},
			constraint: this.direction,
			handle: handle,
			zindex: 18,
			starteffect: false,
			endeffect: false,
			onStart: function() {
			}.bind(this),
			onDrag: function(event) {
				if(this.direction == 'horizontal') {
					var _v = parseInt(Element.getStyle(this.handle, 'left'));
				} else {
					var _v = this.sliderRange - parseInt(Element.getStyle(this.handle, 'top'));
				}
				var v = parseInt((_v+1)/this.sliderRange*postCard.params.frame);
				postCard.scrollImg(0, v);
			}.bind(this),
			onEnd: function() {
			}.bind(this)
		});
		this.handle_down = function(event) {
			this.handle.style.cursor = 'url("'+ MailConst.ALL +'/closedcursor.cur"), default';
		};
		this.handle_up = function() {
			this.handle.style.cursor = 'url("'+ MailConst.ALL +'/openedcursor.cur"), default';
		};
		Event.observe(this.track, 'mousedown', this.setHandlePos.bindAsEventListener(this));
		Event.observe(this.handle, 'mousedown', this.handle_down.bindAsEventListener(this));
		Event.observe(this.handle, 'mouseup', this.handle_up.bindAsEventListener(this));
	},
	// 返回鼠标点击时
	setHandlePos: function(event) {
		Event.stop(event);
		if (Event.isLeftClick(event)) {
			if(this.direction == 'horizontal') {
				Element.setStyle(this.handle, {left: this.getSliderOffset(event) + 'px'});
			} else {
				Element.setStyle(this.handle, {top: this.getSliderOffset(event) + 'px'});
			}
			postCard.scrollImg(0, this.getRateValue(event));
		}
	},
	// 提供给card接口调用的函数
	_setHandlePos: function(index) {
		var offset = parseInt(index * this.sliderRange / postCard.params.frame);
		if(this.direction == 'horizontal') {
			Element.setStyle(this.handle, {left: offset + 'px'});
		} else {
			Element.setStyle(this.handle, {top: this.sliderRange - offset + 'px'});
		}
	},
	// 返回放大缩小的比例
	getRateValue: function(event) {
		return this.direction == 'horizontal' ? parseInt(this.getSliderOffset(event) / this.sliderRange * postCard.params.frame) : parseInt((this.sliderRange - this.getSliderOffset(event)) / this.sliderRange * postCard.params.frame);
	},
	// 返回滑块距离滑动范围起点的距离
	getSliderOffset: function(event) {
		this.trackPosition = Position.cumulativeOffset(this.track);
		var offset = this.direction == 'horizontal' ? Event.pointerX(event) - this.trackPosition[0] + (this.handle_range / 2) : Event.pointerY(event) + $('sohuMailMain').scrollTop - this.trackPosition[1] - (this.handle_range / 2);
		offset = offset > this.sliderRange ? this.sliderRange : offset;
		offset = offset < 0 ? 0 : offset;
		return offset;
	},
	clear: function() {
		try {
			if(this.drag && this.drag != undefined) this.drag.destroy();
			if(typeof this.setHandlePos == 'function') Event.stopObserving(this.track, 'mousedown', this.setHandlePos.bindAsEventListener(this));
			if(typeof this.handle_down == 'function') Event.stopObserving(this.handle, 'mousedown', this.handle_down.bindAsEventListener(this));
			if(typeof this.handle_down == 'function') Event.stopObserving(this.handle, 'mouseup', this.handle_up.bindAsEventListener(this));
		} catch(e) {}
	}
};
// var postCardSlider = new PostCardSlider('slider_handle', 'horizontal');
