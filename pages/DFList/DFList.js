const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {
        // 用户是否授权
        isAuthorization: false,
        selectList: [],
    },
    onLoad: function (option) {
        this.setData({
            bandId:option.bandId
        });
        this.getSelectData();
        this.getUserInfo();

    },
    getSelectData: function (e) {
        let that=this;
        this.request({
            url:`${config.domain}/app/designs/deep-fashion`,
            method:'GET',
            success:function (d) {
                let data=d.data.result.folders;
                console.log(data);
                if(data){
                    that.setData({
                        selectList:data
                    });
                    //  将精选集中的数据存储为app级别的数据，以便后边列表页读取
                    app.data.dfDate=data;
                }
            }
        });
    },
    navigatorToPictureList:function (e) {
        wx.navigateTo({url: '/pages/dfSpecList/dfSpecList?' + util.jsonToParam(e.currentTarget.dataset)});
    }

});
Page(option);



