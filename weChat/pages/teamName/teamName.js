const util = require('../../utils/util');
const config = require('../../config');

const app = getApp();

const option = util.extend(util, {
    data: {
        isAuthorization: app.data.isAuthorization,
        seasonList: [],
        defaultFlag: true,
        hasGetDate: false,
        screenWidth: app.data.system.screenWidth,
        left: 0
    },
    onLoad: function (option) {

        // 设置title
        wx.setNavigationBarTitle({
            title: option.teamName,
        });

        // 波段数据
        this.setData({
            meetingId: option.meetingId,
            teamName: option.teamName,
            ownerName: option.ownerName
        });

        this.getListData();
    },
    onShow: function () {

        let curSeason = this.data.curSelectedSeason;
        curSeason ? this.getWaveDate(curSeason) : this.getListData();
    },
    createWaveName: function (e) {

        wx.navigateTo({url: '/pages/createWave/createWave?' + util.jsonToParam(e.currentTarget.dataset)});
    },

    // 跳转到款列表页面
    navigatorToStyleList: function (e) {
        console.log(e);

        wx.navigateTo({url: '/pages/styleList/styleList?' + util.jsonToParam(e.currentTarget.dataset)});
    },

    // 获取表头的数据
    getListData: function () {
        let metId = this.data.meetingId;
        const that = this;

        this.request({
            url: `${config.domain}/app/meetings/page/${metId}`,
            type: 'GET',
            success: function (d) {

                console.log('data');
                console.log(d.data.result);


                let data = d.data.result ? d.data.result : '',
                    sea = data.categorys,
                    curSeason = data.category,
                    ary = [];
                if (data) {
                    // 修改category下季节结构,方便添加点击效果
                    for (let key in sea) {
                        if (curSeason == sea[key]) {
                            ary.push({
                                index: key,
                                value: sea[key],
                                default: true,
                            });
                        } else {
                            ary.push({
                                index: key,
                                value: sea[key]
                            })
                        }
                    }

                    // 对bandList下边的上新时间修改
                    that.formatCurDate(data.bandList);

                    // 保存修改后的数据
                    that.setData({
                        seasonList: ary,
                        curSeason: curSeason,
                        waveData: data.bandList,
                        hasGetDate: true
                    });
                }
            }
        })

    },

    // 点击当前季节，清除默认样式,添加选中样式，以及获取相应的波段数据。
    selectSeason: function selectSeason(e) {

        let category = e.currentTarget.dataset.category;

        // 记录当前已经选中的季节样式，保存到data数据中
        this.setData({
            defaultFlag: false,
            selectIndex: e.currentTarget.dataset.index,
            curSelectedSeason: category
        });

        // 获取波段数据
        this.getWaveDate(category);
    },

    // 波段数据
    getWaveDate: function (category) {
        let that = this,
            meetingId = this.data.meetingId;

        // 根据点击不同的季度，传递不同的值，然后将返回的数据绑定在页面上
        this.request({
            url: `${config.domain}/app/meetings/categorys/${meetingId}/${category}`,
            method: 'GET',
            success: function (d) {

                // 对bandList下边的上新时间修改
                that.formatCurDate(d.data.result);

                // 保存调整后的数据
                that.setData({
                    waveData: d.data.result,
                    curSeason: category
                });

            }
        });
    },

    // 设置团队名称及团队成员列表
    setTeamName: function (e) {
        wx.navigateTo({url: '/pages/setTeamName/setTeamName?' + util.jsonToParam(e.currentTarget.dataset)});
    },

    // 格式化上新时间
    formatCurDate: function (d) {
        const that = this;
        d.forEach(function (item) {
            if(item.saleTime!=null){
                item.waveTime = that.formatDate(item.saleTime)
            }else {
                item.waveTime='';
            }

        })
    },

    // 点击左按钮，向左滑动
    scrollSeasonL: function () {
        if (this.data.left > 0) {
            let conWidth = this.data.screenWidth - 30;
            this.data.left -= conWidth / 4;
            this.setData({
                left: this.data.left
            });
        }
    },

    // 点击右按钮，向右滑动
    scrollSeasonR: function () {
        let conWidth = this.data.screenWidth - 30;
        if (this.data.left >= 0 && this.data.left <= 344) {
            this.data.left += conWidth / 4;
            this.setData({
                left: this.data.left
            });
        }
    },

   // 跳转到specStyle页面
    turnToSpecStyle:function (e) {
        wx.navigateTo({url: '/pages/specStyle/specStyle?' + util.jsonToParam(e.currentTarget.dataset)});
    }

});

Page(option);



