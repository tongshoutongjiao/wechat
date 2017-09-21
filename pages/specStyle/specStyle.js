const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {
        actionSheetHidden: true,
        actionSheetItems: [
            {type: 'Delete', txt: '删除'}
        ],
    },
    onLoad: function (option) {
        console.log(option);
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
        // 加载页面
        wx.setNavigationBarTitle({
            title: '款页',
        });
        // 通过扫码进入加入团队页面，先获取二维码中的scene值
        option.scene ? scene = decodeURIComponent(option.scene) : '';

        // 判断是否使用二维码中传递的参数
        scene ? this.splitScene(scene) : this.setData({
          designId:option.designerId
        });

        app.onReadyPage(this.getStyleInfo());
    },
    // 调用接口获取当前主图和配图信息
    getStyleInfo: function () {
        let that = this,
            designId = this.data.designId;
        this.request({
            url: `${config.domain}/app/designs/details/${designId}`,
            method: 'GET',
            success: function (d) {
                let parStyle = d.data.result.mainInfo ? d.data.result.mainInfo : [],
                    childStyle = d.data.result.detailInfo ? d.data.result.detailInfo : [];
                childStyle.unshift(parStyle);
                // 设置请求到的数据
                childStyle.forEach(function (item, index) {
                    if (index == '0') {
                        item.isMain = true;
                    }
                    item.index = index;
                });
                console.log(parStyle);

                that.setData({
                    parStyle: parStyle,
                    childStyle: childStyle
                });
            }
        });
    },
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
    loadByDelete: function (e) {
        const that = this;

        // 思路：1 两个参数 第一个是photoID 及图片id，另一个就是是否是主图

        //      2 当该款下只有一张图片时，删除主图之后，直接跳转到上一个页面

        let isMain = e.currentTarget.dataset.isMain,
            photoId = e.currentTarget.dataset.id,
            childIcon = this.data.childStyle.length;
        if (childIcon == '1') {
            this.request({
                url: `${config.domain}/app/designs/details/${photoId}/${isMain}`,
                method: 'DELETE',
                success: function (d) {
                    that.setData({
                        actionSheetHidden: !that.data.actionSheetHidden
                    });
                    wx.navigateBack({
                        delta: 1
                    });
                }
            })
        } else {
            this.request({
                url: `${config.domain}/app/designs/details/${photoId}/${isMain}`,
                method: 'DELETE',
                success: function (d) {
                    that.setData({
                        actionSheetHidden: !that.data.actionSheetHidden
                    });
                    console.log('删除款');
                    that.getStyleInfo();
                }
            })
        }

    },

    // 点击添加图片按钮，从本地选择选择相应的细节图
    uploadDetailPic: function () {
        const that = this;
        wx.chooseImage({
            count: 9, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {

                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                let tempFilePaths = res.tempFilePaths,
                    bandId = that.data.designId,
                    picList = [];

                //向后台发送请求，获取到上传oss所需要的信息
                that.getPolicy(tempFilePaths, bandId);
            }
        });
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

                // 上传图片
                that.uploadImg(obj)
            }
        })
    },

    // 向服务器上传图片信息
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
                    //  上传款图片
                    that.getDesign(styleData)
                }
            }
        });
    },

    // 上传款图片,最多上传9张图片
    getDesign: function (designList) {
        let that = this;
        let data = {
            subPhotoList: designList,
            target: 2,
            source: 2,
            designId: that.data.designId
        };
        this.request({
            url: `${config.domain}/app/designs/upload-subgraph`,
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

    // 图片上传完成，调用该函数
    reloadCurPage: function () {
        this.getStyleInfo();
    },

    // 点击细节图，展示细节图的内容
    switchDetailPic: function (e) {

        // 思路：点击当前图片，得到当前图片的信息，
        //      将parStyle 中的内容替换为当前图片的内容，同时需要给当前图片增减一个key值，判断当前图片是否为主图.

        let index = e.currentTarget.dataset.index;
        this.setData({
            parStyle: this.data.childStyle[index]
        })
    },

    //以逗号分隔截取字符串
    splitScene: function (scene,option) {
        let sceneArray;
        if (scene.indexOf(',') != -1) {
            sceneArray = scene.split(',');
            this.setData({
                designId: sceneArray[0]
            });
        } else {
            this.setData({
                designId: scene
            });
        }
    }


});
Page(option);



