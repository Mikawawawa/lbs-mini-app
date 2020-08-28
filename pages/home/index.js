//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    lastPoint: undefined,
    longitude: 0,
    latitude: 0,
    scale: 16,
    markers: [],
    map: {},
    app: {}
  },
  //事件处理函数
  onLoad: function () {
    this.init()
  },
  init: function () {

  },
  goEditor: function() {
    if(app.globalData.accessable) {
      wx.navigateTo({
        url: '../editor/index'
      })
    } else  {
      wx.showToast({
        title: '亲，不在服务区不能发件哦',
      })
    }
  },
  goGalance: function() {
    wx.switchTab({
      url: '../index/index'
    })
  },
  goMe: function() {
    wx.switchTab({
      url: '../me/index'
    })
  }
})
