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
        isPickerShow: true
    },
    onLoad: function (option) {
        this.createDate();
        this.setData({
            years: years,
            year: date.getFullYear(),
            months: months,
            month: date.getMonth() + 1,
            days: days,
            day: date.getDate(),
            value: [9999, 1, 1],
            meetingId: option.meetingId,
            category: option.category
        });
        this.getCurDate();


        wx.setNavigationBarTitle({
            title: '创建波段',
        });
    },
    onShow: function () {

    },

    waveNameInput: function (e) {
        let value= this.trim(e.detail.value);
        this.setData({
            waveName: value
        })
    },
    //
    showPicker: function (e) {
        if (!this.data.waveName) {
            wx.showToast({
                title: '请先输入波段名',
                icon: 'loading',
                duration: 1000,
                mask: true
            });
        } else {
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

        // 在用户未点击的时候，获取到时间的当前的年月日
        // 在此处添加判断,当用户输入的waveName为空时，先让其输入波段名称，再点击完成
        if(!waveName){
            wx.showToast({
                title: '请输入波段名',
                icon: 'loading',
                duration: 1000,
                mask: true
            });
        }else {
            this.request({
                url: `${config.domain}/app/bands`,
                method: 'POST',
                data: {
                    name: waveName,
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
        }
    },
    bindChange: function (e) {
        const val = e.detail.value;
        this.setData({
            year: this.data.years[val[0]],
            month: this.data.months[val[1]],
            day: this.data.days[val[2]]
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
        console.log('标准时间');
        console.log(str);
        // 波段修改的时间
        this.setData({
            saleTime: str
        });
        console.log(str);
    },
    createDate: function (e) {
        for (let i = 2000; i <= date.getFullYear()+1; i++) {
            years.push(i)
        }

        for (let i = 1; i <= 12; i++) {
            months.push(i)
        }

        for (let i = 1; i <= 31; i++) {
            days.push(i)
        }
    }

});
Page(option);



