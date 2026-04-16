function goTest() {
  // 由 test.html 生成随机题序列并落地 localStorage
  window.location.href = "./test.html";
}

var startBtn = document.getElementById("startBtn");
if (startBtn) startBtn.addEventListener("click", goTest);

