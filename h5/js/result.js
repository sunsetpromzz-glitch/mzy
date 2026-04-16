// H5 版 CPTI 结果页：复用 utils/algorithm.js 的 computeResult

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

function init() {
  var answers = readJSON(STORAGE_ANSWERS, null) || {};
  var keys = Object.keys(answers);
  if (keys.length === 0) {
    window.location.href = "./index.html";
    return;
  }

  var n = exports.computeResult(answers);
  var finalType = n.finalType;

  var modeKicker = document.getElementById("modeKicker");
  var typeName = document.getElementById("typeName");
  var sub = document.getElementById("sub");
  var badge = document.getElementById("badge");
  var desc = document.getElementById("desc");

  modeKicker.textContent = n.modeKicker || "";
  typeName.textContent = (finalType.code || "") + "（" + (finalType.cn || "") + "）";
  sub.textContent = n.sub || "";
  badge.textContent = n.badge || "";
  desc.textContent = finalType.desc || "";

  // 维度列表
  var dimSection = document.getElementById("dimSection");
  var dimList = document.getElementById("dimList");
  if (n.dimData && Array.isArray(n.dimData) && n.dimData.length > 0) {
    // 当前版本 computeResult 不直接返回 dimData，只在 H5 里重新算
  }

  var dimData = exports.dimensionOrder.map(function (dim) {
    var a = n.levels[dim];
    var explanation = exports.DIM_EXPLANATIONS[dim][a];
    return {
      name: exports.dimensionMeta[dim].name,
      level: a,
      score: n.rawScores[dim],
      explanation: explanation
    };
  });

  dimList.innerHTML = "";
  dimData.forEach(function (item) {
    var row = document.createElement("div");
    row.className = "dim-item";

    var top = document.createElement("div");
    top.className = "dim-item-top";

    var name = document.createElement("div");
    name.className = "dim-item-name";
    name.textContent = item.name;

    var score = document.createElement("div");
    score.className = "dim-item-score";
    score.textContent = "等级: " + item.level + " | 分数: " + item.score;

    top.appendChild(name);
    top.appendChild(score);

    var p = document.createElement("div");
    p.className = "p";
    p.textContent = item.explanation;

    row.appendChild(top);
    row.appendChild(p);
    dimList.appendChild(row);
  });

  if (dimData.length > 0) {
    dimSection.style.display = "";
  }

  // 提示文案（从小程序 result.js 同款迁移）
  var funNote = document.getElementById("funNote");
  var noteSection = document.getElementById("noteSection");
  funNote.textContent = n.special
    ? "本测试仅供娱乐。隐藏人格和傻乐兜底都属于作者故意埋的损招，请勿把它当成医学、心理学、相学、命理学或灵异学依据。"
    : "本测试仅供娱乐，别拿它当诊断、面试、相亲、分手、招魂、算命或人生判决书。你可以笑，但别太当真。";
  noteSection.style.display = "";

  document.getElementById("restartBtn").addEventListener("click", function () {
    localStorage.removeItem(STORAGE_ALLQUESTIONS);
    localStorage.removeItem(STORAGE_ANSWERS);
    localStorage.removeItem(STORAGE_CURRENTINDEX);
    window.location.href = "./test.html";
  });

  document.getElementById("homeBtn").addEventListener("click", function () {
    localStorage.removeItem(STORAGE_ALLQUESTIONS);
    localStorage.removeItem(STORAGE_ANSWERS);
    localStorage.removeItem(STORAGE_CURRENTINDEX);
    window.location.href = "./index.html";
  });
}

init();

