const util = require('../../utils/util');
const app = getApp();
const config = require('../../config');

//  注：非团主不能进行删除，修改，等操作，可以邀请朋友
const option = util.extend(util, {
    data: {
        isAuthorization: app.data.isAuthorization,
        seasonList: [],
        memberList: []
    },
    onLoad: function (option) {
        let newTeamName = wx.getStorageSync('newTeamName') != '' ? wx.getStorageSync('newTeamName') : '';
        this.setData({
            teamName: option.teamName,
            newTeamName: newTeamName,
            meetingId: option.meetingId,
            ownerName: option.ownerName
        });
        // 设置title
        wx.setNavigationBarTitle({
            title: '团队设置'
        });
        this.getMemberInfo();
        this.getUserInfo();
    },
    onShow: function () {
        this.getMemberInfo();
        try {
            let value = wx.getStorageSync('teamName');
            if (value) {
                this.setData({
                    teamName: value
                });
                wx.clearStorageSync()
            }
        } catch (e) {


        }
    },

    // 修改团队名
    navigatorToFixTeamName: function (e) {
        let flag = this.data.userData.nickName === this.data.ownerName;
        if (flag) {
            wx.navigateTo({url: '/pages/fixTeamName/fixTeamName?' + util.jsonToParam(e.currentTarget.dataset)})
        } else {
            wx.showToast({
                title: '无权限',
                icon: 'loading',
                duration: 1000
            });
        }
    },

    // 邀请朋友加入
    navigatorToInviteFriend: function (e) {
        wx.navigateTo({url: '/pages/inviteFriend/inviteFriend?' + util.jsonToParam(e.currentTarget.dataset)});
    },

    // 删除团队中的某一个人
    navigatorToDeleteTeamMember: function (e) {
        let flag = this.data.userData.nickName === this.data.ownerName;
        if (flag) {
            wx.navigateTo({url: '/pages/deleteTeamMember/deleteTeamMember?' + util.jsonToParam(e.currentTarget.dataset)});
        } else {
            wx.showToast({
                title: '无权限',
                icon: 'loading',
                duration: 1000
            });
        }
    },

    // 获取成员列表信息
    getMemberInfo: function () {
        let that = this,
            meetingId = this.data.meetingId;
        this.request({
            url: `${config.domain}/app/meetings/users/${meetingId}`,
            method: 'GET',
            success: function (response) {
                let memberDate = response.data.result ? response.data.result : [];
                if (memberDate.length == '1') {
                    that.setData({
                        memberList: memberDate,
                        onlyOne: true
                    });
                } else {
                    that.setData({
                        memberList: memberDate,
                        onlyOne: false
                    });
                }
            }
        })
    },

    // 团队二维码
    showBarCode: function (e) {
        wx.navigateTo({url: '/pages/QRcode/QRcode?' + util.jsonToParam(e.currentTarget.dataset)});
    },

    //测试扫描团队二维码页面，点击跳转到邀请加入好友页面
    returnToJoinTeam: function (e) {
        wx.navigateTo({url: '/pages/joinTeam/joinTeam?' + util.jsonToParam(e.currentTarget.dataset)});
    },

    //  获取用户信息
    getUserInfo: function (code) {
        let that = this,
            userData;
        wx.getUserInfo({
            success: function (resUser) {
                that.data.userInfo = resUser.userInfo;
                userData = resUser.userInfo;
                console.log(userData.nickName);
                console.log(that.data.ownerName);


                let flag = userData.nickName === that.data.ownerName;




                console.log('flag');
                console.log(flag);








                that.setData({
                    userData: userData,
                    flag: flag
                });
            }
        });
    },


});
Page(option);



