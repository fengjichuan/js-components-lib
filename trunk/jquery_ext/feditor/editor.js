/*
 * 所见即所得编辑器相关代码
 * author: fengjichuan
 * date: 2010-11-09
 * 以jquery扩展的形式存在
 */

(function(w, arg, $) {
  // 判断浏览器类别（ie和非ie浏览器采用两种不同的机制）
  var ie = (function() {
    var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');
    while (
      div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
      all[0]
    );
    return v > 4 ? v: undef;
  })();
  // 判断是否gecko内核浏览器
  var gecko = (function() {
    var ua = navigator.userAgent;
    return ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1;
  })();
  
  var domain = arg.domain ? 'document.domain=\'' + arg.domain + '\';' : '',       // 编辑器的iframe编辑框是否涉及跨域
      _random = +new Date(),
      editorIfr = '<iframe style="height:100%;width:100%;border:0px;margin:0px;padding:0px;background-color:#FFFFFF;" frameborder=0 src="javascript:document.open();'+ domain +'document.write(\'<html><head><style>body{background-color:#fff;font-size:14px;font-family:courier,verdana,宋体;margin:0px;padding:0px 4px;height:100%;line-height:1.6;cursor:text;}pre {white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word;}p{margin:0px;}<\/style><\/head><body><\/body><\/html>\');document.close();function setEditor(){try{if(!parent||!parent[\'feditor\']||!parent[\'feditor\'][\'editor\']){setTimeout(arguments.callee,200);return false;}else{parent.feditor.editor.ifronload();}}catch(e){}}setEditor();var _random='+ _random +';"></iframe>',
      htmlEditor = null  // 编辑器的iframe对象
  // 编辑器的功能类
  var editor = (function() {
    var editor = {
      // 编辑器元素
      area: null,
      // 编辑器工具栏元素
      toolbar: null,
      // 初始化编辑器的iframe
      initIfr: function() {
        this.area = $('#' + arg.area)[0];
        this.area.innerHTML = editorIfr;
        htmlEditor = this.area.firstChild;
        /*
        var self = this,
            t = setTimeout(function() {
          if(!self.isedit) {
            self.ifronload();
            clearTimeout(t);
            t = null;
          }
        }, 1000);
        */
        var self = this;
        $(this.doc().body).bind('mousedown', function() {
          if(!self.isedit) self.ifronload();
        });
      },
      // 是否处于可编辑状态
      isedit: false,
      // 如果初始化的时候有内容
      initcontent: '',
      
      // 编辑器所在块的元素对象
      editParent: $('.right-cont'),
      
      // 光标对应的button状态
      buttonActive: [
        {name: 'Bold', tags: ['B', 'STRONG'], css: {'font-weight': 'bold'}},
        {name: 'Italic', tags: ['EM', 'I'], css: {'font-style': 'italic'}},
        {name: 'Underline', tags: ['U'], css: {'text-decoration': 'underline'}},
        {name: 'justifyLeft', css: {'text-align': 'left'}, attr: {'align': 'left'}},
        {name: 'justifyCenter', css: {'text-align': 'center'}, attr: {'align': 'center'}},
        {name: 'justifyRight', css: {'text-align': 'right'}, attr: {'align': 'right'}},
        {name: 'insertOrderedList', tags: ['OL']},
        {name: 'insertUnorderedList', tags: ['UL']}
      ],
      
      ___flag: false,
      // 检查光标所在位置的样式
      checkNodes : function(e) {
        var elm = e,
            self = this,
            ck = function(e, cb) {
              var curt = [];
              $.each(self.buttonActive, function(index, item) {
                var c = cb(item, elm);
                if(c.length > 0) curt = curt.concat(c);
              });
              return curt;
            };
        var style = [];
        while(elm.nodeName != 'BODY'){
          var tg = ck(elm, function(item, elm) {
            var curt = [];
            if(item.tags && $.inArray(elm.nodeName, item.tags) > -1) {
              curt.push(item.name);
            }
            return curt;
          });
          if(tg.length > 0) {
            style = style.concat(tg);
          }
          elm = elm.parentNode;
        };
        
        elm = $(e)[0];
        while(elm.nodeType == 3) {
          elm = elm.parentNode;
        }
        var css = ck(elm, function(item, elm) {
          var curt = [];
          if(item.css) {
            for(var key in item.css) {
              if($(elm).css(key) == item.css[key]) {
                curt.push(item.name);
              }
            }
          }
          return curt;
        });
        if(css.length > 0) {
          style = style.concat(css);
        }
        var attr = ck(elm, function(item, elm) {
          var curt = [];
          if(item.attr) {
            for(var key in item.attr) {
              if(elm.getAttribute(key) == item.attr[key]) {
                curt.push(item.name);
              }
            }
          }
          return curt;
        });
        if(attr.length > 0) {
          style = style.concat(attr);
        }
        return style;
      },
      // 检查选中区域的样式
      // els: 选中区域的dom元素
      checkSelected: function(els) {
        var style = [],
            self = this,
            ck = function(el) {
              $.each(self.buttonActive, function(index, item) {
                if(item['tags'] && $.inArray(el.nodeName, item['tags']) > -1) {
                  style.push(item.name);
                }
                if(item['css']) {
                  for(var key in item['css']) {
                    if($(el).css(key) == item['css'][key]) style.push(item.name);
                  }
                }
                if(item['attr']) {
                  for(var key in item['attr']) {
                    if(el.getAttribute(key) == item['attr'][key]) style.push(item.name);
                  }
                }
              });
              return style;
            };
        try {
          var nds = els.getElementsByTagName('*');
          if(!nds) return [];
        } catch(e) {
          return [];
        }
        $(nds).each(function(index, item) {
          if(item.nodeType != 1) return;
          ck(item);
        });
        return style;
      },
      
      // iframe载入完成之后将其设置为可编辑状态
      ifronload: function(){
        try {
          var ifrd = htmlEditor.contentWindow.document;
          if(!ifrd || !ifrd.body || ifrd.body.nodeType != 1) {
            setTimeout(argument.callee.call(this), 500);
            return;
          }
        } catch(e) {
          setTimeout(argument.callee.call(this), 500);
          return;
        }
        if (ie){
            try{
                ifrd.body.contentEditable = true;
            } catch(e){}
        } else{
            try{
                ifrd.designMode = 'on';
                ifrd.execCommand('useCSS', false, false);
            } catch(e){}
        }
        this.isedit = true;
        // 初始化的时候向编辑器里面加入内容
        try {
          if(this.initcontent) {
            // gecko bug
            // 参考： http://qooxdoo.org/contrib/project/htmlarea/browser_bugs
            var _c = gecko ? this.initcontent + ' <br _moz_dirty="" />' : this.initcontent;
            this.setContent(_c);
            this.initcontent = '';
          }
        } catch(e) {}
        this.selectionBookmark = null;
        // IE记录光标的事件
        try {
          
          var self = this,
              csss = [];
          
          $(this.doc().body).bind('mousedown', function(e) {
            e = e || window.event;
            var t = e.target || e.srcElement;
            csss = self.checkNodes(t);
          });
          
          $(this.doc().body).bind('mouseup', function(e) {
            e = e || window.event;
            var t = e.target || e.srcElement,
                sty = self.checkNodes(t);
            csss = csss.concat(sty);
            self.setActiveStyle(csss);
          });
          
          
          if(ie) {
            
            var win = this.win(),
                doc = this.doc(),
                self = this;
            /*
            $(win).bind('focus', function() {
              if(!self.selectionBookmark) return false;
              w.getSelection().removeAllRanges();
              w.getSelection().addRange(self.selectionBookmark);
            }).bind('blur', function() {
              var selection = window.getSelection();
              if (selection.rangeCount > 0) {
                self.selectionBookmark = selection.getRangeAt(0);
              }
            });
            */
            
            /*
            $(doc).bind('beforedeactivate', function(event) {
              try {
                if(!self.__focus_flag) return;
                var range = doc.selection.createRange();
                self.selectionBookmark = range.getBookmark();
              } catch(e) {}
            }).bind('activate', function(event) {
              try {
                if(!self.__focus_flag) return;
                if (self.selectionBookmark) {
                  var range = doc.body.createTextRange();
                  range.moveToBookmark(self.selectionBookmark);
                  range.collapse();
                  range.select();
                }
              } catch(e) {}
            });
            */
            
            
            (function() {
              var input = document.createElement('input');
              input.style.cssText = 'position:absolute;left:-10000px;top:-1000px;';
              document.body.appendChild(input);
              /*
              document.body.onmousedown = function() {
                if(self.___flag) {
                  return false;
                }
                
              };
              */
              
              
              var t= setInterval(function() {
                if(!$('#' + arg.area)[0]) {
                  try {
                    input.focus();
                  } catch(e) {}
                  clearInterval(t);
                  t = null;
                }
              }, 100);
              
              
            })();
            
          }
        } catch(e) {
          // alert(e.description);
        }
      },
      
      format: function(type, para){
        try {
          var ifrd = htmlEditor.contentWindow.document;
          ! para ? (ie ? ifrd.execCommand(type) : ifrd.execCommand(type, false, false)) : ifrd.execCommand(type, false, para);
          this.setFocus();
        } catch(e) {}
      },
      
      // 编辑器中显示层的元素对象
      layers: {
        fontname: null,
        fontsize: null,
        forecolor: null,
        backcolor: null,
        face: null,
        insertimage: null,
        insertlink: null
      },
      hidels: function() {
        for(var key in this.layers){
          try {
            if(this.layers[key]) $(this.layers[key]).hide();
          } catch(e) {}
        }
      },
      isbdlayer: false,
      // 注册控制层隐藏的事件
      hideLayers: function() {
        if(this.isbdlayer) return false;
        this.isbdlayer = true;
        var self = this;
        $(document.body).bind('click', function(e) {
          self.hidels();
        });
        $(htmlEditor.contentWindow.document.body).bind('click', function(e) {
          self.hidels();
        });
      },
      
      setFlag: function(e) {
        var self = this;
        $(e).bind('mousedown', function(e) {
          self.___flag = true;
        }).bind('mouseup', function(e) {
          self.___flag = false;
        });
      },
      
      // 创建显示字体风格的层
      createFontName: function(e) {
        if(!this.layers.fontname) {
          var pos = this.getPos(e),
              div = document.createElement('div');
          div.style.cssText = 'position:absolute;z-index:100009;width:150px;height:240px;overflow-x:hidden;overflow-y:auto;background-color:white;border:1px solid #838383;top:'+ pos.top +'px;left:'+ pos.left +'px;display:none;';
          var fontface = ['宋体', '黑体', '楷体', '隶书', '仿宋体', '幼圆', 'Arial', 'Arial Black', 'Arial Narrow', 'Century Gothic', 'Comic Sans MS', 'Courier New', 'MS Sans Serif', 'Script', 'Verdana', 'Times New Roman', 'WingDings'];
          var a = [];
          $.each(fontface, function(index, item) {
            a.push('<a href="javascript:;" hidefocus="true" onmouseover="this.style.backgroundColor=\'#E5E5E5\';" onmouseout="this.style.backgroundColor=\'\';" onclick="feditor.editor.format(\'fontname\', \''+ item +'\');return false;" style="font:normal 12px ' + item + ';color:black;display:block;height:16px;line-height:16px;padding:2px;text-decoration:none;">' + item + '</a>');
          });
          div.innerHTML = a.join('');
          // this.toolbar.appendChild(div);
          this.editParent[0].appendChild(div);
          this.layers.fontname = div;
          this.hideLayers();
          this.setFlag(div);
        }
        $(this.layers.fontname).show();
      },
      
      // 创建显示字体大小的层
      createFontSize: function(e) {
        if(!this.layers.fontsize) {
          var pos = this.getPos(e),
              div = document.createElement('div');
          div.style.cssText = 'position:absolute;z-index:100008;width:120px;height:auto;background-color:white;border:1px solid #838383;top:'+ pos.top +'px;left:'+ pos.left +'px;display:none;';
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
            }
          ];
          var a = [];
          $.each(fontsize, function(index, item) {
            a.push('<a href="javascript:;" hidefocus="true" onmouseover="this.style.backgroundColor=\'#E5E5E5\';" onmouseout="this.style.backgroundColor=\'\';" onclick="feditor.editor.format(\'fontsize\', \''+ item.font +'\');return false;" style="font-size:'+ item.size +';color:black;display:block;line-height:120%;padding:2px;text-decoration:none;">' + item.name + '</a>');
          });
          div.innerHTML = a.join('');
          // this.toolbar.appendChild(div);
          this.editParent[0].appendChild(div);
          this.layers.fontsize = div;
          this.hideLayers();
          this.setFlag(div);
        }
        $(this.layers.fontsize).show();
      },
      
      // 创建字体颜色，背景颜色层
      // pos: {top:0px, left:0px}
      createColor: function(pos, format) {
        try {
          var div = document.createElement('div');
          div.style.cssText = 'position:absolute;z-index:100010;width:auto;height:auto;background-color:white;border:1px solid #838383;top:'+ pos.top +';left:'+ pos.left +';display:none;';
          var color = [['#000000', '#993300', '#333300', '#003300', '#003366', '#000080', '#333399', '#333333'], ['#800000', '#FF6600', '#808000', '#008000', '#008080', '#0000FF', '#666699', '#808080'], ['#FF0000', '#FF9900', '#99CC00', '#339966', '#33CCCC', '#3366FF', '#800080', '#999999'], ['#FF00FF', '#FFCC00', '#FFFF00', '#00FF00', '#00FFFF', '#00CCFF', '#993366', '#C0C0C0'], ['#FF99CC', '#FFCC99', '#FFFF99', '#CCFFCC', '#CCFFFF', '#99CCFF', '#CC99FF', '#FFFFFF']];
          var r = color.length;
          var c = color[0].length;
          var tr = [];
          $.each(color, function(index, item) {
            var td = [];
            $.each(item, function(index, _item) {
              td.push('<td style="padding:2px;"><a hidefocus="true" href="javascript:;" colorattr="'+ _item +'"><div onclick="feditor.editor.format(\''+ format +'\', \''+ _item +'\');return false;" style="font-size:0;width:11px;height:11px;background:' + _item + ';border:1px solid #808080;cursor:pointer;"></div></a></td>');
            });
            tr.push('<tr>' + td.join("") + '</tr>');
          });
          div.innerHTML = '<table><tbody>' + tr.join('') + '</tbody></table>';
          return div;
        } catch(e) {}
      },
      
      // 创建显示字体颜色的层
      createForeColor: function(e) {
        if(!this.layers.forecolor) {
          var pos = this.getPos(e),
              div = this.createColor({top: pos.top + 'px', left: pos.left + 'px'}, 'forecolor');
          // this.toolbar.appendChild(div);
          this.editParent[0].appendChild(div);
          this.layers.forecolor = div;
          this.hideLayers();
          this.setFlag(div);
        }
        $(this.layers.forecolor).show();
      },
      
      // 创建背景颜色的层
      createBackColor: function(e) {
        if(!this.layers.backcolor) {
          var _f = '';
          if(gecko) {
            _f = 'hiliteColor';
          } else {
            _f = 'backcolor';
          }
          var pos = this.getPos(e),
              div = this.createColor({top: pos.top + 'px', left: pos.left + 'px'}, _f);
          // this.toolbar.appendChild(div);
          this.editParent[0].appendChild(div);
          this.layers.backcolor = div;
          this.hideLayers();
          this.setFlag(div);
        }
        $(this.layers.backcolor).show();
      },
      
      // 创建显示表情的层
      createFace: function(e) {
        if(!this.layers.face) {
          var div = document.createElement('div'),
              pos = this.getPos(e);
          div.style.cssText = 'position:absolute;z-index:100010;width:auto;height:auto;background-color:white;border:1px solid #838383;top:'+ pos.top +'px;left:'+ pos.left +'px;display:none;';
          var face = [
            [{name: 'cool', title: '冷酷'}, {name: 'cry', title: '哭泣'}, {name: 'embarassed', title: '尴尬'}, {name: 'foot-in-mouth', title: '咧嘴'}],
            [{name: 'frown', title: '皱眉'}, {name: 'innocent', title: '天真'}, {name: 'kiss', title: '吻'}, {name: 'laughing', title: '大笑'}],
            [{name: 'money-mouth', title: '发财'}, {name: 'sealed', title: '保密'}, {name: 'smile', title: '微笑'}, {name: 'surprised', title: '惊吓'}],
            [{name: 'tongue-out', title: '吐舌头'}, {name: 'undecided', title: '思考'}, {name: 'wink', title: '眨眼'}, {name: 'yell', title: '叫嚷'}]
          ];
          var r = face.length;
          var c = face[0].length;
          var tr = [];
          $.each(face, function(index, item) {
            var td = [];
            $.each(item, function(index, _item) {
              td.push('<td style="padding:2px;"><a href="javascript:;" onclick="feditor.editor.setFocus();feditor.editor.format(\'insertimage\', \'images/face/smiley-'+ _item.name +'.gif\');return false;"><img src="images/face/smiley-'+ _item.name +'.gif" title="'+ _item.title +'" style="width:18px;height:18px;border:0;margin:4px;" /></a></td>');
            });
            tr.push('<tr>' + td.join("") + '</tr>');
          });
          div.innerHTML = '<table><tbody>' + tr.join('') + '</tbody></table>';
          // this.toolbar.appendChild(div);
          this.editParent[0].appendChild(div);
          this.layers.face = div;
          this.hideLayers();
          this.setFlag(div);
        }
        
        $(this.layers.face).show();
      },
      
      // 添加图片的层
      createLk: function(pos, callback) {
        try {
          var div = document.createElement('div');
          div.style.cssText = 'font-size:12px;position:absolute;z-index:100010;width:auto;height:auto;background-color:white;border:1px solid #838383;top:'+ pos.top +';left:'+ pos.left +';display:none;';
          div.innerHTML = '<div style="margin:4px 6px;">'
                         +'<div style="margin:2px auto;display:none;"><span>文字：</span><span><input style="height:16px;color:#aaa;" type="text" init="true" value="默认使用链接名字" /></span></div>'
                         +'<div style="margin:2px auto;"><span>链接：</span><span><input style="height:16px;" type="text" value="" /></span></div>'
                         +'<div style="margin:2px auto;text-align:right;"><input style="width:60px;margin-left:4px;" type="button" value="添加" /><input style="width:60px;margin-left:4px;" type="button" value="取消" /></div>'
                         +'</div>';
          var self = this;
          $(div).bind('click', function(e) {
            self.eventStop(e);
          });
          var _inputs = div.getElementsByTagName('input'),
              _callback = function(e) {
                self.setFocus();
                callback();
                self.hidels();
              };
          $(_inputs[3]).bind('click', function(e) {
            self.hidels();
          });
          $(_inputs[2]).bind('click', _callback);
          $(_inputs[1]).bind('keydown', function(e) {
            e = e || window.event;
            if(e.keyCode == 13) {
              _callback();
            }
          });
          $(_inputs[0]).bind('focus', function(e) {
            if(this.getAttribute('init') == 'true') {
              this.value = '';
              this.removeAttribute('init');
              this.style.color = '#000';
            }
          }).bind('keydown', function(e) {
            e = e || window.event;
            if(e.keyCode == 13) {
              _callback(e);
            }
          });
          return div;
        } catch(e) {}
      },
      
      // 添加图片
      createImageLink: function(e){
        if(!this.layers.insertimage) {
          var self = this,
              pos = this.getPos(e),
              div = this.layers.insertimage = this.createLk({top: pos.top + 'px', left: pos.left + 'px'}, function() {
                var inputs = self.layers.insertimage.getElementsByTagName('input'),
                    v2 = inputs[1],
                    _v2 = $.trim(v2.value), _h = 'http://', _hs = 'https://';
                if(_v2 == '') _v2 = _h;
                if(_v2.indexOf(_h) != 0 && _v2.indexOf(_hs) != 0) _v2 = _h + _v2;
                self.format('insertimage', _v2);
                try {
                  var _t = setTimeout(function() {
                    clearTimeout(_t);
                    _t = null;
                    v2.value = '';
                  }, 200);
                } catch(e) {}
              });
              
          this.editParent[0].appendChild(div);
          // this.toolbar.appendChild(div);
          this.hideLayers();
        }
        $(this.layers.insertimage).show();
        try {
          var self = this;
          setTimeout(function() {
            self.layers.insertimage.getElementsByTagName('input')[1].focus();
          }, 500);
        } catch(e) {}
      },
      // 创建超链接
      createLink: function(e){
        var sc = this.getSelCon(),
            self = this,
            pos = this.getPos(e),
            callback = function() {
              // self.setFocus();
              var inputs = self.layers.insertlink.getElementsByTagName('input'),
                  v1 = inputs[0],
                  v2 = inputs[1];
              var _v1 = v1.value, _v2 = $.trim(v2.value), _h = 'http://', _hs = 'https://';
              if(_v2 == '') _v2 = _h;
              if(_v2.indexOf(_h) != 0 && _v2.indexOf(_hs) != 0) _v2 = _h + _v2;
              if(self.getSelCon() == '') {
                var _v = (_v1 != '' && !v1.getAttribute('init')) ? _v1 : _v2;
                self.insertHtml('<a href="'+ _v2 +'">'+ _v +'</a>');
              } else {
                self.format('createlink', _v2);
              }
              try {
                var _t = setTimeout(function() {
                  clearTimeout(_t);
                  _t = null;
                  v1.value = '';
                  v2.value = '';
                  self.__focus_flag = false;
                }, 200);
              } catch(e) {}
            };
        // console.log(pos);
        if(!this.layers.insertlink) {
          var div = this.layers.insertlink = this.createLk({top: pos.top + 'px', left: pos.left + 'px'}, callback);
          // this.toolbar.appendChild(div);
          this.editParent[0].appendChild(div);
          this.hideLayers();
        }
        var _fd = this.layers.insertlink.firstChild.firstChild;
        if(sc == '') {
          $(_fd).show();
        } else {
          $(_fd).hide();
        }
        $(this.layers.insertlink).show();
        try {
          this.__focus_flag = true;
          setTimeout(function() {
            self.layers.insertlink.getElementsByTagName('input')[1].focus();
          }, 500);
        } catch(e) {}
      },
      // 获取当前操作元素的坐标
      getPos: function(e) {
        var target = e.target || e.srcElement,
            self = this,
            pos = (function() {
              var t = $(target),
                  x = t.offset().left - self.editParent.offset().left,
                  y = t.offset().top - self.editParent.offset().top + self.editParent[0].scrollTop + t.height();
              return {
                top: y + 2,
                left: x
              };
            })();
        return pos;
      },
      // 编辑器视图窗口
      win: function() {
        return htmlEditor.contentWindow;
      },
      // 编辑器文档
      doc: function() {
        return this.win().document;
      },
      
      // 获取编辑器中的内容
      getContent: function(){
          return this.doc().body.innerHTML.replace(/&quot;/ig, '');
      },
      // 设置编辑器中的内容
      setContent: function(content){
        if(!this.isedit) {
          this.initcontent = content;
          return false;
        }
        this.doc().body.innerHTML = content;
      },
      
      // 设置编辑器焦点(for ie)
      setFocus: function() {
        // this.doc().body.focus();
        try {
          this.win().focus();
        } catch(e) {}
        var arg = arguments, sel = this.getSel(), rng = this.getRng();
        if(arg.length == 0) return;
        try {
          if(ie) {
            rng.moveStart('character', arg[1]);
            rng.select();
          } else {
            sel.collapse(this.doc().getElementById(arg[0]), 0);
          }
        } catch(e) {
        }
      },
      
      getSel : function() {
        return (htmlEditor.contentWindow.getSelection) ? htmlEditor.contentWindow.getSelection() : htmlEditor.contentWindow.document.selection;  
      },
      getRng : function() {
        try {
        var s = this.getSel();
        if(!s) { return null; }
        return (s.rangeCount > 0) ? s.getRangeAt(0) : s.createRange();
        } catch(e) {
          // alert(e.description);
        }
      },
      selRng : function(rng,s) {
        if(htmlEditor.contentWindow.getSelection) {
          s.removeAllRanges();
          s.addRange(rng);
        } else {
          rng.select();
        }
      },
  
      saveRng : function() {
        this.savedRange = this.getRng();
        this.savedSel = this.getSel();
      },
  
      restoreRng : function() {
        if(this.savedRange) {
          this.selRng(this.savedRange,this.savedSel);
        }
      },
      
      // 向编辑器光标位置插入html内容
      insertHtml: function(html) {
        this.setFocus();
        var r = this.getRng();
        if(ie) {
          r.pasteHTML(html);
        } else {
          var f = r.createContextualFragment(html);
          r.insertNode(f);
        }
      },
      // 获取光标选中的内容
      getSelCon: function() {
        if(ie) {
          return this.getRng().text;
        } else {
          return this.getRng().toString();
        }
      },
      
      // for ie
      getSelStyleIe: function() {
        var c = this.getRng().htmlText,
            cl = this.getRng().parentElement(),
            style = [],
            ck = function(list) {
              $(list).each(function(index) {
                var n = this.tagName.toLowerCase();
                if(n == 'b' || n == 'strong' || $(this).css('font-weight') == 'bold') style.push('b');
                if(n == 'em' || n == 'i' || $(this).css('font-style') == 'italic') style.push('i');
                if(n == 'u' || $(this).css('text-decoration') == 'underline') style.push('u');
              });
            };
            alert(c);
        if(c) {
          var div = document.createElement('div');
          div.innerHTML = c;
          // alert(c);
          var list = div.getElementsByTagName('*');
          ck(list);
        } else {
          var list = [];
          while(cl.tagName.toLowerCase() != 'body') {
            alert(cl.tagName);
            list.push(cl);
            cl = cl.parentNode;
          }
          // alert(cl.nodeName);
          ck(list);
        }
        return style.join();
      },
  
      selElm : function() {
        var r = this.getRng();
        if(r.startContainer) {
          var contain = r.startContainer;
          if(r.cloneContents().childNodes.length == 1) {
            for(var i=0;i<contain.childNodes.length;i++) {
              var rng = contain.childNodes[i].ownerDocument.createRange();
              rng.selectNode(contain.childNodes[i]);          
              if(r.compareBoundaryPoints(Range.START_TO_START,rng) != 1 && 
                r.compareBoundaryPoints(Range.END_TO_END,rng) != -1) {
                return $(contain.childNodes[i]);
              }
            }
          }
          return $(contain);
        } else {
          return $((this.getSel().type == "Control") ? r.item(0) : r.parentElement());
        }
      },
      // 阻止事件的冒泡
      eventStop: function(e) {
        try {
          e.preventDefault();
        } catch(e) {}
        try {
          e.stopPropagation();
        } catch(e) {}
        try {
          e.cancelBubble = true;
        } catch(e) {}
        try {
          e.returnValue = false;
        } catch(e) {}
      },
      // 编辑器工具栏上图标事件
      initEvent: function() {
        this.toolbar = $('#' + arg.toolbar)[0];
        var tbchilds = this.toolbar.childNodes,
            self = this,
            hdly = function() {
              self.hidels();
            },
            eventStop = this.eventStop,
            elist = {
              'fontname': 'createFontName',
              'fontsize': 'createFontSize',
              'forecolor': 'createForeColor',
              'backcolor': 'createBackColor',
              'createlink': 'createLink',
              'insertimage': 'createImageLink',
              'insertface': 'createFace'
            };
        for(var i=0;i<tbchilds.length;i++) {
          if(tbchilds[i].nodeType == 1 && tbchilds[i].nodeName.toLowerCase() == 'a') {
            var ename = tbchilds[i].getAttribute('ename');
            $(tbchilds[i]).bind('click', (function(ename) {
              return function(event) {
                if(elist[ename]) {
                  hdly();
                  eventStop(event);
                  self[elist[ename]](event);
                } else {
                  self.format(ename);
                }
                return false;
              };
            })(ename));
            tbchilds[i].onmouseover = function(event) {
              if(this.getAttribute('active') == 'true') return false;
              $(this).toggleClass('item-focus');
              return false;
            };
            tbchilds[i].onmouseout = function(event) {
              if(this.getAttribute('active') == 'true') return false;
              $(this).toggleClass('item-focus');
              return false;
            };
            tbchilds[i].onmousedown = (function(ename) {
              return function(event) {
                eventStop(event);
                self.___flag = true;
                $(this).addClass('item-press ' + ename.toLowerCase() + '-press');
                var _flag = false;
                $.each(self.buttonActive, function(index) {
                  if(!_flag && this.name == ename) _flag = true;
                });
                if(!_flag) return false;
                if(this.getAttribute('active') == 'true') {
                  this.removeAttribute('active');
                } else {
                  this.setAttribute('active', 'true');
                }
                
              };
            })(ename);
            tbchilds[i].onmouseup = (function(ename) {
              return function(event) {
                eventStop(event);
                self.___flag = false;
                if(this.getAttribute('active') == 'true') return false;
                $(this).removeClass('item-press ' + ename.toLowerCase() + '-press');
              };
            })(ename);
          }
        }
      },
      
      /*
      // 编辑按钮是否处于对应的状态
      buttonActiveEvent: function(e) {
        var sty = this.checkNodes(e);
        this.setActiveStyle(sty);
      },
      */
      
      setActiveStyle: function(sty) {
        $(this.toolbar.getElementsByTagName('a')).each(function(index, item) {
          var ename = item.getAttribute('ename'),
              active = item.getAttribute('active');
          if(!ename) return;
          try {
            if($.inArray(ename, sty) > -1) {
              if(active != 'true') {
                $(item).addClass('item-focus item-press ' + ename.toLowerCase() + '-press');
                item.setAttribute('active', 'true');
                return;
              } else {
                return;
              }
            }
            $(item).removeClass('item-focus item-press ' + ename.toLowerCase() + '-press');
            item.removeAttribute('active');
          } catch(e) {
            console.log(e.message);
          }
        });
      }
    };
    editor.initIfr();
    editor.initEvent();
    return editor;
  })();
  w.feditor = {
    editor: editor,
    ie: ie
  };
})(window, {
  domain: '',
  area: 'editmailEditor',
  toolbar: 'editor_toolbar'
}, jQuery);
