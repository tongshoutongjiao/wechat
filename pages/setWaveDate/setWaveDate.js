const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();


const date = new Date();
const years = [];
const months = [];
const days = [];


const option = util.extend(util, {
    data: {
        // 用户是否授权
        isAuthorization: false,
        waveName: '',
        isPickerShow: false,
        actionSheetHidden: true,
        actionSheetItems: [
            {type: 'Delete', txt: '删除'}
        ],
    },
    onLoad: function (option) {
        this.createDate();
        this.setData({
            waveName: option.bandName,
            bandId: option.bandId,
            saleTime: option.saleTime,
            curSeason: option.category,
            years: years,
            months: months,
            days: days,
            value: [9999, 1, 1],
            meetingId: option.meetingId,
            category: option.category,
        });
        this.getLocalTime();
        this.getCurDate();
        wx.setNavigationBarTitle({
            title: '设置波段',
        });
    },
    waveNameInput: function (e) {
        this.setData({
            waveName: e.detail.value
        })
    },
    showPicker: function (e) {
        if (!this.data.waveName) {
            wx.showToast({
                title: '请先输入波段名',
                icon: 'loading',
                duration: 1000,
                mask: true
            });
        } else {
            console.log('laallal');
            this.setData({
                isPickerShow: true
            })
        }

    },
    // 创建波段
    createWaveName: function (e) {
        let that = this,
            waveName = this.data.waveName,
            category = this.data.category,
            meetingId = this.data.meetingId,
            saleTime = this.data.saleTime;

        this.request({
            url: `${config.domain}/app/bands`,
            method: 'PUT',
            data: {
                waveName: waveName,
                saleTime: saleTime,
                category: category,
                meetingId: meetingId
            },
            success: function (d) {
                console.log(d);
                wx.navigateBack({
                    delta: 1
                })
            }
        })
    },
    bindChange: function (e) {
        const val = e.detail.value;
        this.setData({
            year: this.data.years[val[0]],
            month: this.data.months[val[1]],
            day: this.data.days[val[2]],
            bandName: val
        });
        //  获取当前创造波段的时间
        this.getCurDate();
    },
    getCurDate: function () {
        let d = new Date(), str = null,
            year = this.addZero(this.data.year),
            month = this.addZero(this.data.month),
            day = this.addZero(this.data.day),
            hour = this.addZero(d.getHours()),
            min = this.addZero(d.getMinutes()),
            sec = this.addZero(d.getSeconds());
        str = `${year}-${month}-${day} ${hour}:${min}:${sec}`;

        // 波段修改的时间
        this.setData({
            saleTime: str
        });


        console.log(str);
    },
    createDate: function (e) {
        for (let i = 1990; i <= date.getFullYear()+6; i++) {
            years.push(i)
        }

        for (let i = 1; i <= 12; i++) {
            months.push(i)
        }

        for (let i = 1; i <= 31; i++) {
            days.push(i)
        }
    },

    // 将当前上新时间字符串转为北京时间，并拿到相应的年月日的值
    getLocalTime: function () {
        let time = this.data.saleTime;
        let n = time * 1;
        let date = new Date(n);
        let Y = date.getFullYear();
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        console.log(Y, M, D);
        this.setData({
            year: Y,
            month: M * 1,
            day: D * 1,
        })
    },
    finishSetWaveName: function () {
        console.log(this.data.waveName);
        console.log(this.data.saleTime);
        let that = this;
        this.request({
            url: `${config.domain}/app/bands/editors`,
            method: 'POST',
            data: {
                "id": this.data.bandId,
                "name": this.data.waveName,
                "saleTime": this.data.saleTime,
                "category": this.data.category
            },
            success: function (d) {
                console.log(d);
                wx.navigateBack({
                    delta: 2
                })
            }

        })

    },

    // 发送删除当前波段的请求
    deleteWaveName: function (bandId) {
        let that = this;
        this.setData({
            actionSheetHidden: !this.data.actionSheetHidden
        });
        this.request({
            url: `${config.domain}/app/bands/${bandId}`,
            method: 'DELETE',
            success: function (d) {
                console.log(d);
                wx.showToast({
                    title: '删除成功',
                    icon: 'success',
                    mask: true
                });
                // 删除成功，跳转到波段列表页
                wx.navigateBack({
                    delta: 2
                })
            }
        })
    },

    // 底部弹窗组件
    actionSheetTap: function (e) {
        this.setData({
            actionSheetHidden: !this.data.actionSheetHidden
        })
    },
    actionSheetbindchange: function () {
        this.setData({
            actionSheetHidden: !this.data.actionSheetHidden
        })
    },

    // 点击删除按钮，执行相应的删除细节图的操作
    loadByDelete: function () {
        let that = this,
            bandId = this.data.bandId;
        this.deleteWaveName(bandId);
    }
});
Page(option);


