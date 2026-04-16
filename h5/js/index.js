var STORAGE_ANSWERS = "cpti_answers";
var STORAGE_ALLQUESTIONS = "cpti_allQuestions";
var STORAGE_CURRENTINDEX = "cpti_currentIndex";

function clearSession() {
  localStorage.removeItem(STORAGE_ALLQUESTIONS);
  localStorage.removeItem(STORAGE_ANSWERS);
  localStorage.removeItem(STORAGE_CURRENTINDEX);
}

function goTest() {
  clearSession();
  window.location.href = "./test.html";
}

clearSession();

var startBtn = document.getElementById("startBtn");
if (startBtn) startBtn.addEventListener("click", goTest);

