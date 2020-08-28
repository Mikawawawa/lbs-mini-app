//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    index: 0,
    range: ['全体', '可提取', '已提取'],
    activities: [],
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    const that = this
    this.setData({
      idnumber: app.globalData.idnumber
    })

  },
  onShow: function () {
    this.getActivity()
  },
  bindPickerChange: function (e) {
    console.log(e)
    this.setData({
      ...this.data,
      index: e.detail.value
    })
    this.getActivity()
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    this.getActivity()
  },
  deleIt: function (e) {
    const that = this
    console.log(e)
    wx.request({
      url: `${app.globalData.site}/mailbox/dele`,
      data: {
        id: e.target.dataset.code
      },
      method: "POST",
      success(res) {
        that.getActivity()
      }
    })
  },
  getActivity: function (e) {
    const that = this
    wx.request({
      url: `${app.globalData.site}/mailbox/list`,
      method: "GET",
      data: {
        key: app.globalData.key,
        type: that.data.index,
      },
      success(res) {
        if (res.data.success) {
          const data = {
            activities: res.data.data.map(item => ({
              id: item.box.id,
              createAt: new Date(item.box.createdAt).toLocaleString(),
              code: item.article.code,
              images: item.article.checkedImg,
              content: item.article.raw,
              subject: (item.article.subject !== undefined && item.article.subject !== null) ? item.article.subject : item.article.raw.slice(0, 15),
              picked: item.box.picked,
              total: item.article.maxTimes,
              current: item.article.currentTimes
            }))
          }
          that.setData(data)
          console.log(data)
        }
      }
    })
  },
  goQr: function (e) {
    try {
      wx.navigateTo({
        url: `../qr/index?code=${e.currentTarget.dataset.code}`,
      })
    } catch (error) {

    }

  }
})
