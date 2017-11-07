const config = require('./config');

const option = extend(require('./utils/readyEvent'), {
    data: {
        // 用户是否授权，默认为false
        isAuthorization: false,
        userInfo: null,
        system: null,
        hasGetUserInfo: false,
    },
    onLaunch: function () {
        // 登录小程序
        this.bigBenchLogIn();

        // 获取设备信息
        try {
            this.data.system = wx.getSystemInfoSync()
        } catch (e) {
            console.log(e)
        }
        console.log(this);
    },

    /*
     *获取code
     *
     * */
    bigBenchLogIn: function () {
        const that = this;
        //    调用登录接口
        wx.login({
            success: function (res) {
                if (res.code) {
                    console.log(res);
                    //发起网络请求
                    console.log(res);
                    that.getUserInfo(res.code);
                } else {
                    that.loadFail();
                }
            },
            fail: function (err) {
                that.loadFail('微信登陆', err.errMsg);
            }
        });
    },

// 获取sessionStr
    getSessionStr: function (code, resUser) {
        const that = this;
        let {encryptedData, iv} = resUser;
        wx.request({
            url: config.domain + '/app/login/session',
            method: 'POST',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                code: code,
                iv: iv,
                encryptedData: encryptedData
            },
            success: function (response) {
                let res = response.data;
                if (res) {
                    // token
                    that.data.sessionStr = res.result;
                    that.__userLoginSuccess();
                }
            },
            fail: function (err) {
                that.loadFail('请求sessionStr失败');
                console.error('getSessionStr fail', err.errMsg);
            }
        });

    },

// 失败回调
    loadFail: function (errMessage = '登陆失败') {
        this.data.loadSuccess = false;
        wx.showToast({
            title: errMessage,
            icon: 'loading'
        });
        this.triggerReady();
    },

// 获取到sessionStr之后的登录状态
    __userLoginSuccess: function () {
        const that = this;
        that.data.isLogining = that.data.loadSuccess = void(0);
        that.triggerReady();
    },

// 获取用户信息
    getUserInfo: function (code) {
        let that = this,
            userData;
        wx.getUserInfo({
            withCredentials: true,
            success: function (resUser) {
                // 保存用户信息，同时将获取到的用户信息发送给后台
                that.data.userInfo = resUser.userInfo;
                that.getSessionStr(code, resUser);
                userData = resUser.userInfo;
            }, fail: function () {
                that.loadFail();
            }
        });
    },
    request: function (obj) {
        const that = this,
            originalSuccess = obj.success,
            originalComplete = obj.complete;
        if (typeof obj === 'object') {
            obj.header = obj.header || {};
            // sessionStr
            obj.header['Token'] = that.data.sessionStr;
            obj.method === 'POST' && !obj.header['Content-Type'] && !obj.header['content-type'] &&
            (obj.header['Content-Type'] = 'application/x-www-form-urlencoded');
            obj.success = function (response) {
                // console.log(response.data.status.code);
                if (response.data.status.code == '1003') {
                    that.data.isLogining = true;
                } else {
                    if (config.debug) {
                        response.statusCode != 200 &&
                        wx.showToast({
                            title: 'code' + response.statusCode + '\nURL:' + obj.url + '\n' + response.errMsg,
                            icon: 'loading',
                            duration: 5000
                        });
                    }
                    originalSuccess && originalSuccess.call(null, response);
                }
            };

            obj.complete = function () {
                originalComplete && originalComplete.call(null, arguments)
            };
            config.debug && !obj.fail && (obj.fail = function (err) {
                wx.showToast({
                    title: '请求失败 URL:' + obj.url + err.errMsg,
                    icon: 'loading',
                    duration: 5000
                });
            });
            return that.data.isLogining ? false : (wx.request(obj), true);
        } else {
            return false;
        }
    }

});
function extend() {
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const target = {};
    for (let i = 0; i < arguments.length; i++) {
        let source = arguments[i];
        for (let key in source) {
            target[key] = source[key]
        }
    }
    return target;
}

App(option);