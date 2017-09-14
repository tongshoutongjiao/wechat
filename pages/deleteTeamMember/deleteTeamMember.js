const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {
        isAuthorization: app.data.isAuthorization,
        seasonList: [],
        memberList: [],
        actionSheetHidden: true,
        actionSheetItems: [
            {type: 'Delete', txt: '删除'}
        ],

    },
    onLoad: function (option) {
        console.log(option);
        let meetingId = option.meetingId;
        wx.setNavigationBarTitle({
            title: '删除团队成员',
        });
        this.setData({
            meetingId: meetingId,
            teamName: option.teamName
        });
        // 1 拿到option值，2 获取成员信息 3:渲染当前页面 4 执行删除操作
        this.getTeamInfo(meetingId);
        this.getUserInfo();
    },
    navigatorToInviteFriend: function (e) {
        wx.navigateTo({url: '/pages/inviteFriend/inviteFriend?' + util.jsonToParam(e.currentTarget.dataset)});
    },
    actionSheetTap: function (e) {
        let that = this;
        let selectId = e.currentTarget.dataset.id;
        let nickName = e.currentTarget.dataset.nickName;
        this.setData({
            selectId: selectId,
            nickName: nickName
        });
        that.setData({
            actionSheetHidden: !this.data.actionSheetHidden
        })
    },
    actionSheetbindchange: function () {
        this.setData({
            actionSheetHidden: !this.data.actionSheetHidden
        })
    },

    // 获取成员列表信息
    getTeamInfo: function (teamId) {
        this.getMemberInfo(teamId);

    },

    // 点击删除按钮，执行相应的操作
    loadByDelete: function () {

        // 判断当前用户是否为建团的人，如果是的话，不能删除自己
        let ownerName = this.data.userData.nickName,
            that = this,
            meetingId = this.data.meetingId,
            selectId = this.data.selectId;
        if (ownerName!=this.data.nickName) {
            this.request({
                url: `${config.domain}/app/meetings/users/${meetingId}/${selectId}`,
                method: 'DELETE',
                success: function (response) {
                    let memberData=that.data.memberList;
                    memberData.forEach(function (item,index) {
                        //遍历所有的用户列表
                       if(item.id===selectId){
                            memberData.splice(index,1);
                            return;
                        }
                    });
                    that.setData({
                        actionSheetHidden: !that.data.actionSheetHidden,
                        memberList:memberData
                    });
                }
            })
        }
        else {
            wx.showToast({
                title: '没有操作权限',
                icon: 'fail',
                duration: 1000
            });
        }


    },

    // 点击完成，返回到上一级页面
    returnSetTeamName: function (e) {
        wx.navigateBack({
            delta: 1
        })
    }
});
Page(option);



