// --- CONFIGURATION ---
const snakes = { 99:1, 97:79, 95:75, 93:73, 91:69, 87:24, 84:63, 82:61, 77:57, 74:54, 67:47, 64:60, 46:25, 44:23, 42:21, 36:13, 32:10 };
const ladders = { 4:14, 9:31, 12:48, 17:37, 20:39, 28:84, 33:53, 41:61, 45:65, 54:74, 62:80, 71:91 };
const safetyMsgs = { 
  1:"Safety Starts With Me", 10:"Incident Reporting", 15:"Safety Induction", 
  20:"Multiple Injury", 25:"Back Arrester", 30:"Prevent Hand Servered", 
  40:"Protect Eyes", 50:"No Alcohol", 60:"Material from Height", 
  70:"Damaged Equip", 80:"Key to Safety", 90:"Avoid Fire", 100:"Go Home Safely!" 
};

// --- STATE ---
let pPos = 1;
let aiPos = 1;
let isPlayerTurn = true;
let gameActive = true;

// --- ELEMENTS ---
const grid = document.getElementById('board');
const diceEl = document.getElementById('dice');
const diceValueEl = document.getElementById('dice-value');
const statusEl = document.getElementById('status');
const msgEl = document.getElementById('message');
const rollBtn = document.getElementById('roll-btn');

// --- INITIALIZATION ---
function init() {
  createBoard();
  renderTokens();
  updateStatus();
  msgEl.textContent = "🎲 Click ROLL DICE to start!";
  
  // Reset button listener
  rollBtn.replaceWith(rollBtn.cloneNode(true));
  const newRollBtn = document.getElementById('roll-btn');
  newRollBtn.addEventListener('click', playerTurn);
}

function createBoard() {
  grid.innerHTML = '';
  for (let row = 0; row < 10; row++) {
    let base = (9 - row) * 10;
    for (let i = 0; i < 10; i++) {
      let num;
      if (row % 2 === 0) num = base + (10 - i); 
      else num = base + (1 + i);                
      
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = `cell-${num}`;
      
      let content = `<div class="cell-num">${num}</div>`;
      if (snakes[num]) content += '<div class="cell-icon">🐍</div>';
      else if (ladders[num]) content += '<div class="cell-icon">🪜</div>';
      else content += '<div style="height:20px"></div>'; 
      
      if (safetyMsgs[num]) content += `<div class="cell-msg">${safetyMsgs[num]}</div>`;
      cell.innerHTML = content;
      grid.appendChild(cell);
    }
  }
}

function renderTokens() {
  document.querySelectorAll('.cell').forEach(c => {
    c.style.border = '1px solid #34495e';
    c.style.background = c.id % 2 !== 0 ? '#2c3e50' : '#3d566e';
  });
  
  const pCell = document.getElementById(`cell-${pPos}`);
  if (pCell) {
    pCell.style.border = '2px solid #27ae60';
    pCell.style.background = '#1e3a2f';
  }
  
  const aCell = document.getElementById(`cell-${aiPos}`);
  if (aCell) {
    aCell.style.border = '2px solid #e74c3c';
    aCell.style.background = '#3a1e1e';
  }
}

function updateStatus() {
  if (!gameActive) {
    statusEl.textContent = "Game Over";
    rollBtn.textContent = "Play Again";
    rollBtn.disabled = false;
    rollBtn.onclick = resetGame;
  } else {
    statusEl.textContent = isPlayerTurn ? "🟢 Your Turn" : "🔴 AI Thinking...";
    rollBtn.disabled = !isPlayerTurn;
    rollBtn.textContent = isPlayerTurn ? "🎲 ROLL DICE" : "WAITING...";
  }
}

// --- GAME LOGIC ---

function playerTurn() {
  if (!gameActive || !isPlayerTurn) return;
  
  rollBtn.disabled = true;
  msgEl.textContent = "Rolling...";
  
  animateDice((roll) => {
    const result = movePiece(pPos, roll, true);
    pPos = result.newPos;
    renderTokens();
    
    if (result.won) {
      endGame(true);
    } else {
      if (result.msg) msgEl.textContent = result.msg;
      isPlayerTurn = false;
      updateStatus();
      setTimeout(aiTurn, 1500);
    }
  });
}

function aiTurn() {
  if (!gameActive || isPlayerTurn) return;
  
  msgEl.textContent = "🤖 AI is rolling...";
  
  animateDice((roll) => {
    const result = movePiece(aiPos, roll, false);
    aiPos = result.newPos;
    renderTokens();
    
    if (result.won) {
      endGame(false);
    } else {
      if (result.msg) msgEl.textContent = result.msg;
      isPlayerTurn = true;
      updateStatus();
      msgEl.textContent = "Your turn! Click Roll.";
    }
  });
}

function movePiece(currentPos, roll, isPlayer) {
  let next = currentPos + roll;
  if (next > 100) next = currentPos; 
  
  let msg = "";
  let won = (next === 100);
  
  if (snakes[next]) {
    msg = `🐍 Snake bite! Slid to ${snakes[next]}. ${safetyMsgs[snakes[next]] || ''}`;
    next = snakes[next];
  } 
  else if (ladders[next]) {
    msg = `🪜 Ladder climb! Up to ${ladders[next]}. ${safetyMsgs[ladders[next]] || ''}`;
    next = ladders[next];
  } 
  else if (safetyMsgs[next]) {
    msg = safetyMsgs[next];
  }
  
  return { newPos: next, won: won, msg: msg };
}

function animateDice(callback) {
  // 1. Start Animation
  diceEl.classList.add('rolling'); 
  diceValueEl.textContent = "Rolling...";
  
  // 2. Cycle Faces
  const faces = ['⚀', '⚁', '⚂', '', '', '⚅']; // FIXED: All faces present
  let count = 0;
  
  const flash = () => {
    // Change face randomly
    diceEl.textContent = faces[Math.floor(Math.random() * 6)];
    count++;
    
    if (count >= 15) {
      // 3. STOP ANIMATION FORCIBLY
      diceEl.classList.remove('rolling');
      diceEl.style.animation = 'none'; // Emergency stop
      
      // 4. Final Roll Result
      const finalRoll = Math.floor(Math.random() * 6) + 1;
      diceEl.textContent = faces[finalRoll - 1];
      diceValueEl.textContent = `Rolled: ${finalRoll}`;
      
      // Reset inline style after a moment so animation can work again next time
      setTimeout(() => { diceEl.style.animation = ''; }, 100);
      
      callback(finalRoll);
      return;
    }
    
    // Loop
    setTimeout(flash, 80); 
  };
  
  flash();
}

function endGame(playerWon) {
  gameActive = false;
  updateStatus();
  msgEl.textContent = playerWon 
    ? "🎉 YOU WIN! Safety First!" 
    : "🤖 AI Wins! Try again?";
  msgEl.style.color = playerWon ? "#27ae60" : "#e74c3c";
}

function resetGame() {
  pPos = 1;
  aiPos = 1;
  isPlayerTurn = true;
  gameActive = true;
  diceEl.textContent = "🎲";
  diceValueEl.textContent = "Ready";
  msgEl.textContent = "New Game! Roll to start.";
  msgEl.style.color = "var(--accent)";
  rollBtn.onclick = null; 
  init(); // Re-init to attach listener
}

// Run on load
document.addEventListener('DOMContentLoaded', init);
