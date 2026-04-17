var e = require("../../utils/algorithm.js");

Page({
  USE_LEGACY_POSTER: false,
  data: {
    posterImage: "",
    showPosterImage: false,
    intro: "",
    modeKicker: "",
    typeName: "",
    badge: "",
    sub: "",
    desc: "",
    dimData: [],
    funNote: ""
  },

  onLoad: function() {
    var t = getApp().globalData.answers || {};
    if (0 !== Object.keys(t).length) {
      var n = (0, e.computeResult)(t),
        a = n.finalType,
        i = e.dimensionOrder.map((function(t) {
          var a = n.levels[t],
            i = e.DIM_EXPLANATIONS[t][a];
          return {
            name: e.dimensionMeta[t].name,
            level: a,
            score: n.rawScores[t],
            explanation: i
          }
        })),
        o = e.TYPE_IMAGES[a.code] || "";
      o && (o = o.replace("./image/", "/images/cpti_images/"));
      var r = !!(this.USE_LEGACY_POSTER && o);
      this.setData({
        posterImage: o,
        showPosterImage: r,
        intro: a.intro,
        modeKicker: n.modeKicker,
        typeName: "".concat(a.code, "（").concat(a.cn, "）"),
        badge: n.badge,
        sub: n.sub,
        desc: a.desc,
        dimData: i,
        funNote: n.special ? "本测试仅供娱乐。抽象兜底属于作者故意埋的损招，请勿把它当成医学、心理学、相学、命理学或灵异学依据。" : "本测试仅供娱乐，别拿它当诊断、面试、相亲、分手、招魂、算命或人生判决书。你可以笑，但别太当真。"
      })
    } else wx.redirectTo({
      url: "/pages/index/index"
    })
  },

  restartTest: function() {
    wx.redirectTo({
      url: "/pages/test/test"
    })
  },

  backHome: function() {
    wx.redirectTo({
      url: "/pages/index/index"
    })
  },

  /**
   * 保存图片到相册
   */
  savePoster: function() {
    var self = this;
    
    if (!this.data.showPosterImage || !this.data.posterImage) {
      wx.showToast({
        title: "当前使用文字卡片模式",
        icon: "none"
      });
      return;
    }
    
    wx.showLoading({
      title: "保存中...",
      mask: true
    });
    
    var posterPath = this.data.posterImage;
    
    if (posterPath.indexOf("http://") === 0 || posterPath.indexOf("https://") === 0) {
      wx.downloadFile({
        url: posterPath,
        success: function(res) {
          if (res.statusCode === 200) {
            self.saveImageToAlbum(res.tempFilePath);
          } else {
            wx.hideLoading();
            wx.showToast({
              title: "下载图片失败",
              icon: "none"
            });
          }
        },
        fail: function(err) {
          wx.hideLoading();
          console.error("下载失败:", err);
          wx.showToast({
            title: "保存失败，请重试",
            icon: "none"
          });
        }
      });
    } else {
      var fs = wx.getFileSystemManager();
      var tempPath = wx.env.USER_DATA_PATH + "/cpti_result_" + Date.now() + ".png";
      
      try {
        fs.copyFileSync(posterPath, tempPath);
        this.saveImageToAlbum(tempPath);
      } catch (err) {
        wx.hideLoading();
        console.error("复制文件失败:", err);
        wx.showToast({
          title: "保存失败，请重试",
          icon: "none"
        });
      }
    }
  },

  /**
   * 保存图片到相册
   */
  saveImageToAlbum: function(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: function() {
        wx.hideLoading();
        wx.showToast({
          title: "保存成功！",
          icon: "success"
        });
      },
      fail: function(err) {
        wx.hideLoading();
        if (err.errMsg.indexOf("auth deny") > -1 || err.errMsg.indexOf("auth denied") > -1) {
          wx.showModal({
            title: "需要授权",
            content: "必须授权【相册】才能保存图片哦",
            confirmText: "去授权",
            success: function(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          wx.showToast({
            title: "保存失败",
            icon: "none"
          });
        }
      }
    });
  },

  onShareAppMessage: function() {
    return {
      title: "我测出来的情侣类型是【".concat(this.data.typeName, "】！你也来测测看~"),
      path: "/pages/index/index",
      imageUrl: this.data.posterImage
    }
  },

  onShareTimeline: function() {
    return {
      title: "我的情侣类型是【".concat(this.data.typeName, "】！来测你是哪一挂~"),
      query: "",
      imageUrl: this.data.posterImage
    }
  }
});
