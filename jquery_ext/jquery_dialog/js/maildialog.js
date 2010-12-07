var MailDialog = Class.create();
MailDialog.prototype = {
  initialize: function() {
    this.shadow_layer = null;
    this.dialog = null;
    var self = this;
    $(window).bind('resize', function(event) {
      self.resizeLayer();
    });
  },
  createLayer: function() {
    if(this.shadow_layer) return this.shadow_layer;
    this.shadow_layer = document.createElement('div');
    $(this.shadow_layer).css({
      backgroundColor: '#000',
      opacity: 0.7,
      position: 'absolute',
      left: '0px',
      top: '0px',
      zIndex: 9998,
      width: this.getCoor().x + 'px',
      height: this.getCoor().y + 'px',
      display: 'none'
    });
    document.body.appendChild(this.shadow_layer);
    return this.shadow_layer;
  },
  showLayer: function() {
    this.shadow_layer = this.createLayer();
    $(this.shadow_layer).show();
  },
  hideLayer: function() {
    $(this.shadow_layer).hide();
  },
  resizeLayer: function() {
    if(!this.shadow_layer) return false;
    $(this.shadow_layer).css({
      width: this.getCoor().x + 'px',
      height: this.getCoor().y + 'px'
    });
  },
  getCoor: function() {
    var d = $(document.body);
    return {
      x: d.outerWidth(),
      y: d.outerHeight()
    };
  },
  createDialog: function() {
    if(this.dialog) return this.dialog.firstChild;
    this.dialog = document.createElement('div');
    $(this.dialog).css({
      position: 'absolute',
      zIndex: 10000,
      fontFamily: 'Arial,Helvetica,sans-serif',
      fontSize: '12px',
      width: '300px',
      height: 'auto',
      top: (this.getCoor().y - 120) / 2 + 'px',
      left: (this.getCoor().x - 300) / 2 + 'px',
      display: 'none'
    });
    var _alert = ['<div class="dialog_box menu-box-shadow">',
            '<div class="amv title"><div class="title_con"></div>',
            '</div>',
            '<div style="width:98%;height:auto;"></div>',
            '</div>',
            '<iframe src="javascript:;document.open();document.write(\'<html><head><\/head><body><\/body><\/html>\');document.close();" style="background:transparent;width:100%;height:100%;position:absolute;z-index:9998;top:0px;left:0px;overflow:hidden;border:0px;" frameborder=0></iframe>'].join('');
    this.dialog.innerHTML = _alert;
    this.content = this.dialog.getElementsByTagName('div')[0].childNodes[1];
    document.body.appendChild(this.dialog);
    var self = this;
    try {
      $(function($){
        var db = $(document.body);
        $(self.dialog).drag('start', function(ev, dd) {
          dd.limit = db.offset();
          dd.limit.bottom = dd.limit.top + db.outerHeight() - $(this).outerHeight();
          dd.limit.right = dd.limit.left + db.outerWidth() - $(this).outerWidth();
        }).drag(function(ev, dd){
          $(this).css({
            top: Math.min(dd.limit.bottom, Math.max(dd.limit.top, dd.offsetY)),
            left: Math.min(dd.limit.right, Math.max(dd.limit.left, dd.offsetX))
          });
        });
      });
    } catch(e) {}
    return this.dialog.firstChild;
  },
  showDialog: function() {
    $(this.dialog).show();
  },
  hideDialog: function() {
    $(this.dialog).hide();
  },
  alert: function() {
    var defaults = {
      title: '系统提示：',
      info: '这是当前的系统提示信息...... ',
      click: function(event) {}
    };
    var options = $.extend(defaults, arguments[0] || { });
    var dlg = this.createDialog();
    dlg.firstChild.firstChild.innerHTML = options.title;
    var content = '<div><div class="alert_content"><div class="ico"><span class="am alert_icon"></span></div><div class="con">'+ options.info +'</div></div><div class="alert_button"><input type="button" value=" 确　定 " /></div></div>';
    this.content.innerHTML = content;
    var _input = this.content.getElementsByTagName('input')[0],
        self = this;
    $(_input).bind('click', function(event) {
      options.click(event);
      self.close();
    });
    this.showLayer();
    this.showDialog();
    var _t = setTimeout(function() {
      clearTimeout(_t);
      _t = null;
      _input.focus();
    }, 100);
  },
  confirm: function() {
    var defaults = {
      title: '系统提示：',
      info: '您确定要关闭当前的对话框吗？',
      confirm: '确　定',
      cancel: '取　消',
      click: function(event) {},
      cancelclick: function(event) {}
    };
    var options = $.extend(defaults, arguments[0] || { });
    var dlg = this.createDialog();
    dlg.firstChild.firstChild.innerHTML = options.title;
    var content = '<div><div class="alert_content"><div class="ico"><span class="am confirm_icon"></span></div><div class="con">'+ options.info +'</div></div><div class="confirm_button"><input type="button" value=" '+ options.confirm +' " /><input type="button" value=" '+ options.cancel +' " /></div></div>';
    this.content.innerHTML = content;
    var _input0 = dlg.getElementsByTagName('input')[0],
        _input1 = dlg.getElementsByTagName('input')[1],
        self = this;
    $(_input0).bind('click', function(event) {
      options.click(event);
      self.close();
    });
    $(_input1).bind('click', function(event){
      options.cancelclick(event);
      self.close();
    });
    this.showLayer();
    this.showDialog();
    var _t = setTimeout(function() {
      clearTimeout(_t);
      _t = null;
      _input0.focus();
    }, 100);
  },
  prompt: function() {
    var defaults = {
      title: '系统提示：',
      info: '脚本提示',
      prompt: 'test',
      click: function(value, event) {},
      cancelclick: function(value, event) {}
    };
    var options = $.extend(defaults, arguments[0] || { });
    var dlg = this.createDialog();
    dlg.firstChild.firstChild.innerHTML = options.title;
    var content = '<div><div class="alert_content"><div class="ico"><span class="am prompt_icon"></span></div><div class="con" style="margin:4px auto 8px;">'+ options.info +'<br /><input type="input" value="'+ options.prompt +'" /></div></div><div style="text-align: center;clear:both;"><input type="button" style="height: 25px; width: 80px; text-align: center;margin:0px 12px;" value=" 确　定 " /><input type="button" style="height: 25px; width: 80px; text-align: center;margin:0px 12px;" value=" 取　消 " /></div></div>';
    this.content.innerHTML = content;
    var inputs = dlg.getElementsByTagName('input'),
        _input0 = inputs[0],
        _input1 = inputs[1],
        _input2 = inputs[2],
        self = this;
    $(_input1).bind('click', function(event) {
      var _value = _input0.value;
      options.click(_value, event);
      self.close();
    });
    $(_input2).bind('click', function(event) {
      var _value = _input0.value;
      options.cancelclick(_value, event);
      self.close();
    });
    this.showLayer();
    this.showDialog();
    var _t = setTimeout(function() {
      clearTimeout(_t);
      _t = null;
      _input0.focus();
    }, 100);
  },
  close: function() {
    try {
      this.hideLayer();
      this.hideDialog();
      this.content.innerHTML = '';
    } catch(e) {}
  }
};
var mailDialog = new MailDialog();
