const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {
        // 用户是否授权
        isAuthorization: false,
    },
    onLoad: function (option) {
        console.log(option);
        this.setData({
            meetingId:option.meetingId,
            teamName:option.teamName
        });
        // 设置title
        wx.setNavigationBarTitle({
            title: '修改团队名'
        });

    },

    teamNameInput: function (e) {
        this.setData({
            teamName: e.detail.value
        });
    },
    returnIndex:function () {
        const that=this;
        let meetingName=this.trim(this.data.teamName);

        this.request({
            url:`${config.domain}/app/meetings/editors`,
            method:'POST',
            data:{
                meetingId:that.data.meetingId,
                meetingName:meetingName
            },
            success:function (d) {

            //  回调跳转到首页的函数
                wx.setStorageSync('teamName', that.data.teamName);
                wx.navigateBack({
                    delta: 1
                })
            }
        })
  }
});
Page(option);



