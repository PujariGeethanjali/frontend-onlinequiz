// -----------------------------
// QUESTIONS
// -----------------------------
const questions = [
  { type: "mcq", question: "What is the capital of France?", options: {a:"Berlin", b:"Madrid", c:"Paris", d:"Rome"}, answer: "c", explanation:"Paris is the capital of France." },
  { type: "mcq", question: "Which planet is known as the Red Planet?", options: {a:"Earth", b:"Mars", c:"Jupiter", d:"Venus"}, answer: "b", explanation:"Mars is called the Red Planet due to iron oxide on its surface." },
  { type: "mcq", question: "What is 5 + 7?", options: {a:"10", b:"11", c:"12", d:"13"}, answer: "c", explanation:"5 + 7 = 12." },
  { type: "multiple", question: "Select all prime numbers:", options: {a:"2", b:"3", c:"4", d:"5"}, answer: ["a","b","d"], explanation:"2, 3 and 5 are primes; 4 is not." },
  { type: "multiple", question: "Select all programming languages:", options: {a:"Python", b:"HTML", c:"JavaScript", d:"CSS"}, answer: ["a","c"], explanation:"Python and JavaScript are programming languages; HTML/CSS are not." },
  { type: "multiple", question: "Select all fruits:", options: {a:"Apple", b:"Carrot", c:"Banana", d:"Potato"}, answer: ["a","c"], explanation:"Apple and Banana are fruits; Carrot and Potato are vegetables." },
  { type: "fill", question: "Fill in the blank: The chemical symbol of water is _______?", answer: "h2o", explanation:"Water's chemical formula is H₂O." },
  { type: "fill", question: "Fill in the blank: The largest mammal on Earth is _______?", answer: "blue whale", explanation:"The blue whale is the largest mammal on Earth." },
  { type: "fill", question: "Fill in the blank: The first president of the USA was _______?", answer: "george washington", explanation:"George Washington was the first US president." },
  { type: "mcq", question: `Identify the technologies shown in this image: <br>
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg" width="80">
      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg" width="80">
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" width="80">`,
      options: {a: "Frontend Development", b: "Backend Development", c: "Database Management", d: "Networking"}, answer: "a", explanation:"HTML/CSS/JS are front-end technologies." },
  { type: "mcq", question: `Identify the technology shown in this image: <br>
      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg" width="100">`,
      options: {a: "Frontend Development", b: "Backend Development", c: "CSS Framework", d: "Database"}, answer: "b", explanation:"Node.js is commonly used for backend (server-side) JavaScript." },
  { type: "mcq", question: `Identify this logo: <br>
      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg" width="100">`,
      options: {a: "HTML", b: "JavaScript", c: "CSS", d: "React"}, answer: "c", explanation:"That is the CSS logo." },
  { type: "fill", question: "Name the process by which plants make food using sunlight.", answer: "photosynthesis", explanation:"Photosynthesis is how plants make food using sunlight." },
  { type: "fill", question: "What is the boiling point of water in Celsius?", answer: "100", explanation:"Water boils at 100°C at standard atmospheric pressure." },
  { type: "fill", question: "Name the programming language that starts with 'J' and is used for web development.", answer: "javascript", explanation:"JavaScript starts with 'J' and is used extensively for web development." }
];

// ---------- state ----------
let shuffled = [];
let current = 0;
let userResponses = [];
let perQuestionTimer = null;
let perQuestionLeft = 120;
let totalTimer = null;
let totalLeft = 20 * 60;

// DOM
const registration = document.getElementById('registration');
const startBtn = document.getElementById('startBtn');
const quizContainer = document.getElementById('quiz-container');
const questionArea = document.getElementById('question-area');
const qNav = document.getElementById('question-nav');
const progressFill = document.getElementById('progress-fill');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const markBtn = document.getElementById('markBtn');
const submitBtn = document.getElementById('submitBtn');
const qTimeSpan = document.getElementById('qTime');
const totalTimeSpan = document.getElementById('totalTime');

const resultsContainer = document.getElementById('results-container');
const summaryDiv = document.getElementById('summary');
const reviewList = document.getElementById('review-list');
const downloadCert = document.getElementById('downloadCert');
const restartBtn = document.getElementById('restartBtn');

// --------------- utilities ----------------
function shuffleArray(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}
function pad(n){ return n<10? '0'+n : String(n); }

// --------------- build / show ----------------
function buildNav(){
  qNav.innerHTML = '';
  shuffled.forEach((q, idx) => {
    const btn = document.createElement('button');
    btn.textContent = idx+1;
    btn.className = 'nav-btn';
    if(userResponses[idx] && userResponses[idx].answer) btn.classList.add('answered');
    if(userResponses[idx] && userResponses[idx].marked) btn.classList.add('marked');
    if(idx === current) btn.classList.add('current');
    btn.addEventListener('click', ()=>{
      saveCurrent(); current = idx; showQuestion();
    });
    qNav.appendChild(btn);
  });
  const answeredCount = userResponses.filter(r=>r && r.answer).length;
  const pct = (answeredCount / shuffled.length) * 100;
  progressFill.style.width = pct + '%';
}
function renderOptions(q){
  if(q.type === 'mcq'){
    let html = '<div class="options">';
    for(const key in q.options){
      html += `<label class="option"><input type="radio" name="choice" value="${key}"> ${q.options[key]}</label>`;
    }
    html += '</div>'; return html;
  } else if(q.type === 'multiple'){
    let html = '<div class="options">';
    for(const key in q.options){
      html += `<label class="option"><input type="checkbox" name="choice" value="${key}"> ${q.options[key]}</label>`;
    }
    html += '</div>'; return html;
  } else {
    return `<div style="margin-top:12px;"><input id="fillInput" type="text" style="width:95%; padding:10px; font-size:16px;"></div>`;
  }
}
function showQuestion(){
  if(current < 0) current = 0;
  if(current >= shuffled.length) { submitQuiz(); return; }
  buildNav();
  const q = shuffled[current];
  const card = document.createElement('div');
  card.className = 'question-card';
  let qHtml = `<h3>Q${current+1}. ${q.question}</h3>`;
  qHtml += renderOptions(q);
  card.innerHTML = qHtml;
  questionArea.innerHTML = '';
  questionArea.appendChild(card);
  const prior = userResponses[current];
  if(prior && prior.answer !== undefined && q.type !== 'fill'){
    if(q.type === 'mcq'){
      const radio = document.querySelector(`input[name="choice"][value="${prior.answer}"]`);
      if(radio) radio.checked = true;
    } else if(Array.isArray(prior.answer)){
      prior.answer.forEach(v => {
        const cb = document.querySelector(`input[name="choice"][value="${v}"]`);
        if(cb) cb.checked = true;
      });
    }
  } else if(prior && q.type==='fill'){
    const inp = document.getElementById('fillInput');
    if(inp) inp.value = prior.answer;
  }
  resetPerQuestionTimer();
}

// --------------- save answer ----------------
function saveCurrent(){
  const q = shuffled[current];
  if(!q) return;
  let resp = { answer:null, correct:false, marked:(userResponses[current]?.marked||false) };
  if(q.type==='mcq'){
    const sel=document.querySelector('input[name="choice"]:checked');
    resp.answer=sel?sel.value:null;
    resp.correct=(resp.answer===q.answer);
  } else if(q.type==='multiple'){
    const sels=Array.from(document.querySelectorAll('input[name="choice"]:checked')).map(i=>i.value);
    resp.answer=sels;
    const expected=q.answer.slice().sort();
    const got=sels.slice().sort();
    resp.correct=(expected.length===got.length && expected.every((v,i)=>v===got[i]));
  } else {
    const inp=document.getElementById('fillInput');
    const val=inp?inp.value.trim().toLowerCase():"";
    resp.answer=val;
    resp.correct=(val===String(q.answer).toLowerCase());
  }
  userResponses[current]=resp;
}
function markForReview(){
  userResponses[current]=userResponses[current]||{};
  userResponses[current].marked=true;
  buildNav();
}

// --------------- timers ----------------
function startTotalTimer(){
  updateTotalDisplay();
  totalTimer=setInterval(()=>{
    totalLeft--;
    updateTotalDisplay();
    if(totalLeft<=0){clearInterval(totalTimer); submitQuiz();}
  },1000);
}
function updateTotalDisplay(){
  const m=Math.floor(totalLeft/60); const s=totalLeft%60;
  totalTimeSpan.textContent=`${pad(m)}:${pad(s)}`;
}
function resetPerQuestionTimer(){
  if(perQuestionTimer) clearInterval(perQuestionTimer);
  perQuestionLeft=120; updatePerQuestionDisplay();
  perQuestionTimer=setInterval(()=>{
    perQuestionLeft--; updatePerQuestionDisplay();
    if(perQuestionLeft<=0){
      clearInterval(perQuestionTimer);
      saveCurrent(); current++; if(current>=shuffled.length){submitQuiz(); return;}
      showQuestion();
    }
  },1000);
}
function updatePerQuestionDisplay(){
  const m=Math.floor(perQuestionLeft/60), s=perQuestionLeft%60;
  qTimeSpan.textContent=`${pad(m)}:${pad(s)}`;
}

// --------------- navigation ----------------
nextBtn.addEventListener('click', ()=>{saveCurrent(); current++; if(current>=shuffled.length) current=shuffled.length-1; showQuestion();});
prevBtn.addEventListener('click', ()=>{saveCurrent(); current--; if(current<0) current=0; showQuestion();});
markBtn.addEventListener('click', ()=>{markForReview();});

// --------------- submit & results ----------------
function submitQuiz(){
  saveCurrent();
  if(perQuestionTimer) clearInterval(perQuestionTimer);
  if(totalTimer) clearInterval(totalTimer);
  try{window.stopCamera?.();}catch(e){}
  if(document.fullscreenElement){document.exitFullscreen().catch(()=>{});}
  let correct=0; shuffled.forEach((q,i)=>{if(userResponses[i]?.correct) correct++;});
  const total=shuffled.length; const wrong=total-correct; const pct=((correct/total)*100).toFixed(2);
  quizContainer.style.display='none'; resultsContainer.style.display='block';
  summaryDiv.innerHTML=`<p><strong>Total Questions:</strong> ${total} &nbsp; <strong>Correct:</strong> <span style="color:green">${correct}</span> &nbsp; <strong>Wrong:</strong> <span style="color:red">${wrong}</span> &nbsp; <strong>Score:</strong> ${pct}%</p>`;
  reviewList.innerHTML='';
  shuffled.forEach((q,i)=>{
    const r=userResponses[i]||{answer:null,correct:false};
    let yourAns="Not answered", correctAns="";
    if(q.type==='mcq'){yourAns=r.answer?q.options[r.answer]:"Not answered"; correctAns=q.options[q.answer];}
    else if(q.type==='multiple'){yourAns=Array.isArray(r.answer)&&r.answer.length?r.answer.map(k=>q.options[k]).join(', '):"Not answered"; correctAns=q.answer.map(k=>q.options[k]).join(', ');}
    else{yourAns=r.answer||"Not answered"; correctAns=q.answer;}
    const div=document.createElement('div');
    div.className='review';
    div.innerHTML=`<p><strong>Q${i+1}:</strong> ${q.question}</p>
      <p><strong>Your Answer:</strong> ${yourAns}</p>
      <p><strong>Correct Answer:</strong> ${correctAns}</p>
      <p><strong style="color:${r.correct?'green':'red'}">${r.correct?'Correct':'Wrong'}</strong></p>
      <p><em>Explanation:</em> ${q.explanation}</p>`;
    reviewList.appendChild(div);
  });
}

// --------------- certificate ----------------
downloadCert.addEventListener('click', ()=>{
  const { jsPDF }=window.jspdf; const doc=new jsPDF({orientation:'landscape',unit:'pt',format:'a4'});
  const name=document.getElementById('userName').value||'Candidate';
  const total=shuffled.length; const correct=userResponses.filter(r=>r&&r.correct).length;
  const pct=((correct/total)*100).toFixed(2);
  doc.setFillColor(250,250,255); doc.rect(0,0,842,595,'F');
  doc.setFillColor(20,90,160); doc.rect(0,20,842,90,'F');
  doc.setFontSize(34); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
  doc.text('Certificate of Achievement',421,70,{align:'center'});
  doc.setDrawColor(40,80,140); doc.setLineWidth(3); doc.rect(40,120,762,420);
  doc.setFontSize(18); doc.setTextColor(30,30,30); doc.setFont('times','italic');
  doc.text('This is to certify that',421,190,{align:'center'});
  doc.setFont('helvetica','bold'); doc.setFontSize(28); doc.setTextColor(10,90,140);
  doc.text(name,421,230,{align:'center'});
  doc.setFont('helvetica','normal'); doc.setFontSize(16); doc.setTextColor(40,40,40);
  doc.text(`has successfully completed the Online Quiz.`,421,260,{align:'center'});
  doc.text(`Score: ${correct}/${total} (${pct}%)`,421,290,{align:'center'});
  doc.setFontSize(12); doc.text(`Date: ${new Date().toLocaleDateString()}`,421,320,{align:'center'});
  //doc.setLineWidth(1); doc.line(550,420,720,420);

  doc.save('Certificate.pdf');
});

// --------------- start / restart ----------------
startBtn.addEventListener('click', ()=>{
  const name=document.getElementById('userName').value.trim();
  const email=document.getElementById('userEmail').value.trim();
  const regNo=document.getElementById('userRegNo').value.trim();
  if(!name||!email||!regNo){alert('Please enter name, email and registration number.');return;}
  if(document.documentElement.requestFullscreen){document.documentElement.requestFullscreen().catch(()=>{});}
  shuffled=shuffleArray(questions.map(q=>JSON.parse(JSON.stringify(q))));
  userResponses=new Array(shuffled.length); current=0;
  registration.style.display='none'; resultsContainer.style.display='none'; quizContainer.style.display='block';
  startTotalTimer(); resetPerQuestionTimer(); showQuestion();
});
restartBtn.addEventListener('click', ()=>{location.reload();});

// Auto-submit if user exits fullscreen
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && quizContainer.style.display === "block") {
    alert("You exited fullscreen. The quiz will be submitted automatically.");
    submitQuiz();
  }
});

// Ensure submit button saves and submits
submitBtn.addEventListener('click', ()=>{
  saveCurrent();
  submitQuiz();
});
