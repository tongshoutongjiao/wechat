const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {
        bgColor: '#7ed321',
        opinionTextArea: false,  // 切换按钮
        opinionValue: '',      // 编辑的内容
        handlerList: {}

    },
    onLoad: function (option) {
        this.getRandomColor();
    },
    // 随机背景颜色
    getRandomColor: function () {
        let defaultColor = ['#DDC4C4', '#C1BE88', '#D58D8D', '#A2C3AA', '#BAC4D6', '#A9A6D4'];
        return defaultColor[Math.round(Math.random() * 5)];
    },
//    点击发表意见,执行函数，显示出text-area
    issueOpinion: function () {
        console.log('点击发表修改意见');
        this.setData({
            opinionTextArea: true
        })
    },


// 点击转发，按钮，执行转发给朋友功能
    handleShareFriend: function () {
        console.log('转发至朋友圈')
    },


//  点击保存按钮，保存当前textArea中的内容
    handleSaveOpinion: function () {
        let self = this;
        let saveIcon = true;
        setTimeout(function () {
            self.getValue(saveIcon)
        }, 10)
    },

    // 失去焦点时，保存输入框中的值
    bindTextAreaBlur: function (event) {
        let value = event.detail.value;
        this.setData({
            opinionValue: value
        });
        this.getValue();
    },

    getValue: function (saveIcon) {
        // 当blurIcon 为true时
        let value = this.data.opinionValue;

        console.log(saveIcon);

        if (saveIcon === undefined) {
            //  仅仅失去焦点时
            console.log('失去焦点,暂停输入');
            return;
        } else {
            //  点击保存按钮时,
            //    1 弹出loading框，执行ajax函数，将用户输入的数据发送给后台
            //    2 保存成功后，关闭当前框

            console.log('点击保存按钮,保存数据');

            wx.showLoading({
                icon:'loading',
                title: '保存中',
            });


            let data= {
                bandId: this.data.bandId,
                photoId:this.dataphotoId,
                content:value
            };

            // 新增任务接口 /app/tasks，需要参数
            //  1 bandId 波段ID
            //  2 photoId 图片ID
            //  3 content 任务内容
            //  4 保存成功之后，自动跳转到编辑任务页面


            this.request({
                url: `${config.domain}/app/tasks`,
                method: 'POST',
                data:data,
                success: function (d) {
                    if(d.status.code==='1000'){
                        setTimeout(function(){
                            wx.showToast({
                                title: '成功',
                                icon: 'success'
                            });
                            /* wx.hideLoading();*/
                        },1000);

                        // 跳转到编辑任务页面
                        wx.navigateTo({url: '/pages/editStyle/editStyle?' + util.jsonToParam(e.currentTarget.dataset)});
                        this.setData({
                            opinionTextArea: false
                        })
                    }
                }
            });




        }


        console.log(value);
    },
//  点击切换输入框状态
    toggleTextArea: function () {
        console.log('收起输入框');
        this.setData({
            opinionTextArea: false
        })
    },

//  聚焦输入按钮
    bindTextFocus: function () {


    },

//     任务页面转发功能



});
Page(option);



