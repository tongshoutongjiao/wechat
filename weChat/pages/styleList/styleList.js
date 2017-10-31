/**
 * Created by zhaohailong on 2017/8/25.
 */

const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {
        hasStyleDate: false,
        actionSheetHidden: true,
        specStyleData: [],
        tempFilePaths: '',
        designList: []
    },
    onLoad: function (option) {
        const that = this;
        let scene;
        console.log(option);
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
        // 调用回调函数,获取当前页面的款信息
        app.onReadyPage(this.getStyleList.bind(this));

        // 通过扫码进入加入款列表页面，先获取二维码中的scene值
        option.scene ? scene = decodeURIComponent(option.scene) : '';
        scene ? this.splitScene(scene, option) : this.setData({
            bandId: option.bandId,
            bandName: option.bandName,
            saleTime: option.saleTime,
            curSeason: option.category
        });

        option.bandName ? wx.setNavigationBarTitle({
            title: option.bandName,
        }) : '';
    },

    onShow: function () {

        // 调用回调函数,获取当前页面的款信息
        this.getStyleList();
    },

    actionSheetTap: function () {
        const that = this;

        // 上传图片的函数，可以将其写在公共的方法utils文件下
        wx.chooseImage({
            count: 9,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {

                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                let tempFilePaths = res.tempFilePaths,
                    bandId = that.data.bandId;

                //向后台发送请求，获取到上传oss所需要的信息
                that.getPolicy(tempFilePaths, bandId);
            }
        });
    },

    clickSelectedOnline: function (e) {
        //     从DF精选集筛选照片
        wx.navigateTo({url: '/pages/DFList/DFList?' + util.jsonToParam(e.currentTarget.dataset)});
    },

    // 获取OSS上传凭证和key列表
    getPolicy: function (picUrl, waveId) {
        let that = this;
        this.request({
            url: `${config.domain}/app/oss/get-policy`,
            method: 'GET',
            data: {
                prefix: waveId,
                number: picUrl.length
            },
            success: function (d) {
                let obj = d.data.result;
                obj.picUrl = picUrl;
                console.log('图片上传阿里云成功');
                console.log(obj);

                // 上传图片
                that.uploadImg(obj)
            }
        })
    },

    uploadImg: function (obj) {
        const that = this;

        // 获取到上传图片的后缀名，然后将其添加到keyList的后缀名中
        let picSuffix = [],
            keyListArray = [];
        obj.picUrl.forEach(function (item, index) {
            let afterName = item.substring(item.lastIndexOf('.') + 1),
                suffix = '.' + afterName;
            picSuffix.push(suffix);
        });
        obj.keyList.forEach(function (item, index) {
            item += picSuffix[index];
            keyListArray.push(item);
        });

        // 将拼接后的图片再次存放到 obj 对象中
        obj.keyListArray = keyListArray;
        obj.picUrl.forEach(function (item, index) {

            // 执行函数，分别将单张图片上传到阿里云,上传成功后，执行上传款的操作
            that.uploadSelectImg(obj, item, keyListArray[index])
        });

    },

    // 上传某张图片到阿里云oss
    uploadSelectImg: function (obj, curPic, curKeyList) {
        const that = this;
        wx.showToast({
            title: '图片上传中',
            icon: 'loading',
            duration: 2000
        });
        wx.uploadFile({
            url: obj.host,
            filePath: curPic,
            name: 'file',
            header: {"Content-Type": "multipart/form-data"},
            formData: {
                OSSAccessKeyId: obj.accessKeyId,
                signature: obj.signature,
                key: curKeyList,
                policy: obj.policy,
                success_action_status: obj.success_action_status
            },
            success: function (res) {
                let data = res.data;
                console.log(res);
                if (res.statusCode == '200') {
                    let styleData = [];
                    styleData.push({
                        key: curKeyList,
                        name: '小程序图片上传'
                    });
                    that.setData({
                        designList: styleData
                    });
                    // 上传款图片
                    that.getDesign(styleData)
                }
            }
        });

    },

    navigatorToSpecStyle: function (e) {
        console.log(e);
        wx.navigateTo({url: '/pages/specStyle/specStyle?' + util.jsonToParam(e.currentTarget.dataset)});
    },

    getStyleList: function () {
        let bandId = this.data.bandId,
            that = this;

        this.request({
            url: `${config.domain}/app/designs/${bandId}`,
            method: 'GET',
            success: function (d) {
                console.log('data');
                console.log(d);

                let data = d.data.result ? d.data.result : null;
                console.log(data);
                that.setData({
                    specStyleData: data,
                });
                if (data && data.length > 0) {
                    that.setData({
                        hasStyleDate: true,
                        bandName: data[0].bandName,
                        saleTime: data[0].saleTime,
                        curSeason: data[0].category
                    });
                    wx.setNavigationBarTitle({
                        title: data[0].bandName,
                    })
                } else {
                    that.setData({
                        hasStyleDate: false,
                    });
                }

            }

        });
    },

    // 跳转到设置波段的界面
    setWaveName: function (e) {
        wx.navigateTo({url: '/pages/setWaveDate/setWaveDate?' + util.jsonToParam(e.currentTarget.dataset)});
    },

    // 上传款图片,最多上传9张图片
    getDesign: function (designList) {
        let that = this;
        console.log('designList');
        console.log(designList);
        let data = {
            designList: designList,
            target: 2,
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

    // 上传成功后，执行回调函数，重新获取当前列表的数据
    reloadCurPage: function () {
        this.getStyleList();
    },

    //以逗号分隔截取字符串
    splitScene: function (scene, option) {
        let sceneArray;
        if (scene.indexOf(',') != -1) {
            sceneArray = scene.split(',');
            this.setData({
                bandId: sceneArray[0],
                bandName: sceneArray[1]
            });
        } else {
            this.setData({
                bandId: scene
            });
        }
    }

});
Page(option);



