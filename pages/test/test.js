var algorithm = require("../../utils/algorithm.js");

Page({
  data: {
    visibleQuestions: [],
    currentQuestion: null,
    currentIndex: 0,
    answers: {},
    doneCount: 0,
    totalCount: 0,
    progressPercent: 0
  },

  onLoad: function() {
    this.initTest();
  },

  initTest: function() {
    var self = this;
    var fixedLastQuestion = null;
    var baseQuestions = algorithm.questions.filter(function(q) {
      if (q.id === "q30") {
        fixedLastQuestion = q;
        return false;
      }
      return true;
    });

    var shuffled = algorithm.shuffle(baseQuestions);
    var allQuestions = [].concat(
      shuffled,
      fixedLastQuestion ? [fixedLastQuestion] : []
    );
    
    this.allQuestions = allQuestions;
    this.setData({
      answers: {}
    }, function() {
      self.updateVisibleQuestions();
    });
  },

  updateVisibleQuestions: function() {
    if (!this.allQuestions || this.allQuestions.length === 0) {
      console.error("allQuestions is empty");
      return;
    }

    var previousList = this.data.visibleQuestions || [];
    var previousCurrent = previousList[this.data.currentIndex];
    var visibleQuestions = [].concat(this.allQuestions);
    var answers = this.data.answers;
    // 已移除隐藏题逻辑：不再动态插入额外题目

    var doneCount = visibleQuestions.filter(function(q) {
      return answers[q.id] !== undefined;
    }).length;

    var totalCount = visibleQuestions.length;
    var progressPercent = totalCount > 0 ? (doneCount / totalCount * 100) : 0;

    var currentIndex = this.data.currentIndex || 0;
    if (previousCurrent) {
      var mappedIndex = visibleQuestions.findIndex(function(q) {
        return q.id === previousCurrent.id;
      });
      currentIndex = mappedIndex !== -1 ? mappedIndex : currentIndex;
    }
    if (currentIndex >= totalCount) currentIndex = Math.max(0, totalCount - 1);
    if (currentIndex < 0) currentIndex = 0;

    this.setData({
      visibleQuestions: visibleQuestions,
      currentQuestion: visibleQuestions[currentIndex] || null,
      currentIndex: currentIndex,
      doneCount: doneCount,
      totalCount: totalCount,
      progressPercent: progressPercent
    });
  },

  selectOption: function(event) {
    var self = this;
    var dataset = event.currentTarget.dataset;
    var questionId = dataset.qid;
    var value = dataset.val;
    
    var newAnswers = Object.assign({}, this.data.answers);
    newAnswers[questionId] = value;
    
    // 已移除隐藏题逻辑
    
    this.setData({
      answers: newAnswers
    }, function() {
      self.updateVisibleQuestions();
    });
  },

  prevQuestion: function() {
    var idx = this.data.currentIndex;
    if (idx > 0) {
      this.setData({
        currentIndex: idx - 1,
        currentQuestion: this.data.visibleQuestions[idx - 1]
      });
    }
  },

  nextQuestion: function() {
    var idx = this.data.currentIndex;
    var total = this.data.totalCount;
    if (idx < total - 1) {
      this.setData({
        currentIndex: idx + 1,
        currentQuestion: this.data.visibleQuestions[idx + 1]
      });
    }
  },

  backHome: function() {
    wx.navigateBack();
  },

  submitTest: function() {
    var data = this.data;
    var visibleQuestions = data.visibleQuestions;
    var answers = data.answers;

    if (data.doneCount < data.totalCount) {
      var unansweredIndex = visibleQuestions.findIndex(function(q) {
        return answers[q.id] === undefined;
      });
      if (unansweredIndex !== -1) {
        wx.showToast({
          title: "请完善题目再交卷哦",
          icon: "none"
        });
        this.setData({
          currentIndex: unansweredIndex,
          currentQuestion: visibleQuestions[unansweredIndex]
        });
      }
    } else {
      getApp().globalData.answers = this.data.answers;
      wx.redirectTo({
        url: "/pages/result/result"
      });
    }
  }
});
