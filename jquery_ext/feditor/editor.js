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
      editorIfr = '<iframe style="height:100%;width:100%;border:0px;margin:0px;padding:0px;background-color:#FFFFFF;" frameborder=0 src="javascript:document.open();'+ domain +'document.write(\'<html><head><style>body{background-color:#fff;font-size:14px;font-family:courier,verdana,宋体;margin:0px;padding:0px 4px;height:100%;line-height:1.6;cursor:text;}pre {white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word;}p{margin:0px;}<\/style><\/head><body><\/body><\/html>\');document.close();function setEditor(){try{if(!parent||!parent[\'feditor\']||!parent[\'feditor\'][\'editor\']){setTimeout(arguments.callee,200);return false;}else{parent.feditor.editor.ifronload();}}catch(e){}}setEditor();"></iframe>',
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
      },
      
      // iframe载入完成之后将其设置为可编辑状态
      ifronload: function(){
        var ifrd = htmlEditor.contentWindow.document;
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
      },
      
      format: function(type, para){
          var ifrd = htmlEditor.contentWindow.document;
          ! para ? (ie ? ifrd.execCommand(type) : ifrd.execCommand(type, false, false)) : ifrd.execCommand(type, false, para);
      },
      
      // 编辑器中显示层的元素对象
      layers: {
        fontname: null,
        fontsize: null,
        forecolor: null,
        backcolor: null,
        face: null
      },
      // 注册控制层隐藏的事件
      hideLayers: function() {
        var self = this,
            hd = function(event) {
              for(var key in self.layers){
                $(self.layers[key]).hide();
              }
            };
        $(document.body).bind('click', hd);
        $(htmlEditor.contentWindow.document.body).bind('click', hd);
      },
      
      // 创建显示字体风格的层
      createFontName: function() {
        if(!this.layers.fontname) {
          var div = document.createElement('div');
          div.style.cssText = 'position:absolute;z-index:100009;width:150px;height:240px;overflow-x:hidden;overflow-y:auto;background-color:white;border:1px solid #838383;top:27px;left:104px;display:none;';
          var fontface = ['宋体', '黑体', '楷体', '隶书', '仿宋体', '幼圆', 'Arial', 'Arial Black', 'Arial Narrow', 'Century Gothic', 'Comic Sans MS', 'Courier New', 'MS Sans Serif', 'Script', 'Verdana', 'Times New Roman', 'WingDings'];
          var a = [];
          $.each(fontface, function(index, item) {
            a.push('<a href="javascript:;" hidefocus="true" onmouseover="this.style.backgroundColor=\'#E5E5E5\';" onmouseout="this.style.backgroundColor=\'\';" onclick="feditor.editor.format(\'fontname\', \''+ item +'\');return false;" style="font:normal 12px ' + item + ';color:black;display:block;height:16px;line-height:16px;padding:2px;text-decoration:none;">' + item + '</a>');
          });
          div.innerHTML = a.join('');
          this.toolbar.appendChild(div);
          this.layers.fontname = div;
          this.hideLayers();
        }
        $(this.layers.fontname).show();
      },
      
      // 创建显示字体大小的层
      createFontSize: function() {
        if(!this.layers.fontsize) {
          var div = document.createElement('div');
          div.style.cssText = 'position:absolute;z-index:100008;width:120px;height:auto;background-color:white;border:1px solid #838383;top:27px;left:154px;display:none;';
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
          this.toolbar.appendChild(div);
          this.layers.fontsize = div;
          this.hideLayers();
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
      createForeColor: function() {
        if(!this.layers.forecolor) {
          var div = this.createColor({top:'31px', left:'200px'}, 'forecolor');
          this.toolbar.appendChild(div);
          this.layers.forecolor = div;
          this.hideLayers();
        }
        $(this.layers.forecolor).show();
      },
      
      // 创建背景颜色的层
      createBackColor: function() {
        if(!this.layers.backcolor) {
          var _f = '';
          if(gecko) {
            _f = 'hiliteColor';
          } else {
            _f = 'backcolor';
          }
          var div = this.createColor({top:'31px', left:'226px'}, _f);
          this.toolbar.appendChild(div);
          this.layers.backcolor = div;
          this.hideLayers();
        }
        $(this.layers.backcolor).show();
      },
      
      // 创建显示表情的层
      createFace: function() {
        if(!this.layers.face) {
          var div = document.createElement('div');
          div.style.cssText = 'position:absolute;z-index:100010;width:auto;height:auto;background-color:white;border:1px solid #838383;top:31px;left:482px;display:none;';
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
              td.push('<td style="padding:2px;"><a href="javascript:feditor.editor.setFocus();feditor.editor.format(\'insertimage\', \'images/face/smiley-'+ _item.name +'.gif\');"><img src="images/face/smiley-'+ _item.name +'.gif" title="'+ _item.title +'" style="width:18px;height:18px;border:0;margin:4px;" /></a></td>');
            });
            tr.push('<tr>' + td.join("") + '</tr>');
          });
          div.innerHTML = '<table><tbody>' + tr.join('') + '</tbody></table>';
          this.toolbar.appendChild(div);
          this.layers.face = div;
          this.hideLayers();
        }
        
        $(this.layers.face).show();
      },
      
      // 添加图片
      createImageLink: function(){
        var v = $.trim(window.prompt('插入图片', 'http://'));
        if (!v || v == null || v == 'http://' || v == '') 
            return;
        this.setFocus();
        this.format('insertimage', v);
      },
      // 创建超链接
      createLink: function(){
        var v = $.trim(window.prompt('请输入链接 (如:http://www.wanmei.com/):', 'http://'));
        if (!v || v == null || v == 'http://' || v == '') 
            return;
        this.setFocus();
        this.format('createlink', v);
      },
      
      // 获取编辑器中的内容
      getContent: function(){
          return htmlEditor.contentWindow.document.body.innerHTML;
      },
      // 设置编辑器中的内容
      setContent: function(content){
          htmlEditor.contentWindow.document.body.innerHTML = content;
      },
      
      // 设置编辑器焦点(for ie)
      setFocus: function() {
        htmlEditor.contentWindow.document.body.focus();
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
          alert(e.description);
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
      // 编辑器工具栏上图标事件
      initEvent: function() {
        this.toolbar = $('#' + arg.toolbar)[0];
        var tbchilds = this.toolbar.childNodes,
            self = this,
            hdly = function() {
              for(var key in self.layers){
                $(self.layers[key]).hide();
              }
            },
            eventStop = function(e) {
              e.preventDefault();
              e.stopPropagation();
            };
        for(var i=0;i<tbchilds.length;i++) {
          if(tbchilds[i].nodeType == 1 && tbchilds[i].nodeName.toLowerCase() == 'a') {
            var ename = tbchilds[i].getAttribute('ename');
            $(tbchilds[i]).bind('click', (function(ename) {
              return function(event) {
                if(ename == 'fontname') {
                  hdly();
                  eventStop(event);
                  self.createFontName();
                } else if(ename == 'fontsize') {
                  hdly();
                  eventStop(event);
                  self.createFontSize();
                } else if(ename == 'forecolor') {
                  hdly();
                  eventStop(event);
                  self.createForeColor();
                } else if(ename == 'backcolor') {
                  hdly();
                  eventStop(event);
                  self.createBackColor();
                } else if(ename == 'createlink') {
                  self.createLink();
                } else if(ename == 'insertimage') {
                  self.createImageLink();
                } else if(ename == 'insertface') {
                  hdly();
                  eventStop(event);
                  self.createFace();
                } else {
                  self.format(ename);
                }
              };
            })(ename));
            tbchilds[i].onmouseover = function(event) {
              $(this).toggleClass('item-focus');
              return false;
            };
            tbchilds[i].onmouseout = function(event) {
              $(this).toggleClass('item-focus');
              return false;
            };
            tbchilds[i].onmousedown = (function(ename) {
              return function(event) {
                $(this).addClass('item-press ' + ename.toLowerCase() + '-press');
              };
            })(ename);
            tbchilds[i].onmouseup = (function(ename) {
              return function(event) {
                $(this).removeClass('item-press');
                $(this).removeClass(ename.toLowerCase() + '-press');
              };
            })(ename);
          }
        }
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
  area: 'editor_content',
  toolbar: 'editor_toolbar'
}, jQuery);
