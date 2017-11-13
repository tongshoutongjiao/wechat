const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {
        // 用户是否授权
        isAuthorization: false,
        selectList: [],
        columns: [{
            index: 0,
            left: 0,
            top: 0,
            width: 350
        }, {
            index: 1,
            left: 375,
            top: 0,
            width: 350
        }]
    },
    onLoad: function (option) {
        this.setData({
            bandId: option.bandId,
        });

        this.getSelectData();
        this.getUserInfo();
    },
    getSelectData: function (e) {
        let that = this;
        this.request({
            url: `${config.domain}/app/designs/deep-fashion`,
            method: 'GET',
            success: function (d) {

                let data = d.data.result.folders;
                if (data) {
                    that.setData({
                        hasSelectData:true

                    });

                    // 遍历data中的每一项，对data中的数据图片进行修改
                    let dataFixed = that.fixFavoriteImg(data);
                    that.setData({
                        selectList: dataFixed
                    });
                    // 图片列表页
                    //  将精选集中的数据存储为app级别的数据，以便后边列表页读取
                    app.data.dfDate = data;
                }else {
                    that.setData({
                        hasSelectData:false
                    })
                }
            }
        });
    },


    // 瀑布流函数
    waterFlow: function (parData, list) {
        const that = this;
        let column,
            rate;
        // 遍历favorite中的每一项
        list.forEach(function (item,index) {
            item.selected=false;
            item.index=index;

            item.bg=that.getRandomColor();

            column = parData.columns[0].top <= parData.columns[1].top ? parData.columns[0] : parData.columns[1];

            // 宽高比
            rate = item.width && item.height ? item.width / item.height : 1;

            // 图片尺寸，容器尺寸
            item.boxWidth = column.width;
            item.imageWidth = column.width;
            item.imageHeight = item.imageWidth / rate;
            item.boxHeight = item.imageHeight + 80;

            // 定位
            item.top = column.top;
            item.left = column.left;

            // 下一个item 定位top值
            column.top += item.boxHeight + 8;
        });
        parData.maxHeight = Math.max(parData.columns[0].top, parData.columns[1].top) + 30;
        return list;
    },

    // 选择样式按钮

    addSelectIcon: function (e) {

        // 思路：点击当前图片，给元素增加一个类名，再次点击，则取消该样式
        let index = e.currentTarget.dataset.index,
            selectIndex=e.currentTarget.dataset.selectIndex,
            data = this.data.selectList[selectIndex].favorites[index];
        data.selected = !data.selected;
        this.setData({
          [`selectList[${selectIndex}].favorites[${index}]`]: data
        });
    },

    // 修改data精选集图片中的信息

    fixFavoriteImg: function (data) {
        const that = this;
        let setWidth=that.data.setWidth;
        data.forEach(function (item, index) {
            // 初始化当前精选集图片的列表样式
            item.index=index;

            item.columns = [{
                index: 0,
                left: 0,
                top: 0,
                width: 350,
            }, {
                index: 1,
                left: 350,
                top: 0,
                width: 350
            }];
            that.waterFlow(item, item.favorites);
        });
        return data;
    },

    // 点击完成，执行上传图片操作

    dfUpload: function () {

        let data = this.data.selectList,
            imgList = [];

        // 将有选中样式的图片的url保存在一个数组对象中
        data.forEach(function (item, index) {
            item.favorites.forEach(function (item,index) {
                item.selected ? imgList.push({key: item.mediaUrl, name: 'DF精选集上传'}) : '';
            });
        });
        imgList.length?this.getDesign(imgList):''
    },

    // 上传款图片,最多上传9张图片

    getDesign: function (designList) {
        let that = this;
        let data = {
            designList: designList,
            target: 1,
            source: 2,
            bandId: that.data.bandId
        };
        this.request({
            url: `${config.domain}/app/designs/upload-design`,
            method: 'POST',
            data: {
                data: JSON.stringify(data)
            },
            success: function (res) {
                // 此处执行回调函数，将本地图片加载到当前页面上
                  that.reloadCurPage();
            }
        })
    },

    // 图片上传成功回调函数

    reloadCurPage: function () {
        wx.showToast({
            title: '图片上传成功',
            icon: 'success',
            duration: 1000
        });
        wx.navigateBack({
            delta: 1
        })
    }
});
Page(option);



