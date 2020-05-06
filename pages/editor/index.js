//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    content: "",
    files: [],
    successFiles: [],
    uplaodFile: undefined,
    array: ['地图', '随机', '定向'],
    index: 0,
  },
  onLoad() {
    this.setData({
      uplaodFile: this.uplaodFile.bind(this)
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
        name: 'images',
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
        fial: () => {
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
        const {latitude, longitude} = res
        wx.request({
          url: `${app.globalData.site}/post/write`,
          method: "POST",
          data: {
            raw: that.data.content,
            key: app.globalData.key,
            lat: latitude,
            lng: longitude,
            images: that.data.successFiles
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
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
});