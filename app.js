App({
  /**
   * 小程序启动时执行
   */
  onLaunch: function() {
    this.globalData = {
      env: "",
      answers: {}
    };
  },

  /**
   * 全局数据
   */
  globalData: {
    env: "",
    answers: {}
  }
});
