//index.js
//获取应用实例
import drawQrcode from '../../lib/qr'
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
  onLoad: function (options) {
    this.init()
    this.draw(options.code)
  },
  init: function () {
    if (app.globalData.userInfo) {
      console.log(app.globalData.userInfo)
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        idnumber: app.globalData.idnumber
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          idnumber: app.globalData.idnumber
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            idnumber: app.globalData.idnumber
          })
        }
      })
    }

  },
  draw: function(code) {
    drawQrcode({
      width: 200,
      height: 200,
      canvasId: 'myQrcode',
      text: JSON.stringify({
        code,
        user: app.globalData.key
      })
    })
  }
})
