//app.js
App({
  onLaunch: function () {
    // 登录
    const that = this
    wx.login({
      success: res => {
        const code = res.code
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res)
        // 获取用户信息
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  this.globalData.userInfo = res.userInfo

                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res)
                  }

                  let userInfo = res.userInfo;
                  // this.globalData.userInfo = userInfo;
                  console.info(userInfo)
                  let {nickName, avatarUrl} = userInfo
                  //调用后端登录接口
                  wx.getLocation({
                    type: 'gcj02',
                    success(res) {
                      const {latitude, longitude} = res
                      wx.request({
                        method: 'POST',
                        url: `${that.globalData.site}/wechat/login`,
                        data: {
                          code: code,
                          nickName: nickName,
                          avatar: avatarUrl,
                          lat: latitude,
                          lng: longitude
                        },
                        success: function (res) {
                          // console.info('请求成功')
                          that.globalData.key = res.data.token
                          that.globalData.idnumber = res.data.idnumber
                          that.globalData.accessable = res.data.accessable || false
                          if(!that.globalData.accessable) {
                            wx.showToast({
                              title: '哎呀呀,不在服务区域哦',
                            })
                          }
                        }
                      })
                      // that.getEvents()
                    }})
                }
              })
            } else {
              console.log('else')
              wx.navigateTo({
                url: '/pages/privilege/index',
              })
            }
          }
        })
      },
      fail: res => {
        console.log(res)
      }
    })

  },
  globalData: {
    userInfo: null,
    key: '',
    site: 'http://129.204.241.109:8080',
    // site: 'http://localhost:8080',
    accessable: false
  }
})