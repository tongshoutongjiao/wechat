const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();
const option = util.extend(util, {
    data: {
        userInfo: app.data.userInfo,
        cancelFlag:false,
        selectedFlag:false

    },
    onLoad: function () {

    },

    // 点击转发按钮，左边增加取消的选项，同时文字改为确定
    handleTransfer:function () {
        this.setData({
            cancelFlag:true
        })
    },

    // 改变任务图标的选中状态,同时记录已经选中的任务的个数。
    changeSelect:function () {
        this.setData({
            selectedFlag:!this.data.selectedFlag
        })
    },

    // 点击取消按钮，切换回原来的状态
    cancelTransfer:function () {
        this.setData({
            cancelFlag:false
        })
    },

    // 用户点击图标扫码完成后，需要根据二维码路径跳转至跳转到款列表页
    scanCode:function () {
        console.log('跳转至款列表页面');

        wx.navigateTo({url: '/pages/styleList/styleList'});
        /* // 允许从相机和相册扫码
         wx.scanCode({
         success: (res) => {
         console.log(res)
         }
         })*/


    }

});
Page(option);


