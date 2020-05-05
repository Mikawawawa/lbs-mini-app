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
    map: {}
  },
  //事件处理函数
  onLoad: function () {

    this.init()
  },
  init: function () {

  },
  goEditor: function() {
    wx.navigateTo({
      url: '../editor/index'
    })
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
