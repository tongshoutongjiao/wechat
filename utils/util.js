/**
 * Created by zhaohailong on 2017/8/22.
 */

"use strict";

const config = require('../config');


// 注：由于此处依赖app
// 因此必须在小程序完成之后才可以调用此文件
// 不要在app.js中调用此文件
const app = getApp();
!app.data.system && (app.data.system = wx.getSystemInfoSync());
exports.app = app;

/**
 * 对于ajax函数的封装
 * @param obj
 */
exports.request = function (obj) {
    app.request(obj);
};

// extend

const hasOwnProperty = Object.prototype.hasOwnProperty;

exports.extend = function () {
    const target = {};
    for (let i = 0; i < arguments.length; i++) {
        __extend(target, arguments[i])
    }
    return target;
};


// __extend();

function __extend(target, source) {
    for (let key in source) {
        if (!hasOwnProperty.call(source, key)) break;
        if (typeof source[key] === 'object') {
            target[key] = typeof target[key] === 'object' ? target[key] : {};
            __extend(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}

/**
 * json to param
 * @param json
 * @returns {string}
 */
exports.jsonToParam = function (json) {
    let param = [];
    for (let i in json) {
        param.push(i + '=' + (typeof json[i] === 'object' ? JSON.stringify(json[i]) : json[i]));
    }
    return param.join('&');
};

//     数字补零操作

exports.addZero = function (num) {
    let res = num * 1 < 10 ? '0' + num : num;
    return res
};

// 获取成员信息

exports.getMemberInfo = function (meetingId) {
    let that = this;
    this.request({
        url: `${config.domain}/app/meetings/users/${meetingId}`,
        method: 'GET',
        success: function (response) {
            let memberDate = response.data.result ? response.data.result : [];
            that.setData({
                memberList: memberDate
            });
            console.log('memberDate');
            console.log(memberDate);
        }

    })
};

// 获取用户信息
exports.getUserInfo = function () {
    let that = this;
    wx.getUserInfo({
        success: function (resUser) {
            console.log('resUser');
            that.setData({
                userData: resUser.userInfo
            })
        }
    })
};

// 格式化时间戳
exports.formatDate = function (obj) {
    let date = new Date(obj);
    let y = 1900 + date.getYear();
    let m = "0" + (date.getMonth() + 1);
    let d = "0" + date.getDate();
    return y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length);
};

// trim

exports.trim = function (a) {
    
    // 想办法将中间的多个空格替换为1个
    let regStart = /^\s+/, regEnd = /\s+$/,regMid= /\s+/g;
    return a.replace(regStart, '').replace(regMid,' ').replace(regEnd, '');
};



