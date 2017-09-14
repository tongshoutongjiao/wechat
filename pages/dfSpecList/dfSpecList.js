const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();
const option = util.extend(util, {
    data: {
        columns: [{
            index: 0,
            left: 25,
            top: 0,
            width: 350
        }, {
            index: 1,
            left: 375,
            top: 0,
            width: 350
        }],
        scrollTop: 0
    },
    onLoad: function (options) {

        let folderId = options.folderId;
        this.setData({
            folderId: folderId,
            folderName: options.folderName,
            bandId: options.bandId
        });
        // 从app data 中拿到相应的精选集数据
        console.log('app', folderId);
        this.getImgList(folderId);
        wx.setNavigationBarTitle({
            title: options.folderName,
        });
    },
    onShow: function () {

    },

    getImgList: function (id) {
        let data = app.data.dfDate,
            imgData,
            that = this;

        console.log('data');
        console.log(data);

        data.forEach(function (item) {
            if (item.folderId == id) {
                imgData = item;

                // 给当前图片添加一个是否选中的标识
                imgData.favorites.forEach(function (item, index) {
                    item.selected = false;
                    item.index = index;
                });
                that.waterFlow(imgData.favorites);
                that.setData({
                    imgList: imgData.favorites
                });
                return;
            }
        });
    },
    waterFlow: function (list) {
        let column,
            rate,
            columns = this.data.columns;
        list.forEach(function (item) {
            column = columns[0].top <= columns[1].top ? columns[0] : columns[1];
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
            column.top += item.boxHeight + 7.5;
        });
        console.log(list);
        return list;
    },
    addSelectIcon: function (e) {
        //    思路：点击当前图片，给元素增加一个类名，再次点击，则取消该样式
        console.log(e);


        let index = e.currentTarget.dataset.index,
            data = this.data.imgList[index];

        data.selected = !data.selected;

        console.log('data');
        console.log(data);


        console.log('index');
        console.log(index);

        this.setData({
            ['imgList[' + index + ']']: data
        });
    },

    // 点击完成，执行上传图片操作
    dfUpload: function () {
        //
        let bandId = this.data.bandId,
            data=this.data.imgList,
            selectList=[];


    //    将有选中样式的图片的url保存在一个数组对象中

        data.forEach(function (item,index) {
            item.selected?selectList.push({key:item.mediaUrl,name:'DF精选集上传'}):'';
        });
        this.getDesign(selectList);
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
//
    reloadCurPage:function () {
        wx.showToast({
            title: '图片上传成功',
            icon: 'success',
            duration: 1000
        });

        wx.navigateBack({
            delta: 2
        })
    }

});
Page(option);



