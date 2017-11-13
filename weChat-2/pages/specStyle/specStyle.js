const config = require('../../config');
const util = require('../../utils/util');
const app = getApp();

const option = util.extend(util, {
    data: {
        opinionTextArea: false,  // 切换按钮
        opinionValue: '',      // 编辑的内容
        layerFlag: false,
        handlerList: {}
    },
    onLoad: function (option) {

        this.setData({
            photoId: '',
            isMain: true
        });
        const that = this;
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
        // 加载页面
        wx.setNavigationBarTitle({
            title: '款页',
        });
        // 通过扫码进入加入团队页面，先获取二维码中的scene值
        option.scene ? scene = decodeURIComponent(option.scene) : '';

        // 判断是否使用二维码中传递的参数
        scene ? this.splitScene(scene) : this.setData({
            designId: option.designerId,
            bandId: option.bandId
        });

        app.onReadyPage(this.getDesignData.bind(this));
        app.onReadyPage(this.getUserInfo.bind(this));
        this.getRandomColor();
    },

    // 获取当前用户信息
    getUserInfo: function () {
        let that = this;
        wx.getUserInfo({
            success: function (resUser) {
                that.setData({
                    userData: resUser.userInfo,
                    nickName: resUser.userInfo.nickName,
                    userPhoto: resUser.userInfo.avatarUrl
                });
            }
        })
    },

    // 获取该款下的详细子图信息
    getDesignData: function () {
        let that = this,
            designId = this.data.designId;
        this.request({
            url: `${config.domain}/app/designs/details/${designId}`,
            method: 'GET',
            success: function (d) {
                let parStyle = d.data.result.mainInfo ? d.data.result.mainInfo : [],
                    childStyle = d.data.result.detailInfo ? d.data.result.detailInfo : [];

                parStyle.bg = that.getRandomColor();
                childStyle.unshift(parStyle);

                // 设置请求到的数据
                childStyle.forEach(function (item, index) {
                    if (index == '0') {
                        item.isMain = true;
                    }
                    item.bg = that.getRandomColor();
                    item.index = index;
                });
                console.log(parStyle);

                that.setData({
                    parStyle: parStyle,
                    childStyle: childStyle,
                    photoId: parStyle.id,
                    isMain: parStyle.isMain
                });
            }
        });


    },

    // 切换细节图
    switchDetailPic: function (e) {
        // 思路：点击当前图片，得到当前图片的信息，
        //      将parStyle 中的内容替换为当前图片的内容，同时需要给当前图片增一加个key值，判断当前图片是否为主图.
        let index = e.currentTarget.dataset.index;
        this.setData({
            parStyle: this.data.childStyle[index]
        });

        this.setData({
            photoId: this.data.childStyle[index].id,
            isMain: this.data.childStyle[index].isMain,
        })
    },

//    点击发表意见,执行函数，显示出text-area
    issueOpinion: function () {
        this.setData({
            opinionTextArea: true
        })
    },

//  点击保存按钮，保存当前textArea中的内容
    handleSaveOpinion: function (e) {
        let self = this;
        let saveIcon = true;
        setTimeout(function () {
            self.getValue(e, saveIcon)
        }, 10)
    },

    // 失去焦点时，保存输入框中的值
    bindTextAreaBlur: function (event) {
        let value = event.detail.value;
        this.setData({
            opinionValue: value
        });
        this.getValue(event);
    },

    getValue: function (e, saveIcon) {
        // 当blurIcon 为true时
        let value = this.data.opinionValue;


        if (saveIcon === undefined) {
            //  仅仅失去焦点时
            console.log('失去焦点,暂停输入');
            return;
        } else {
            if (!value) {
                wx.showToast({
                    title: '请输入内容',
                    icon: 'loading',
                    duration: 2000
                })
            } else {
                wx.showToast({
                    icon: 'loading',
                    title: '保存中',
                    duration: 1000
                });
                let data = {
                    bandId: this.data.bandId,
                    photoId: this.data.photoId,
                    content: value
                };

                // 新增任务接口 /app/tasks，需要参数
                //  1 bandId 波段ID
                //  2 photoId 图片ID
                //  3 content 任务内容
                //  4 保存成功之后，自动跳转到编辑任务页面
                this.request({
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
                                console.log(taskId);
                                // 跳转到编辑任务页面
                                wx.navigateTo({url: `/pages/styleIntro/styleIntro?${util.jsonToParam(e.currentTarget.dataset)}&taskId=${taskId}`});
                            }, 1000);


                        }
                    }
                });

            }


        }

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


//    点击添加功能，上传款下的细节图
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
        this.getDesignData();
    },

    //以逗号分隔截取字符串
    splitScene: function (scene) {
        let sceneArray;
        if (scene.indexOf(',') != -1) {
            sceneArray = scene.split(',');
            this.setData({
                designId: sceneArray[0],
                bandId: sceneArray[1]
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

//    点击图片，显示出遮罩层
    handleLayer: function () {
        console.log('显示遮罩层');
        this.setData({
            layerFlag: true,
            opinionTextArea: false

        })
    },
    // 点击取消
    cancelDelete: function () {
        this.setData({
            layerFlag: false
        })


    },
    // 点击删除
    handleDelete: function (e) {
        console.log('开始执行删除操作');

        const that = this;

        // 思路：1 两个参数 第一个是photoID 及图片id，另一个就是是否是主图

        // 2 当该款下只有一张图片时，删除主图之后，直接跳转到上一个页面
        let isMain = this.data.isMain,
            photoId = this.data.photoId,
            childIcon = this.data.childStyle.length;

        console.log(photoId, isMain);

        if (childIcon == '1') {
            this.request({
                url: `${config.domain}/app/designs/details/${photoId}/${isMain}`,
                method: 'DELETE',
                success: function (d) {

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
                        layerFlag: false,
                    });
                    that.getDesignData();
                }
            })
        }


    }
});
Page(option);



