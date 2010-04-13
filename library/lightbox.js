var LightBox = Class.create();
LightBox.prototype = {
	initialize: function() {
		this.scr = _dialog.getDimensions();
	},
	show: function() {
		if(!this.shadow || !this.content) {
			this.initElement();
		}
		var defaults = {
			html: '<div style="margin:0 auto;width:570px;background-color:white;height:330px;">'
			+'<div style="width:100%;height:300px;overflow-y:auto;">'
			+'<table><tbody><tr><td></td><td></td></tr></tbody></table>'
			+'</div>'
			+'<div class="closebt" style="width:100%;height:30px;"><div style="float:right;width:40px;cursor:pointer;"><img style="border:none;" src="'+ MailConst.ALL +'/close.gif" /></div></div>'
			+'</div>'
    	};
 	    var options = Object.extend(defaults, arguments[0] || { });
		this.content.innerHTML = options.html;
		var close_bt = $(this.content).getElementsByClassName('closebt')[0];
		if(close_bt) {
			Event.observe(close_bt, 'click', function(event) {
				Event.stopObserving(close_bt, 'click');
				var d1 = new Effect.Opacity(
   					this.shadow, { 
      					from: 0.8, 
      					to: 0.0,
      					duration: 0.5
   					}
				);
				var d2 = new Effect.Opacity(
   					this.content, { 
      					from: 1.0, 
      					to: 0.0,
      					duration: 0.5
   					}
				);
				// scriptaculous.js库尽然没有提供执行动画结束之后的callback, shit..........
				// 目前先用个土鳖的办法处理了吧。。。
				setTimeout(function() {
					Element.hide(this.shadow);
					Element.hide(this.content);
					d1 = d2 = null;
				}.bind(this), 800);
			}.bind(this));
		}
		Element.show(this.shadow);
		Element.show(this.content);
		new Effect.Opacity(
   			this.shadow, { 
      			from: 0.0, 
      			to: 0.8,
      			duration: 0.5
   			}
		);
		new Effect.Opacity(
   			this.content, { 
      			from: 0.0, 
      			to: 1.0,
      			duration: 0.5
   			}
		);
	},
	initElement: function() {
		this.shadow = document.createElement('div');
		this.content = document.createElement('div');
		Element.setStyle(this.shadow, {
			width:'100%',
			height:this.scr.height + 'px',
			position: 'absolute',
			zIndex: 9999990,
			display:'none',
			backgroundColor:'#000000',
			left:'0px',
			top:'0px',
			opacity:0
		});
		Element.setStyle(this.content, {
			width:'100%',
			height:'auto',
			top:'30px',
			position:'absolute',
			zIndex:9999991,
			display:'none',
			opacity:0
		});
		document.body.appendChild(this.shadow);
		document.body.appendChild(this.content);
	}
};
var lightBox = new LightBox();
