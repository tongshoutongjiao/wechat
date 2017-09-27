const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {
        // 用户是否授权
        isAuthorization: false,
        teamName: '',
        titleHeight:'0rpx',
        hasFillTeamName:false
    },
    onLoad: function () {
        wx.setNavigationBarTitle({
            title: '创建团队',
        });
    },
    teamNameInput: function (e) {
        let valueText = e.detail.value;
        this.setData({
            teamName: valueText
        })
    },
    navigatorToInviteFriend: function (e) {
        if (!this.data.teamName) {
            wx.showToast({
                title: '请输入团队名',
                icon: 'loading',
                duration: 1000,
                mask: true
            });
        } else {
            console.log('wuwuwu');
            // 调用创建团队接口，创建成功，跳转到下一个页面
            this.createTeamName(e);
        }
    },

    // 创建团队
    createTeamName: function (e) {
        let that = this,
            teamName = this.trim(this.data.teamName);
        this.request({
            url: `${config.domain}/app/meetings`,
            method: 'POST',
            data: {
                meetingName: teamName
            },
            success: function (d) {
                console.log('defense');
                console.log(d);
                let data = d.data.result ? d.data.result : '';
                if(data){
                    that.setData({
                        hasFillTeamName:true,
                        titleHeight:'94rpx',
                    });
                    wx.navigateTo({url: '/pages/inviteFriend/inviteFriend?meetingId=' + data.meetingId + '&' + util.jsonToParam(e.currentTarget.dataset)});
                }
            }
        })
    },

    // 返回首页
    returnIndex:function () {
        wx.reLaunch({
            url: '/pages/index/index'
        })
    }

});
Page(option);



