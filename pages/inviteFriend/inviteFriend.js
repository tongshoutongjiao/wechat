/**
 * Created by zhaohailong on 2017/8/27.
 */

const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {
        // 用户是否授权
        isAuthorization: false,
        memberList: []
    },
    onLoad: function (option) {
        console.log(option);
        this.setData({
            teamName: option.teamName,
            meetingId: option.meetingId
        });

        wx.setNavigationBarTitle({
            title: '邀请好友',
        });
        this.getCreatorInfo();
        this.getUserInfo()
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
    getCreatorInfo: function () {
        let that = this,
            meetingId = this.data.meetingId;
        console.log(this.data);
        console.log(meetingId);
        this.request({
            url: `${config.domain}/app/meetings/users/${meetingId}`,
            method: 'GET',
            success: function (d) {
                let data = d.data.result;
                that.setData({
                    memberList: data
                })
            }
        });
    },
    // 跳转到上新时间设置页面
    navigatorToSetWaveDate: function (e) {
        wx.navigateTo({url: '/pages/setWaveDate/setWaveDate?' + util.jsonToParam(e.currentTarget.dataset)});
    },

//     跳转到加入好友界面
    navigatorToJoinTeam: function (e) {
        console.log('wuwwuwu');
        let meetingId = this.data.meetingId,
            teamName = this.data.teamName,
            nickName = this.data.userData.nickName;
        wx.navigateTo({url: `/pages/joinTeam/joinTeam?meetingId=${meetingId}&teamName=${teamName}`});
    },

// 转发团队信息邀请新的好友加入
    onShareAppMessage: function (res) {
        let meetingId = this.data.meetingId,
            teamName = this.data.teamName,
            nickName = this.data.userData.nickName;
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: `${nickName}邀请您加入团队${teamName}`,
            path: `/pages/joinTeam/joinTeam?meetingId=${meetingId}&teamName=${teamName}`,
            success: function (res) {
                // 转发成功,执行成功回调
                console.log(res);
                wx.navigateBack({
                    delta: 1
                })
            },
            fail: function (res) {
                // 转发失败，执行失败回调

            }
        }
    }


});
Page(option);



