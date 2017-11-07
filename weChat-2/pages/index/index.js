const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();
const option = util.extend(util, {
    data: {
        userInfo: app.data.userInfo,
    },
    onLoad: function () {

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



