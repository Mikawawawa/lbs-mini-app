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
    timer: undefined,
    lastPoint: undefined,
    longitude: 0,
    latitude: 0,
    scale: 16,
    markers: [],
    map: {},
    setting: {
      skew: 0,
      rotate: 0,
      showLocation: true,
      showScale: false,
      subKey: '',
      layerStyle: -1,
      enableZoom: false,
      enableScroll: false,
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
    this.setData({
      map: wx.createMapContext('myMap')
    })
    const timer = setInterval(() => {
      that.data.map.moveToLocation({
        fail(res) {
          console.log('fail', res)
        }
      })
    }, 15000)
    this.setData({
      timer
    })
    this.init()
  },
  onHide: function() {
    console.log('hide')
    if(this.data.timer) {
      clearInterval(this.data.timer)
    }
  },
  onShow: function() {
    this.init()
    
  },
  init: function () {
    const that = this
    
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        that.data.map.moveToLocation()
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
  getArea: function () {
    console.log(this)
  },
  bindregionchange: function (e) {
    if(e.type === 'begin') return
    this.getEvents()
  },
  getEvents: function() {
    const that = this
    this.data.map.getRegion({
      success: (res) => {
        // region
        const latitude = [res.southwest.latitude]
        const longitude = [res.southwest.longitude]
        if(res.northeast.latitude < res.southwest.latitude) 
          latitude.unshift(res.northeast.latitude)
        else 
          latitude.push(res.northeast.latitude)

        if(res.northeast.longitude < res.southwest.longitude) 
          longitude.unshift(res.northeast.longitude)
        else 
          longitude.push(res.northeast.longitude)
        
        wx.request({
          url: `${app.globalData.site}/post/lbs`,
          data: {
            lat: latitude,
            lng: longitude,
            key: app.globalData.key
          },
          method: "GET",
          success(res) {
            that.setData({
              markers: [...res.data.data.map(item => ({
                title: item.code,
                latitude: item.lat,
                longitude: item.lng
              }))]
            })
          }
        })
      }
    })
  }
})
