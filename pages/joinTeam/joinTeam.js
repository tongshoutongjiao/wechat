const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {
        // 用户是否授权
        isAuthorization: false,
        memberList: [],
        inviteText:'确认加入',
    },
    onLoad: function (option) {
        console.log(option);
        app.onReadyPage(function () {
            if (app.data.loadSuccess === false) {
                that.setData({
                    loadSuccess: false
                });
                return false;
            } else {
                that.setData({
                    loadSuccess: true
                });
            }
            
        });
        let scene;
        // 通过扫码进入加入团队页面，先获取二维码中的scene值
         option.scene? scene = decodeURIComponent(options.scene):'';

        const that=this;
        this.setData({
            teamName:option.teamName,
            meetingId:option.meetingId,
            scene:scene
        });
        wx.setNavigationBarTitle({
            title: '邀请好友',
        });

        app.onReadyPage(this.getCreatorInfo.bind(this));
    },
    onShow: function () {

    },
    onReady: function () {
    },
    onHide: function () {
    },
    onUnload: function () {
    },
    onPullDownRefresh: function () {

    },
    onReachBottom: function () {

    },

    // 获取用户列表信息
    getCreatorInfo:function () {
        let that=this;
      let meetingId=this.data.meetingId?this.data.meetingId:this.data.scene;
        console.log(this.data);
        console.log(meetingId);
        this.request({
            url:`${config.domain}/app/meetings/users/${meetingId}`,
            method:'GET',
            success:function (d) {
                console.log('dataResponse');
                console.log(d);

                let data=d.data.result;
                that.setData({
                    memberList:data
                })
            }
        });
    },
//     被邀请者点击确认加入按钮，加入到团队中，同时按钮改为已加入团队
    joinNewTeam:function (e) {
        const that=this;
        let meetingId=this.data.meetingId?this.data.meetingId:this.data.scene;
        util.request({
           url:`${config.domain}/app/meetings/users`,
            method:'POST',
            data:{
                meetingId:that.data.meetingId
            },
            success:function (d) {
                console.log(d);
                wx.showToast({
                    title: '加入成功',
                    icon: 'success',
                    duration: 1000
                });
                that.setData({
                    inviteText:'已加入'
                })
            }
        });
    }
});
Page(option);
