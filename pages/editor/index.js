//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    content: "",
    files: [],
    recorderDuration: 12,
    recorderManager: null,
    recording: false,
    recordPath: null,
    successFiles: [],
    uplaodFile: undefined,
    array: ['地图', '随机', '定向'],
    typeArray: ['NORMAL', 'RANDOM', 'AIM'],
    index: '0',
    userInputValue: '',
    targetUser: undefined,
    hasUser: false
  },
  onLoad() {
    this.setData({
      uplaodFile: this.uplaodFile.bind(this)

    })
  },

  bindKeyInput: function (e) {
    this.setData({
      userInputValue: e.detail.value
    })
  },
  resetTarget: function() {
    this.setData({
      targetUser: undefined,
      hasUser: false
    })
    console.log(this.data)
  },
  checkTarget: function() {
    const that = this
    wx.request({
      url: `${app.globalData.site}/user/check`,
      method: "GET",
      data: {
        number: that.data.userInputValue
      },
      success(res) {
        try {
          if(res.data.success === false && res.data.data === null) {
            wx.showToast({
              title: '用户不存在',
              success: false
            })
            return
          } else {
            that.setData({
              hasUser: true,
              targetUser: {
                key: res.data.data.token,
                avatar: res.data.data.avatar,
                nickname: res.data.data.nickname.length <= 1 ? res.data.data.nickname + "**" : `${res.data.data.nickname.slice(0, 1)}***${res.data.data.nickname.slice(-1)}`
              }
            })
          }  
        } catch (error) {
          wx.showToast({
            title: '用户不存在',
            success: false
          })
        }
      },
    })
  },

  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
      }
    })
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },

  uplaodFile(files) {
    const tempFilePaths = files.tempFilePaths[0]
    // 文件上传的函数，返回一个promise
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${app.globalData.site}/upload`,
        filePath: tempFilePaths,
        name: 'files',
        timeout:30000,
        header: {
          'content-type': 'multipart/form-data'
        },
        success: (res) => {
          const data = JSON.parse(res.data)
          try {
            let urls = [data.data[0].url]
            // 格式： {urls: ["后端返回的图片地址"]}
            resolve({ urls: urls })
          } catch (error) {
            reject('error')
          }

        },
        fial: (error) => {
          console.log(error)
          reject('error')
        }
      })
    })
  },
  uploadError(e) {
    console.log('upload error', e.detail)
    wx.showToast({
      title: '上传失败',
    })
  },
  uploadSuccess(e) {
    this.setData({
      successFiles: [
        ...this.data.successFiles,
        e.detail.urls[0]
      ]
    })
  },
  recordStart() {
    const that = this

    let recorderManager
    if(this.data.recorderManager === null) {
      recorderManager = wx.getRecorderManager()
      this.setData({
        recorderManager,
        recording: true
      })
    } else {
      recorderManager = this.data.recorderManager
      this.setData({
        recording: true
      })
    }

    recorderManager.start({
      duration: 1000 * 30,
      format: 'mp3'
    })

    recorderManager.onStop(function({tempFilePath, duration}) {
      if(duration < 2000) {
        wx.showToast({
          title: '录音时间小于2秒，请重试',
          image: '../../assets/warning.png'
        })
        return 
      }
      that.setData({
        recorderDuration: (duration / 1000).toFixed(2)
      })
      wx.uploadFile({
        url: `${app.globalData.site}/upload`,
        filePath: tempFilePath,
        name: 'files',
        timeout:30000,
        header: {
          'Content-Type': 'multipart/form-data'
        },
        success: (res) => {
          const data = JSON.parse(res.data)
          console.log(data)
          try {
            let url = data.url
            // 格式： {urls: ["后端返回的图片地址"]}
            that.setData({
              recordPath: url
            })
          } catch (error) {
            console.log(error)
            wx.showToast({
              title: '上传失败，请稍后再试',
            })
          }

        },
        fial: (error) => {
          console.log(error)
        }
      })
    })
  },
  recordStop() {
    this.data.recorderManager.stop()
    this.setData({
      recording: false
    })
  },
  recordPlay() {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true
    innerAudioContext.src = this.data.recordPath
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
  recordCancel() {
    this.setData({
      recordPath: null,
      recording: false,
    })
  },
  bindSubject(e) {
    this.setData({
      subject: String(e.detail.value)
    })
  },
  bindFormSubmit(e) {
    this.setData({
      content: String(e.detail.value)
    })
  },
  submit(e) {
    const that = this

    wx.getLocation({
      type: 'gcj02',
      success(res) {
        console.log(that.data.typeArray[parseInt(that.data.index)])
        const {latitude, longitude} = res
        wx.request({
          url: `${app.globalData.site}/post/write`,
          method: "POST",
          data: {
            secret: that.data.index === '2' ? true:false,
            raw: that.data.content,
            key: app.globalData.key,
            lat: latitude,
            lng: longitude,
            type: that.data.typeArray[parseInt(that.data.index)],
            subject: that.data.subject,
            images: that.data.successFiles,
            targetUser: that.data.targetUser,
            audio: that.data.recordPath
          },
          success() {
            wx.showToast({
              title: '发布成功',
              success: true
            })
            setTimeout(() => {
              wx.navigateBack({url: "pages/home/index"})
            }, 1500)
          }
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
    // console.log(this.data)
  },
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },
});