const snakes = {99:1,97:79,95:75,93:73,91:69,87:24,84:63,82:61,77:57,74:54,67:47,64:60,46:25,44:23,42:21,36:13,32:10};
const ladders = {4:14,9:31,12:48,17:37,20:39,28:84,33:53,41:61,45:65,54:74,62:80,71:91};
const safetyMsgs = {1:"Safety Starts With Me",10:"Incident Reporting",15:"Safety Induction",20:"Multiple Injury",25:"Back Arrester",30:"Prevent Hand Servered",40:"Protect Eyes",50:"No Alcohol",60:"Material from Height",70:"Damaged Equip",80:"Key to Safety",90:"Avoid Fire",100:"Go Home Safely!"};

let pPos=1, aiPos=1, isPlayerTurn=true, gameActive=true;

const grid=document.getElementById('board');
const diceEl=document.getElementById('dice');
const diceValEl=document.getElementById('dice-value');
const statusEl=document.getElementById('status');
const msgEl=document.getElementById('message');
const rollBtn=document.getElementById('roll-btn');

function init(){
  createBoard();
  renderTokens();
  updateStatus();
  msgEl.textContent="Click Roll to start";
  // Re-add listener safely
  const newBtn = rollBtn.cloneNode(true);
  rollBtn.parentNode.replaceChild(newBtn, rollBtn);
  document.getElementById('roll-btn').addEventListener('click', playerTurn);
}

function createBoard(){
  grid.innerHTML='';
  for(let r=0;r<10;r++){
    let base=(9-r)*10;
    for(let i=0;i<10;i++){
      let n=(r%2===0)?base+(10-i):base+(1+i);
      const c=document.createElement('div');
      c.className='cell';
      c.id=`cell-${n}`;
      let html=`<div class="num">${n}</div>`;
      if(snakes[n]) html+=`<div class="icon">🐍</div>`;
      else if(ladders[n]) html+=`<div class="icon">🪜</div>`;
      else html+=`<div class="icon"> </div>`;
      if(safetyMsgs[n]) html+=`<div class="msg">${safetyMsgs[n]}</div>`;
      c.innerHTML=html;
      grid.appendChild(c);
    }
  }
}

function renderTokens(){
  document.querySelectorAll('.cell').forEach(c=>{
    c.style.border='1px solid #34495e';
    c.style.background=parseInt(c.id.split('-')[1])%2!==0?'#2c3e50':'#3d566e';
  });
  const p=document.getElementById(`cell-${pPos}`);
  if(p){p.style.border='2px solid #27ae60';p.style.background='#1e3a2f';}
  const a=document.getElementById(`cell-${aiPos}`);
  if(a){a.style.border='2px solid #e74c3c';a.style.background='#3a1e1e';}
}

function updateStatus(){
  if(!gameActive){
    statusEl.textContent="Game Over";
    rollBtn.textContent="Play Again";
    rollBtn.disabled=false;
    rollBtn.onclick=resetGame;
  } else {
    statusEl.textContent=isPlayerTurn?`🟢 Your Turn | You: ${pPos} | AI: ${aiPos}`:`🔴 AI Thinking... | You: ${pPos} | AI: ${aiPos}`;
    rollBtn.disabled=!isPlayerTurn;
  }
}

// --- SIMPLIFIED ANIMATION ---
function animateDice(callback) {
    const faces = ['⚀', '⚁', '⚂', '', '⚄', '⚅'];
    let count = 0;
    
    function spin() {
        // Show random face
        diceEl.textContent = faces[Math.floor(Math.random() * 6)];
        count++;
        
        // After 10 spins, STOP and give result
        if (count < 10) {
            setTimeout(spin, 80); // Wait 80ms then spin again
        } else {
            const finalRoll = Math.floor(Math.random() * 6) + 1;
            diceEl.textContent = faces[finalRoll - 1]; // Show final face
            diceValEl.textContent = `Rolled: ${finalRoll}`;
            callback(finalRoll);
        }
    }
    spin(); // Start spinning
}

function playerTurn(){
  if(!gameActive || !isPlayerTurn) return;
  rollBtn.disabled = true;
  msgEl.textContent = "Rolling...";
  
  animateDice((roll) => {
    let next = pPos + roll;
    if(next > 100) next = pPos;
    
    // Check Snakes/Ladders
    if(snakes[next]) { msgEl.textContent = `🐍 Snake! Slid to ${snakes[next]}.`; next = snakes[next]; }
    else if(ladders[next]) { msgEl.textContent = `🪜 Ladder! Up to ${ladders[next]}.`; next = ladders[next]; }
    
    pPos = next;
    renderTokens();
    
    if(pPos === 100) { endGame(true); return; }
    
    // Switch to AI
    isPlayerTurn = false;
    updateStatus();
    setTimeout(aiTurn, 1500);
  });
}

function aiTurn(){
  if(!gameActive || isPlayerTurn) return;
  msgEl.textContent = "🤖 AI is rolling...";
  
  animateDice((roll) => {
    let next = aiPos + roll;
    if(next > 100) next = aiPos;
    
    if(snakes[next]) { msgEl.textContent = `🐍 AI hit snake! Slid to ${snakes[next]}.`; next = snakes[next]; }
    else if(ladders[next]) { msgEl.textContent = `🪜 AI climbed! Up to ${ladders[next]}.`; next = ladders[next]; }
    
    aiPos = next;
    renderTokens();
    
    if(aiPos === 100) { endGame(false); return; }
    
    // Switch to Player
    isPlayerTurn = true;
    updateStatus();
    msgEl.textContent = "Your turn! Click Roll.";
  });
}

function endGame(win){
  gameActive = false;
  updateStatus();
  msgEl.textContent = win ? "🎉 YOU WIN! Safety First!" : "🤖 AI Wins! Try again?";
  msgEl.style.color = win ? "#27ae60" : "#e74c3c";
}

function resetGame(){
  pPos=1; aiPos=1; isPlayerTurn=true; gameActive=true;
  diceEl.textContent="🎲"; diceValEl.textContent="Ready";
  msgEl.textContent="New game! Click Roll.";
  msgEl.style.color="#bdc3c7";
  rollBtn.onclick=null;
  init();
}

document.addEventListener('DOMContentLoaded', init);
