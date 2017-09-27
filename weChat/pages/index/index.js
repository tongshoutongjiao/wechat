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

        // 调用发送ajax请求，获取首页的团队列表数据
        console.log(this);
        const that = this;
        let screenHeight;
        screenHeight=this.app.data.system.screenHeight;
        console.log(screenHeight);
        app.onReadyPage(this.getTeamDate.bind(this));
        this.setData({
            deviceHeight:screenHeight
        });
        wx.getUserInfo({
            success: function (resUser) {
                console.log(resUser);
            }
        });
        // this.splitScene(scene)
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
            let suffixIcon = 'http://ruhnnstatic.oss-cn-hangzhou.aliyuncs.com/bigbench/';
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

    //以逗号分隔截取字符串
    splitScene: function (scene) {
        let sceneArray;
        if (scene.indexOf(',') !=-1) {
            sceneArray = scene.split(',');
        } else {
            sceneArray = scene;
        }
        console.log(sceneArray);
    },
    myTouchMove:function (e) {
        console.log(e);
        e.preventDefault();
    }


});
Page(option);



