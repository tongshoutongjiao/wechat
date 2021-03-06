const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();
const option = util.extend(util, {
    data: {

        // 用户是否授权
        isAuthorization: false,
        teamList: [],
        teamListAry: null,
        userInfo: app.data.userInfo,
    },
    onLoad: function () {
        const that = this;
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

        // 调用发送ajax请求，获取首页的团队列表数据
        app.onReadyPage(this.getTeamDate.bind(this));
    },
    onShow: function () {
        this.getTeamDate();
    },
    navigatorToTeam: function (e) {
        wx.navigateTo({url: '/pages/teamName/teamName?' + util.jsonToParam(e.currentTarget.dataset)});
    },
    navigatorCreateTeam: function (e) {
        wx.navigateTo({url: '/pages/createTeam/createTeam?' + util.jsonToParam(e.currentTarget.dataset)});
    },

    //  获取团队名
    getTeamDate: function () {
        const that = this;
        util.request({
            url: `${config.domain}/app/meetings`,
            type: 'GET',
            success: function (d) {
                let data = d.data.result ? d.data.result : '';

                that.addTeamIcon(data);
                that.setData({
                    teamList: data
                });
            },
            fail: function (d) {
                console.log('请求失败');
            }
        })
    },

    // 添加团队图标
    addTeamIcon: function (data) {
        let iconList = ['green.png', 'yellow.png', 'lightBlue.png'];
        data.forEach(function (item, index) {
            let suffixIcon = 'http://bi-workbench.oss-cn-hangzhou.aliyuncs.com/wechat_app/';
            item.teamIcon = `${suffixIcon}${iconList[index % 3]}`;
        });
    },

    // 首页转发功能
    onShareAppMessage: function (res) {
        if (res.from === 'button') {

            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: 'bigBench',
            path: '/pages/index/index',
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },

   //
    checkPage:function () {
      /*  console.log('卡卡卡');
         wx.redirectTo({url: '/pages/index/index'});
        wx.reLaunch({
            url:'/pages/index/index'
        })*/
        this.getTeamDate();
    }

});
Page(option);



