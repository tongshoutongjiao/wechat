const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();
let actionText = {
    fixTxt: '修改',
    requireTxt: '确定要删除这条任务吗?'
};
const option = util.extend(util, {
    data: {
        focusFlag: false,
        actionSheetHidden: true,
        deleteBtnIcon: true,
        actionSheetItems: [
            {type: 'Delete', txt: '删除'}
        ],
        fixIcon: true,
        actionTxt: actionText.fixTxt,
        deleteFn:'loadByDelete'
    },

    onLoad: function (options) {

    },


    // 点击切换底部弹窗的按钮
    actionSheetbindchange: function () {
        this.setData({
            actionSheetHidden: !this.data.actionSheetHidden
        })

    },
    //
    loadByDelete: function () {
        this.setData({
            actionTxt: actionText.requireTxt,
            fixIcon: false,
            deleteFn:'navigatorToTaskList'
        })
    },


    // 当用户点击编辑按钮的时候，修改input框的聚焦状态，提示用户输入文字

    handleEditContent: function () {
        console.log('获取input框的焦点啦');
        this.setData({
            focusFlag: true
        })

    },

    // 当用户点击修改时，跳转回当前款页面，
    navigatorToSpecStyle: function () {
        wx.navigateBack({
            delta: 1
        })
    },


    // 点击删除，删除当前任务，删除成功后跳转至任务列表页面
    navigatorToTaskList:function () {
        console.log('删除当前任务的内容');
        /*this.request({
            url:'',

        })*/
    },

    // 点击取消按钮
    recoverDefaultStatus: function () {
        this.setData({
            actionTxt: actionText.fixTxt,
            fixIcon: true
        })
    }

});
Page(option);



