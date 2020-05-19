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
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    const that = this
    this.setData({
      idnumber: app.globalData.idnumber
    })
    if (app.globalData.userInfo) {
      console.log(app.globalData.userInfo)
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  onShow: function() {
    this.getActivity()
  },
  bindPickerChange: function(e) {
    console.log(e)
    this.setData({
      ...this.data,
      index: e.detail.value
    })
    this.getActivity()
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    this.getActivity()
  },
  deleIt: function(e) {
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
  getActivity: function(e) {
    const that = this
    wx.request({
      url: `${app.globalData.site}/mailbox/list`,
      method: "GET",
      data: {
        key: app.globalData.key,
        type: that.data.index,
      },
      success(res) {
        if(res.data.success) {
          that.setData({
            activities: res.data.data.map(item => ({
              id: item.box.id,
              createAt: new Date(item.box.createdAt).toLocaleString(),
              code: item.article.code,
              images: JSON.parse(item.article.images),
              content: item.article.raw,
              picked: item.box.picked
            }))
          })
          console.log(res.data.data)
        }
      }
    })
  }
})
