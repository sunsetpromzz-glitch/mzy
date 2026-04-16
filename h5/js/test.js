// H5 版 CPTI 问卷：复用你项目里的 utils/algorithm.js 题库与评分逻辑
// 运行前在 test.html 里会先执行：var exports = {}; 然后加载 ./utils/algorithm.js

var STORAGE_ANSWERS = "cpti_answers";
var STORAGE_ALLQUESTIONS = "cpti_allQuestions";
var STORAGE_CURRENTINDEX = "cpti_currentIndex";

function readJSON(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureDeck() {
  var allQuestions = readJSON(STORAGE_ALLQUESTIONS, null);
  var answers = readJSON(STORAGE_ANSWERS, null);
  if (!allQuestions || !answers) {
    // 未初始化：回到首页重新开始
    window.location.href = "./index.html";
    return null;
  }
  return { allQuestions: allQuestions, answers: answers };
}

function computeVisibleQuestions(allQuestions, answers) {
  var visible = [].concat(allQuestions || []);
  var drinkGateIndex = visible.findIndex(function (q) {
    return q.id === "drink_gate_q1";
  });
  if (drinkGateIndex !== -1 && answers && answers.drink_gate_q1 === 3) {
    visible.splice(drinkGateIndex + 1, 0, exports.specialQuestions[1]);
  }
  // 兜底：强制 q30 永远放在最后一题（避免插入隐藏题后被挤到中间）
  var q30Index = visible.findIndex(function (q) {
    return q && q.id === "q30";
  });
  if (q30Index !== -1) {
    var q30 = visible.splice(q30Index, 1)[0];
    visible.push(q30);
  }
  return visible;
}

function countDone(visibleQuestions, answers) {
  return (visibleQuestions || []).filter(function (q) {
    return answers && answers[q.id] !== undefined;
  }).length;
}

function renderOptionList(question, selectedValue) {
  var host = document.getElementById("options");
  if (!host || !question) return;
  host.innerHTML = "";

  var letters = ["A", "B", "C", "D"];
  question.options.forEach(function (opt, idx) {
    var value = opt.value;
    var isSelected = selectedValue === value;

    var label = document.createElement("label");
    label.className = "option" + (isSelected ? " selected" : "");

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "q_" + question.id;
    radio.value = String(value);
    radio.checked = isSelected;

    // 为了样式一致：把 click 绑定在 label 上更稳
    label.addEventListener("click", function () {
      selectOption(question.id, value);
    });

    var code = document.createElement("div");
    code.className = "option-code";
    code.textContent = letters[idx] || "";

    var text = document.createElement("div");
    text.textContent = opt.label;

    label.appendChild(radio);
    label.appendChild(code);
    label.appendChild(text);

    host.appendChild(label);
  });
}

function renderButtons(currentIndex, totalCount) {
  var left = document.getElementById("actionsLeft");
  var right = document.getElementById("actionsRight");
  if (!left || !right) return;

  left.innerHTML = "";
  right.innerHTML = "";

  // 第一题：返回首页 + 下一题
  // 中间：上一题 + 下一题
  // 最后一题：上一题 + 查看结果（左一右二）
  if (currentIndex === 0) {
    left.appendChild(makeBtn("返回首页", "secondary", function () {
      backHome();
    }));
    right.appendChild(makeBtn("下一题", "secondary", function () {
      nextQuestion();
    }, currentIndex >= totalCount - 1));
  } else if (currentIndex === totalCount - 1) {
    left.appendChild(makeBtn("上一题", "secondary", function () {
      prevQuestion();
    }, currentIndex <= 0));
    right.appendChild(makeBtn("查看结果", "primary", function () {
      submitTest();
    }, false));
  } else {
    left.appendChild(makeBtn("上一题", "secondary", function () {
      prevQuestion();
    }, currentIndex <= 0));
    right.appendChild(makeBtn("下一题", "secondary", function () {
      nextQuestion();
    }, currentIndex >= totalCount - 1));
  }
}

function makeBtn(text, kind, onClick, disabled) {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = kind === "primary" ? "btn-primary" : "btn-secondary";
  btn.textContent = text;
  btn.disabled = !!disabled;
  btn.style.minWidth = kind === "primary" ? "unset" : "unset";
  btn.style.flex = "unset";
  btn.addEventListener("click", onClick);
  return btn;
}

function updateHint(doneCount, totalCount) {
  var hint = document.getElementById("hint");
  if (!hint) return;
  hint.textContent =
    doneCount === totalCount && totalCount > 0
      ? "都做完了。现在可以把你的电子魂魄交给结果页审判。"
      : "全选完才会放行。世界已经够乱了，起码把题做完整。";
}

var state = {
  allQuestions: [],
  visibleQuestions: [],
  answers: {},
  currentIndex: 0
};

function selectOption(qid, value) {
  state.answers = Object.assign({}, state.answers || {});
  state.answers[qid] = value;
  writeJSON(STORAGE_ANSWERS, state.answers);
  // 更新题目集合（酒精隐藏题可能插入/移除）
  refreshVisibleAndIndex();
}

function refreshVisibleAndIndex() {
  var prevCurrentId = null;
  if (state.visibleQuestions && state.visibleQuestions[state.currentIndex]) {
    prevCurrentId = state.visibleQuestions[state.currentIndex].id;
  }

  state.visibleQuestions = computeVisibleQuestions(state.allQuestions, state.answers);
  var totalCount = state.visibleQuestions.length;
  var doneCount = countDone(state.visibleQuestions, state.answers);
  var progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  // 更新 currentIndex：尽量保持在同一题
  var newIndex = state.currentIndex || 0;
  if (prevCurrentId) {
    var mapped = state.visibleQuestions.findIndex(function (q) {
      return q.id === prevCurrentId;
    });
    if (mapped !== -1) newIndex = mapped;
  }
  if (newIndex >= totalCount) newIndex = Math.max(0, totalCount - 1);
  if (newIndex < 0) newIndex = 0;

  state.currentIndex = newIndex;
  writeJSON(STORAGE_CURRENTINDEX, state.currentIndex);

  document.getElementById("progressBar").style.width = progressPercent.toFixed(2) + "%";
  document.getElementById("progressText").textContent = doneCount + " / " + totalCount;
  updateHint(doneCount, totalCount);

  renderCurrentQuestion();
  renderButtons(state.currentIndex, totalCount);
}

function renderCurrentQuestion() {
  var q = state.visibleQuestions[state.currentIndex];
  var qTitle = document.getElementById("qTitle");
  var qDim = document.getElementById("qDim");
  var qBadge = document.getElementById("qBadge");
  if (!qTitle || !qDim || !qBadge) return;

  if (!q) {
    qTitle.textContent = "";
    qDim.textContent = "";
    qBadge.textContent = "第 0 题";
    document.getElementById("options").innerHTML = "";
    return;
  }

  qBadge.textContent = "第 " + (state.currentIndex + 1) + " 题";
  qDim.textContent = q.special ? "补充题" : "维度已隐藏";
  qTitle.textContent = q.text;

  var selectedValue = state.answers[q.id];
  renderOptionList(q, selectedValue);
}

function backHome() {
  // 清空并返回首页
  localStorage.removeItem(STORAGE_ALLQUESTIONS);
  localStorage.removeItem(STORAGE_ANSWERS);
  localStorage.removeItem(STORAGE_CURRENTINDEX);
  window.location.href = "./index.html";
}

function prevQuestion() {
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
    writeJSON(STORAGE_CURRENTINDEX, state.currentIndex);
    renderCurrentQuestion();
    renderButtons(state.currentIndex, state.visibleQuestions.length);
  }
}

function nextQuestion() {
  var total = state.visibleQuestions.length;
  if (state.currentIndex < total - 1) {
    state.currentIndex += 1;
    writeJSON(STORAGE_CURRENTINDEX, state.currentIndex);
    renderCurrentQuestion();
    renderButtons(state.currentIndex, total);
  }
}

function submitTest() {
  var totalCount = state.visibleQuestions.length;
  var doneCount = countDone(state.visibleQuestions, state.answers);
  if (doneCount < totalCount) {
    var unansweredIndex = state.visibleQuestions.findIndex(function (q) {
      return state.answers[q.id] === undefined;
    });
    if (unansweredIndex !== -1) {
      state.currentIndex = unansweredIndex;
      writeJSON(STORAGE_CURRENTINDEX, state.currentIndex);
      renderCurrentQuestion();
      renderButtons(state.currentIndex, totalCount);
    }
    return;
  }

  // 进入结果页
  writeJSON(STORAGE_ANSWERS, state.answers);
  window.location.href = "./result.html";
}

function init() {
  // 初始化 deck：如果还没生成，就从首页生成（兼容直接打开 test.html）
  var deck = ensureDeck();
  if (!deck) return;
  state.allQuestions = deck.allQuestions;
  state.answers = deck.answers;
  state.currentIndex = readJSON(STORAGE_CURRENTINDEX, 0) || 0;

  // 如果 currentIndex 越界，修正
  state.visibleQuestions = computeVisibleQuestions(state.allQuestions, state.answers);
  var totalCount = state.visibleQuestions.length;
  if (state.currentIndex >= totalCount) state.currentIndex = Math.max(0, totalCount - 1);

  refreshVisibleAndIndex();
}

function initDeckIfNeeded() {
  // 在 H5 中，deck 应由首页点击 startBtn 生成并写入 storage
  // 如果用户直接打开 test.html，则这里兜底生成一次。
  var allQuestions = readJSON(STORAGE_ALLQUESTIONS, null);
  var answers = readJSON(STORAGE_ANSWERS, null);
  if (allQuestions && answers) return;

  var fixedLast = exports.questions.find(function (q) {
    return q && q.id === "q30";
  });
  var base = exports.questions.filter(function (q) {
    return q && q.id !== "q30";
  });

  var shuffled = exports.shuffle(base);
  var insertPos = Math.floor(Math.random() * shuffled.length) + 1;
  var allQs = [].concat(
    shuffled.slice(0, insertPos),
    [exports.specialQuestions[0]],
    shuffled.slice(insertPos),
    fixedLast ? [fixedLast] : []
  );

  writeJSON(STORAGE_ALLQUESTIONS, allQs);
  writeJSON(STORAGE_ANSWERS, {});
  writeJSON(STORAGE_CURRENTINDEX, 0);
}

initDeckIfNeeded();
init();

