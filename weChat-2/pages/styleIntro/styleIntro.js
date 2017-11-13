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
        isAuthor:false,
        textAreaEdit:true,
        fixMode:false
    },

    onLoad: function (option) {
        console.log(option);
        const that = this;

        //     进入该页面的方式有四种场景 ，进入当前页面需要参数bandId，分别是
        //    1 扫码进入， 用户需要先登录，才能请求数据
        //    2 点击specStyle保存按钮，自动跳转
        //    3 点击任务列表中的某一项
        //    4 点击用户转发过的页面进入小程序
        //     1和4逻辑一样，2和3逻辑一样

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
            bandId:option.bandId,
            photoId:option.photoId
        });
        app.onReadyPage(this.getTaskData.bind(this));


    },

    // 点击删除的时候判断上个页面是否是taskList



    // 判断上个页面
    judgeLastPage:function () {
        // 判断上个页面是否是新增任务的页面，如果是的话，跳转回上个页面，否则直接跳转
        let pageLength = getCurrentPages().length;


     urlPath= lastPage. __route__;
        switch (urlPath){
            case 'pages/specStyle/specStyle':
                wx.navigateBack({
                    delta: 1
                });
                break;
            case 'pages/taskList/taskList':
                wx.navigateTo({url: '/pages/specStyle/specStyle?bandId=' + this.data.bandId+'&' });
                break;
            default:
                wx.navigateBack({
                    delta: 1
                });
        }
    },

    // 页面转发功能
    onShareAppMessage: function (res) {
        let taskId = this.data.taskId;
        console.log(taskId);
        console.log(`/pages/transfer/transfer?taskId=${taskId}`)
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }

        return {
            title: `bigbench团队`,
            path: `/pages/transfer/transfer?taskId=${taskId}`,
            success: function (res) {
             console.log('转发成功')
            },
            fail: function (res) {
                // 转发失败，执行失败回调
            }
        }
    },


    // 获取编辑者信息
    getAuthorInfo:function () {
        let that = this;
        let taskId=this.data.taskId;
        this.request({
            url: `${config.domain}/app/tasks/task-owner`,
            method: 'GET',
            data:{
                id:taskId
            },
            success: function (d) {
                console.log(d.data.status);
                if(d.data.status.code===1000){
                    that.setData({
                        isAuthor:d.data.result
                    })
                }

            }
        })
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
                    that.getReaderData();
                    that.getAuthorInfo();
                    console.log(that)
                }

            }
        })

    },

    // 获取当前已读读者的信息

    getReaderData:function () {
        let taskId=this.data.curList.id;
        let that = this;
        this.request({
            url: `${config.domain}/app/tasks/readers/${taskId}`,
            method: 'GET',
            success: function (d) {
                let data=d.data;
                if(data.status.code===1000){
                    // 统计已读信息的人数和信息
                    that.setData({
                        readerInfo:data.result
                    });
                    console.log(data.result)
                }
            }
        })
    },

    // 点击查看大图
    handleLargeImg:function (e) {
         this.largerImage(e)
    },

    // 格式化上新时间
    formatCurDate: function (d) {
        const that = this;
        let createTime = d.createTime ? that.formatDate(d.createTime) : '';
        that.setData({
            createTime:createTime
        })
    },


    // 点击切换底部弹窗的按钮
    actionSheetbindchange: function () {
        this.setData({
            actionSheetHidden: !this.data.actionSheetHidden
        })

    },
    //
    loadByDelete: function () {
        this.setData({
            actionTxt: actionText.requireTxt,
            fixIcon: false,
            deleteFn: 'navigatorToTaskList'
        })
    },

    // 当用户点击编辑按钮的时候，修改input框的聚焦状态，提示用户输入文字

    handleEditContent: function () {
        console.log('获取input框的焦点啦');
        this.setData({
            focusFlag: true
        })

    },

    // 当用户点击修改时，跳转回当前款页面，
    navigatorToSpecStyle: function () {

        // this.judgeLastPage()

    // 修改fixMode的状态
        this.setData({
            fixMode:true,
            textAreaEdit:false,
            actionSheetHidden: true
        })
    },

    // 点击删除，删除当前任务，删除成功后跳转至任务列表页面
    navigatorToTaskList: function (e) {
        let lastPage=this.judgeRoute();
        console.log(lastPage);


        // 需要根据路由来判断是返回上一级页面还是选择跳转到任务列表页

        console.log('删除当前任务的内容');
        let taskId=this.data.curList.id;
        let that = this;
        this.request({
            url: `${config.domain}/app/tasks/${taskId}`,
            method: 'DELETE',
            success: function (d) {
                console.log(d.data.status);
                if (d.data.status.code === 1000) {
                    if(lastPage==='pages/taskList/taskList'){
                        console.log('啦啦啦啦');
                        wx.navigateBack({
                            delta: 1
                        });
                    }

                    wx.navigateTo({url: '/pages/taskList/taskList?' + util.jsonToParam(e.currentTarget.dataset)});
                }
            }
        })
    },

    // 点击取消按钮
    recoverDefaultStatus: function () {
        this.setData({
            actionTxt: actionText.fixTxt,
            fixIcon: true
        })
    },


    // 文本框失去焦点事件
    bindTextAreaBlur:function (event) {
        let value = event.detail.value;
        this.setData({
            opinionValue:value
        });
    },


    // 点击完成按钮，确认修改操作
    changeTask:function () {
        console.log('完成修改');
        const that=this;
        setTimeout(function () {
            let data = {
                bandId: that.data.bandId,
                photoId: that.data.photoId,
                content: that.data.opinionValue
            };
            // 新增任务接口 /app/tasks，需要参数
            //  1 bandId 波段ID
            //  2 photoId 图片ID
            //  3 content 任务内容
            //  4 保存成功之后，自动跳转到编辑任务页面
            that.request({
                url: `${config.domain}/app/tasks`,
                method: 'POST',
                data: data,
                success: function (d) {
                    console.log(d);
                    d = d.data;
                    console.log(d);
                    if (d.status.code === 1000) {
                        console.log('新增任务功能');
                        let taskId = d.result.taskId;
                        setTimeout(function () {
                            wx.showToast({
                                title: '成功',
                                icon: 'success'
                            });
                            that.setData({
                                fixMode:false,
                                textAreaEdit:true,
                                actionSheetHidden: true
                            });
                        }, 1000);

                    }
                }
            });
        },100);

    },

    //以逗号分隔截取字符串
    splitScene: function (scene) {
        let sceneArray;
        if (scene.indexOf(',') != -1) {
            sceneArray = scene.split(',');
            this.setData({
                taskId: sceneArray[0]
            });
        } else {
            // 页面参数缺失,请重新扫码
            wx.showToast({
                title: '页面参数缺失',
                icon: 'loading',
                duration: 2000
            });

        }
    },




});
Page(option);



