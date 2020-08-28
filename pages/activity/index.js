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
    console.log(e)
    const that = this
    wx.request({
      url: `${app.globalData.site}/post/dele`,
      data: {
        code: e.target.dataset.code
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
      url: `${app.globalData.site}/post/all`,
      method: "GET",
      data: {
        key: app.globalData.key,
        needCheck: false
      },
      success(res) {
        if(res.data.success) {
          that.setData({
            activities: res.data.data.map(item => ({
              createAt: new Date(item.createdAt).toLocaleString(),
              code: item.code,
              images: JSON.parse(item.images).length > 0 ? JSON.parse(item.images)[0] : undefined,
              content: item.raw
            }))
          })
          console.log(res.data.data)
        }
      }
    })
  }
})
