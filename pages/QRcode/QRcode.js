/**
 * Created by zhaohailong on 2017/8/27.
 */

const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {},
    onLoad: function (option) {

        wx.setNavigationBarTitle({
            title: '团队二维码',
        });
        this.setData({
            meetingId:option.meetingId
        });
        this.getQRImg();
    },
    getQRImg:function () {
        const that=this;
        this.request({
            url:`${config.domain}/app/meeting/qr-code`,
            method:'GET',
            data:{
                meetingId:that.data.meetingId
            },
            success:function (d) {
                if(d.data.result){
                    let  qrUrl=d.data.result.codeUrl;
                    that.setData({
                        qrUrl:qrUrl
                    })
                }else{
                    return;
                }

            }
        })
        
    }
});
Page(option);



