/*
 * 参数类型
 * [
 *    {
 *      name: '', 
 *      click: function() {},
 *      child: [
 *        {
 *          name: '',
 *          click: function() {}
 *        },
 *        {
 *          name: '',
 *          click: function() {}
 *        }
 *      ]
 *    },
 *    {
 *      name: '',
 *      click: function() {}
 *    }
 * ]
 */
var MailMenu = Class.create();
MailMenu.prototype = {
  initialize: function() {
    this.menu = '';
    this.child = '';
    this.cachelist = {};
    this.flag = false;
    this.frameflag = {};
  },
  /*
   * {
   *    menuid: menu_id,
   *    data: []
   * }
   */
  init: function() {
    var arg = arguments;
    if(!arg[0] || this.cachelist[arg[0]]) return this;
    try {
      var childs = [];
      var cm = document.createElement('div');
      cm.className = 'menu-box';
      cm.innerHTML = this.createMenu(arguments[0], arguments[1]);
      var data = arguments[1], sf = arguments.callee, self = this;
      $(cm.firstChild.childNodes).each(function(index) {
        if(data[index]['child']) {
          childs.push(index);
        }
        $(this).bind('click', function(e) {
          var exec = data[index]['click'];
          if(exec && typeof exec === 'function') {
            exec(e);
          }
        }).bind('mouseover', function(e) {
          $(this).addClass('item-over');
        }).bind('mouseout', function(e) {
          $(this).removeClass('item-over');
        });
      });
      var e1 = arg[0], e2 = arg[2], e3 = arg[3], e4 = arg[4], e = $('#' + e1);
      var check_pos = function() {
        var ecoor_x = e.outerWidth(),
            ecoor_y = e.outerHeight(),
            ccoor_x = $(cm).outerWidth(),
            ccoor_y = $(cm).outerHeight(),
            epos_x  = e.offset().left,
            epos_y  = e.offset().top,
            coor    = e2,
            t = '',
            l = '',
            dcoor_x = $(document.body).outerWidth(),
            dcoor_y = $(document.body).outerHeight(),
            frames = cm.childNodes[1];
        if(frames && !self.frameflag[e1]) {
          self.frameflag[e1] = true;
          $(frames).css({
            width: ccoor_x + 'px',
            height: ccoor_y + 'px'
          });
        }
        if(coor == 'h') {
          if((ecoor_x + epos_x + ccoor_x) > dcoor_x) {
            l = epos_x - ccoor_x + 'px';
          } else {
            l = ecoor_x + epos_x + 'px';
          }
          if((epos_y + ccoor_y) > dcoor_y) {
            t = epos_y + ecoor_y - ccoor_y + 'px';
          } else {
            t = epos_y + 'px';
          }
        } else {
          if((ccoor_x + epos_x) > dcoor_x) {
            l = epos_x + ecoor_x - ccoor_x + 'px';
          } else {
            l = epos_x + 'px';
          }
          if((epos_y + ecoor_y + ccoor_y) > dcoor_y) {
            t = epos_y - ccoor_y + 'px';
          } else {
            t = ecoor_y + epos_y + 'px';
          }
        }
        return {
          t: t,
          l: l
        };
      };
      document.body.appendChild(cm);
      var mfns = function(e) {
        self.flag = true;
        if(e4 && self.cachelist[e4 + '_child']) {
          $.each(self.cachelist[e4 + '_child'], function(index, item) {
            $(item).hide();
          });
        }
        $(cm).show();
        var pos = check_pos();
        $(cm).css({
          top: pos.t,
          left: pos.l
        });    
      }, mfnh = function(e) {
        self.flag = false;
        var t = setTimeout(function() {
          if(self.flag) return false;
          for(var key in self.cachelist) {
            $(self.cachelist[key]).hide();
          }
        }, 800);
      };
      e.bind('mouseover', mfns).bind('mouseout', mfnh);
      $(cm).bind('mouseover', mfns).bind('mouseout', mfnh);
      if(e4) {
        if(!this.cachelist[e4 + '_child']) this.cachelist[e4 + '_child'] = [];
        this.cachelist[e4 + '_child'].push(cm);
      } else {
        this.cachelist[arg[0]] = cm;
      }
      $.each(childs, function(index, item) {
        var _c = arg[0] + '_child_' + item;
        sf.call(self, _c, data[item]['child'], 'h', cm, arg[0]);
      })
    } catch(e) {}
    return this;
  },
  createMenu: function(id, data) {
    var html = ['<div class="data-layer">'];
    (function(data) {
      $.each(data, function(index, item) {
        var _c = '', _a = '';
        if(item.child && $.isArray(item.child)) {
          _c = ' id="'+ id +'_child_'+ index +'"';
        }
        html.push('<div'+ _c +' class="item"><div class="item-txt"> '+ item.name +' </div></div>');
      });
    })(data);
    html.push('</div><iframe src="javascript:;document.open();document.write(\'<html><head><\/head><body><\/body><\/html>\');document.close();" class="frame-layer" frameborder=0></iframe>');
    return html.join('');
  }
};
var mailMenu = new MailMenu();

/*
 * 测试数据，支持无限级的菜单
 * [                         // Array
 *    {                      // Object
 *      name: '已读邮件',    //  String(支持传入HTML)
 *      click: function(e) { // 点击菜单元素响应的事件
 *        // do something...
 *      }
 *    }
 * ] 
 */
var datalist = [
    {name: '已读邮件', click: function(event) {alert('已读邮件');}},
    {name: '<span style="float:left;">未读邮件 </span><span class="item-arrow"></span>', click: function(event) {alert('未读邮件');}, 
     child: [
        {name: '<span class="flag-item flag1"></span>', click: function(e) {alert('绿色')}},
        {name: '<span class="flag-item flag2"></span>', click: function(e) {alert('橙色')}},
        {name: '<span class="flag-item flag3"></span>', click: function(e) {alert('蓝色')}},
        {name: '<span class="flag-item flag4"></span>', click: function(e) {alert('粉色')}},
        {name: '<span class="flag-item flag5"></span>', click: function(e) {alert('青色')}},
        {name: '<span class="flag-item flag6"></span>', click: function(e) {alert('黄色')}},
        {name: '<span class="flag-item flag7"></span>', click: function(e) {alert('紫色')}},
        {name: '<span class="flag-item flag8"></span>', click: function(e) {alert('灰色')}}
     ]},
    {name: '<span style="float:left;">待办邮件 </span><span class="item-arrow"></span>', click: function(event) {alert('待办邮件');},
     child: [
        {name: 'test6', click: function(e) {alert('test6')}},
        {name: 'test7', click: function(e) {alert('test7')}}
     ]}
  ];
$(document).ready(function($) {
  mailMenu.init('menu_1', datalist);
  mailMenu.init('menu_2', datalist);
  mailMenu.init('menu_3', datalist);
  mailMenu.init('menu_4', datalist);
});
