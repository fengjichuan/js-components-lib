jquery.js, class.js在系统中已经存在；
只需要嵌入jquery.event.drag.js, maildialog.js文件，还需要相关的css和image（在images文件夹中）
jquery.event.drag.js: 一个jQuery的第三方扩展，满足了大多数的拖拽功能（如果不需要实现拖拽可以不嵌入这个文件）


接口调用方式

/*
title: String   // 对话框的标题名称
info: String    // 对话框内容信息
click: Function // 点击“确定”按钮响应的事件（模拟系统dialog对话框的阻塞状态）
参数默认都可以不传
*/
mailDialog.alert({
	title: 'alert提示对话框',
	info: '你的操作有误，请重新操作',
	click: function(event) {
		// something code here
	}
});

/*
title: String   // 对话框的标题名称
info: String    // 对话框内容信息
confirm: String // “确定”按钮的文字描述（默认是“确定”）
cancel: String  // “取消”按钮的文字描述（默认是“取消”）
click: Function // 点击“确定”按钮响应的事件（模拟系统dialog对话框的阻塞状态）
cancelclick: Function // 点击“取消”按钮响应的事件
参数默认都可以不传
*/
mailDialog.confirm({
	title: 'confirm提示对话框',
	info: '确定要这样操作？',
	confirm: 'Yes',
	cancel: 'No',
	click: function(event) {
		// something code here
	},
	cancelclick: function(event) {
		// something code here
	}
});

/*
title: String   // 对话框的标题名称
info: String    // 对话框内容信息
prompt: String  // 输入框中的内容信息
click: Function // 点击“确定”按钮响应的事件（模拟系统dialog对话框的阻塞状态）
cancelclick: Function // 点击“取消”按钮响应的事件
参数默认都可以不传
*/
mailDialog.prompt({
	title: 'prompt提示对话框',
	info: '请输入内容：',
	prompt: 'test value',
	// value: 输入的prompt内容 ==》'test value'
	click: function(value, event) {
		// something code here
	},
	cancelclick: function(value, event) {
		// something code here
	}
});