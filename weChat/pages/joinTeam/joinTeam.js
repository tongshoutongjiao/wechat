const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {
        memberList: [],
        inviteText: '确认加入',
        joinStatus: false
    },
    onLoad: function (option) {
        const that = this;
        let scene;
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

        // 根据团队ID获取团队名
        // 思路：判断option中是否有scene的值?
        // 1 如果有，则根据meetingId 调用接口，获取团队名称,
        // 通过扫码进入加入团队页面，先获取二维码中的scene值
        option.scene ? scene = decodeURIComponent(option.scene) : '';

        // 判断是否使用二维码中传递的参数
        scene ? this.splitScene(scene, option) : this.setData({
            teamName: option.teamName,
            meetingId: option.meetingId
        });

        wx.setNavigationBarTitle({
            title: '邀请好友',
        });

        // 调用回调函数,获取当前成员，并判断用户是否已经加入团队
        app.onReadyPage(this.getCreatorInfo.bind(this, this.getCurUserInfo));
    },

    // 获取用户列表信息
    getCreatorInfo: function (cb) {
        let that = this;
        let meetingId = this.data.meetingId ? this.data.meetingId : this.data.scene;
        this.request({
            url: `${config.domain}/app/meetings/users/${meetingId}`,
            method: 'GET',
            success: function (d) {
                let data = d.data.result;
                that.setData({
                    memberList: data
                });

                cb && cb(data)
            }
        });
    },

    // 被邀请者点击确认加入按钮，加入到团队中，同时按钮改为已加入团队
    joinNewTeam: function (e) {
        const that = this;
        let meetingId = this.data.meetingId ? this.data.meetingId : this.data.scene;
        if (!this.data.joinStatus) {
            util.request({
                url: `${config.domain}/app/meetings/users`,
                method: 'POST',
                data: {
                    meetingId: that.data.meetingId
                },
                success: function (d) {
                    console.log(d);
                    wx.showToast({
                        title: '加入成功',
                        icon: 'success',
                        duration: 1000
                    });
                    that.setData({
                        inviteText: '已加入'
                    })
                }
            });

        } else {
            wx.showToast({
                title: '已加入团队',
                icon: 'success',
                duration: 1000
            });
            return;
        }
    },

    // 获取当前登录用户的个人信息
    getCurUserInfo: function (data) {
        let that = this;
        wx.getUserInfo({
            success: function (resUser) {
                let userName = resUser.userInfo.nickName;
                that.setData({
                    userName: userName
                });
                data.forEach(function (item, index) {
                    if (userName === item.nickname) {
                        that.setData({
                            inviteText: '已加入该团队',
                            joinStatus: true
                        })
                    }
                })
            }
        })
    },

    //以逗号分隔截取字符串
    splitScene: function (scene) {
        const that=this;
            this.setData({
                meetingId: scene
            });
            this.getTeamName(scene);
    },
//    通过团队ID名来获取团队名
     getTeamName:function (IdName) {
        const that=this;
        this.request({
            url: `${config.domain}/app/meetings/get-name`,
            method: 'GET',
            data:{
                id:IdName
            },
            success: function (d) {
                let name;
                if(d.data.result){
                    name=d.data.result.name;
                }
                that.setData({
                    teamName:name
                });
            }
        })

    }

});
Page(option);
