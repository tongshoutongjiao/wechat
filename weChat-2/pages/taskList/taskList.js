const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();
const option = util.extend(util, {
    data: {
        userInfo: app.data.userInfo,
        cancelFlag: false,
        selectedFlag: false,
        selectLength:0,

    },
    onLoad: function (option) {
        const that = this;
        let scene;
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
        this.setData({
            bandId: option.bandId
        });
        app.onReadyPage(this.getBandData.bind(this));

    },
    onShow:function () {
        this.getBandData()
    },

    // 获取当前页面及任务的数据
    getBandData: function () {
        let that = this;
        this.request({
            url: `${config.domain}/app/tasks/get-band`,
            method: 'GET',
            data: {
                bandId: that.data.bandId
            },
            success: function (d) {
                if (d.data.status.code === 1000) {
                    let data = d.data.result;

                    //格式化创建时间
                    data ? data.forEach(function (item, index) {
                        that.formatCurDate(item);
                        item.index=index;
                        item.selected=false;
                    }) : '';

                    that.setData({
                        taskList: data
                    });
                }

            }
        })

    },


    // 格式化上新时间
    formatCurDate: function (d) {
        const that = this;
        d.createTime = d.createTime ? that.formatDate(d.createTime) : '';
        return d;
    },

    // 点击转发按钮，左边增加取消的选项，同时文字改为确定
    handleTransfer: function () {
        this.setData({
            cancelFlag: true
        })
    },


    // 页面转发功能
    onShareAppMessage: function (res) {
        let bandId = this.data.bandId;

        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: `bigbench任务列表`,
            path: `/pages/taskList/taskList?bandId=${bandId}`,
            success: function (res) {
                console.log('转发成功')
            },
            fail: function (res) {
                // 转发失败，执行失败回调
            }
        }
    },









    // 改变任务图标的选中状态,同时记录已经选中的任务的个数。
    changeSelect: function (e) {
        // 思路：点击当前图片，给元素增加一个类名，再次点击，则取消该样式,
        let index = e.currentTarget.dataset.index,
            data = this.data.taskList[index],
            selectLength=this.data.selectLength;
        data.selected = !data.selected;
        this.setData({
            [`taskList[${index}]`]: data
        });

        selectLength=0;

        this.data.taskList.forEach(function (item,index) {
            if(item.selected){
                selectLength+=1;
            }
        });
        this.setData({
            selectLength:selectLength
        })
    },

    // 点击取消按钮，切换回原来的状态
    cancelTransfer: function () {
        this.setData({
            cancelFlag: false
        })
    },
    // 用户点击图标扫码完成后，需要根据二维码路径跳转至跳转到款列表页
    scanCode: function () {
        console.log('跳转至款列表页面');

        wx.navigateTo({url: '/pages/styleList/styleList'});
        /* // 允许从相机和相册扫码
         wx.scanCode({
         success: (res) => {
         console.log(res)
         }
         })*/

    },

    // 用户点击某项任务跳转到编辑任务的页面   styleIntro
    navigatorToStyleIntro: function (e) {
        //   1 可以判断根据路径来判断  getCurrentPages();
        //    2 正常页面跳转
        console.log('跳转到编辑任务页面');


        // 跳转到编辑任务页面
         wx.navigateTo({url: '/pages/styleIntro/styleIntro?' + util.jsonToParam(e.currentTarget.dataset)});


    }


});
Page(option);


