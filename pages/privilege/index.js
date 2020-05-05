//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    activities: [],
    userInfo: {},
    hasUserInfo: false,
    hasLocation: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onUnload() {
    this.login()
  },
  onLoad() {
    const that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          that.setData({
            hasUserInfo: true
          })
        }
        if (res.authSetting['scope.userLocation']) {
          that.setData({
            hasLocation: true
          })
        }
      }
    })
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  authLocation: function (e) {
    const that = this
    wx.authorize({
      scope: 'scope.userLocation',
      success() {
        that.setData({ hasLocation: true })
      },
      fail(res) {
        console.log('fail', res)
      }
    })
  },
  goback() {
    wx.switchTab({
      url: '/pages/home/index',
    })
  },
  login() {
    wx.login({
      success: res => {
        const code = res.code
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res)
        wx.getUserInfo({
          success: res => {
            // 可以将 res 发送给后台解码出 unionId
            app.globalData.userInfo = res.userInfo

            let userInfo = res.userInfo;
            // this.globalData.userInfo = userInfo;
            let { nickName, avatarUrl } = userInfo
            //调用后端登录接口
            wx.request({
              method: 'POST',
              url: `${app.globalData.site}/wechat/login`,
              data: {
                code: code,
                nickName: nickName,
                avatar: avatarUrl
              },
              success: function (res) {
                console.info('请求成功')
                app.globalData.key = res.data
                
              }
            })
          }
        })
      },
    })
  }
})
