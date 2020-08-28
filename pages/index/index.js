//index.js
//获取应用实例
const app = getApp()

function throttle(fn, gapTime = 1000) {
  let _lastTime = null
  return function (e) {
    let _nowTime = + new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn(e)
      _lastTime = _nowTime
    }
  }
}

Page({
  data: {
    enableTable: {},
    timer: undefined,
    lastPoint: undefined,
    currentLat: 0,
    currentLng: 0,
    longitude: 0,
    latitude: 0,
    scale: 17,
    markers: [],
    map: {},
    hold: false,
    setting: {
      skew: 0,
      rotate: 0,
      showLocation: true,
      showScale: false,
      subKey: '',
      layerStyle: -1,
      enableZoom: true,
      enableScroll: true,
      enableRotate: false,
      showCompass: false,
      enable3D: false,
      enableOverlooking: false,
      enableSatellite: false,
      enableTraffic: false,
    }
  },
  //事件处理函数
  onLoad: function () {
    const that = this
    const map = wx.createMapContext('myMap')
    this.setData({ map })
    // this.init()
    // setTimeout(() => {
    //   map.moveToLocation()

    // }, 1000)
    // this.updateCurrent(true)
    // this.init()
  },
  onHide: function () {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },
  onShow: function () {
    console.log('onshow')
    const that = this
    // this.updateCurrent(true)
    const timer = setInterval(() => {
      that.updateCurrent()
    }, 10000)
    this.setData({
      timer
    })
    this.init()
  },
  init: function () {
    const that = this
    // this.data.map.moveToLocation()
    this.updateCurrent(true)
  },
  bindregionchange: function (e) {
    const that = this
    console.log(e.type)
    if (e.type === 'begin') return

    that.getEvents()

  },
  bindmarkertap: function (e) {
    const target = this.data.markers.find(elem => elem.id === e.detail.markerId)
    const [deltaLat, deltaLng] = [target.latitude - this.data.currentLat, target.longitude - this.data.currentLng]
    // console.log(Math.max( deltaLng))
    if (app.globalData.accessable && Math.max(111314 * deltaLng * Math.cos(this.data.currentLng + 0.5 * deltaLng), 110950 * deltaLat) < 5000) {
      setTimeout(() => {
        wx.setClipboardData({
          data: e.detail.markerId,
        })
      }, 300)
      console.log(e)
      wx.request({
        url: `${app.globalData.site}/mailbox/add`,
        data: {
          msgId: e.markerId,
          key: app.globalData.key
        },
        method: "POST"
      })
    } else {
      wx.showToast({
        title: '请移动到该动态附近再试噢~',
      })
    }
  },
  getEvents: function () {
    console.log('here')
    const that = this
    if (that.data.hold === true) return
    that.setData({
      hold: true
    })
    setTimeout(() => {
      that.setData({ hold: false })
    }, 1000)
    this.data.map.getRegion({
      success: (res) => {
        // region
        const latitude = [res.southwest.latitude]
        const longitude = [res.southwest.longitude]
        if (res.northeast.latitude < res.southwest.latitude)
          latitude.unshift(res.northeast.latitude)
        else
          latitude.push(res.northeast.latitude)

        if (res.northeast.longitude < res.southwest.longitude)
          longitude.unshift(res.northeast.longitude)
        else
          longitude.push(res.northeast.longitude)
        const enableTitle =
          (that.data.currentLat < latitude[1] && that.data.currentLat > latitude[0]) && (that.data.currentLng < longitude[1] && that.data.currentLng > longitude[0])
        // console.log(this.data.currentLat, this.data.currentLng)
        wx.request({
          url: `${app.globalData.site}/post/lbs`,
          data: {
            lat: latitude,
            lng: longitude,
            key: app.globalData.key
          },
          method: "GET",
          success(res) {
            const enableTable = {}
            const _markers = [...res.data.data.map(item => {
              enableTable[item.code] = enableTitle
              return {
                id: item.code,
                // title: enableTitle && app.globalData.accessable ? `点击复制提取码：\n${item.code}` : '请移动到该动态附近再试哦~',
                title: '点击尝试获取该动态',
                latitude: item.lat,
                longitude: item.lng,
                enable: enableTitle
              }
            })]
            that.setData({
              markers: _markers,
              enableTable: { ...that.data.enableTable, ...enableTable }
            })
          }
        })
      }
    })
  },
  updateCurrent(move) {
    const that = this
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        const { latitude, longitude } = res
        if (move === true) {
          that.data.map.moveToLocation({
            latitude,
            longitude,
          })
          that.setData({
            currentLat: latitude,
            currentLng: longitude
          })
        }
        that.setData({
          currentLat: latitude,
          currentLng: longitude
        })
        // that.getEvents()
      },
      fail() {
        wx.showModal({
          title: '定位失败',
          content: '请重新授权位置权限，以提供服务',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success(res) {
                  that.init()
                  // res.authSetting = {
                  //   "scope.userInfo": true,
                  //   "scope.userLocation": true
                  // }
                }
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
              wx.navigateBack({
                delta: 0
              })
            }
          }
        })
      }
    })
  },
  goMe: function () {
    wx.navigateTo({
      url: '../me/index'
    })
  },
  goEditor: function () {
    if (app.globalData.accessable) {
      wx.navigateTo({
        url: '../editor/index'
      })
    } else {
      wx.showToast({
        title: '亲，不在服务区不能发件哦',
      })
    }
  },
  refresh: function () {
    this.data.map.moveToLocation()
  }
})
