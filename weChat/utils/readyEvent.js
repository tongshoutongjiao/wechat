/**
 * Created by zhaohailong on 2017/8/22.
 */
module.exports = {
    isReady: false,
    handlerList: [],


    // 小程序系统已获取 sessionStr
    onReadyPage: function (callback) {
        if (typeof callback !== 'function') return;
        if (this.isReady) {
            if (callback() === false) {
                this.isReady = false;
                this.handlerList.push(callback);
            }
        } else {
            this.handlerList.push(callback);
        }
    },
    // 执行 handlerList 队列里的函数
    triggerReady: function () {
        this.isReady = true;
        for (let i = 0, len = this.handlerList.length, bool; i < len; i++) {
            bool = this.handlerList[i]();
            if (bool === false) return this.isReady = false;
            this.handlerList[i] = this.noFunc;
        }
        this.handlerList.length = 0;
    },

    noFunc: function () {}
};
