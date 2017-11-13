const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();
let actionText = {
    fixTxt: '修改',
    requireTxt: '确定要删除这条任务吗?'
};
const option = util.extend(util, {
        data: {
            focusFlag: false,
            actionSheetHidden: true,
            deleteBtnIcon: true,
            actionSheetItems: [
                {type: 'Delete', txt: '删除'}
            ],
            fixIcon: true,
            actionTxt: actionText.fixTxt,
            deleteFn: 'loadByDelete',
            sureIcon: false

        },

        onLoad: function (option) {
            console.log(option);
            const that = this;

            //     进入该页面的方式有四种场景 ，进入当前页面需要参数bandId，taskId

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
                taskId: option.taskId,
                bandId: option.bandId
            });
            app.onReadyPage(this.getTaskData.bind(this));
            console.log(this)
        },

        // 获取当前页面及任务的数据
        getTaskData: function () {
            console.log('获取页面信息');
            let that = this;
            this.request({
                url: `${config.domain}/app/tasks/get-info`,
                method: 'GET',
                data: {
                    id: that.data.taskId
                },
                success: function (d) {
                    console.log(d.data.status);
                    if (d.data.status.code === 1000) {
                        let curData = d.data.result;
                        that.setData({
                            curList: curData
                        });
                        //格式化创建时间
                        curData ? that.formatCurDate(curData) : '';

                  /*  //    回调获取读者信息
                        that.getReaderData();*/
                    }

                }
            })

        },

        // 获取当前已读读者的信息

        getReaderData: function () {
            // 当成功获取到已读人的信息之后，改变底部导航栏的显示样式

            let taskId = this.data.taskId;

            console.log(taskId);
            console.log(this.data.curList);
            let that = this;
            this.request({
                url: `${config.domain}/app/tasks/readers/${taskId}`,
                method: 'GET',
                success: function (d) {
                    let data = d.data;
                    if (data.status.code === 1000) {

                        // 统计已读信息的人数和信息
                        that.setData({
                            readerInfo: data.result
                        });
                        console.log(that);
                        console.log(data.result)
                    }
                }
            })
        },

        // 点击查看大图
        handleLargeImg: function (e) {
            this.largerImage(e)
        },

        // 格式化上新时间
        formatCurDate: function (d) {
            const that = this;
            let createTime = d.createTime ? that.formatDate(d.createTime) : '';
            that.setData({
                createTime: createTime
            })
        },

//     确认收到消息
        handleConfirmMsg: function (e) {
            console.log('确认收到消息');

            //
            const that = this;
            this.setData({
                sureIcon: !that.data.sureIcon
            });
            if (!this.data.sureIcon) {
                return;
            }

            that.request({
                url: `${config.domain}/app/tasks/readers`,
                method: 'POST',
                data: {
                    taskId: that.data.taskId
                },
                success: function (d) {
                    // 确认成功后，回调函数，更新当前已经阅读的人数
                    console.log(d);
                    if (d.data.status.code === 1000) {
                        console.log('确认成功');
                        that.getReaderData();
                    }
                }
            })


        }


    })
;
Page(option);

