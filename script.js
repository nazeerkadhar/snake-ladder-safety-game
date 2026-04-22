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
  
  // Remove old listeners to prevent duplicates
  const newBtn = rollBtn.cloneNode(true);
  rollBtn.parentNode.replaceChild(newBtn, rollBtn);
  newBtn.addEventListener('click', playerTurn);
}

function createBoard() {
  grid.innerHTML = '';
  for (let row = 0; row < 10; row++) {
    let base = (9 - row) * 10;
    for (let i = 0; i < 10; i++) {
      let num = (row % 2 === 0) ? base + (10 - i) : base + (1 + i);
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = `cell-${num}`;
      cell.innerHTML = `<div class="cell-num">${num}</div>` +
        (snakes[num] ? '<div class="cell-icon">🐍</div>' : ladders[num] ? '<div class="cell-icon">🪜</div>' : '<div style="height:20px"></div>') +
        (safetyMsgs[num] ? `<div class="cell-msg">${safetyMsgs[num]}</div>` : '');
      grid.appendChild(cell);
    }
  }
}

function renderTokens() {
  document.querySelectorAll('.cell').forEach(c => {
    c.style.border = '1px solid #34495e';
    c.style.background = parseInt(c.id.split('-')[1]) % 2 !== 0 ? '#2c3e50' : '#3d566e';
  });
  const pCell = document.getElementById(`cell-${pPos}`);
  if (pCell) { pCell.style.border = '2px solid #27ae60'; pCell.style.background = '#1e3a2f'; }
  const aCell = document.getElementById(`cell-${aiPos}`);
  if (aCell) { aCell.style.border = '2px solid #e74c3c'; aCell.style.background = '#3a1e1e'; }
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
    const res = movePiece(pPos, roll, true);
    pPos = res.newPos;
    renderTokens();
    if (res.won) endGame(true);
    else {
      if (res.msg) msgEl.textContent = res.msg;
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
    const res = movePiece(aiPos, roll, false);
    aiPos = res.newPos;
    renderTokens();
    if (res.won) endGame(false);
    else {
      if (res.msg) msgEl.textContent = res.msg;
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
  
  if (snakes[next]) { msg = `🐍 Snake! Slid to ${snakes[next]}.`; next = snakes[next]; }
  else if (ladders[next]) { msg = `🪜 Ladder! Up to ${ladders[next]}.`; next = ladders[next]; }
  
  return { newPos: next, won: won, msg: msg };
}

// --- ANIMATION LOGIC (FIXED) ---
function animateDice(callback) {
  // 1. FORCE STOP ANY STUCK ANIMATION
  diceEl.style.animation = 'none';
  diceEl.classList.remove('rolling');
  
  // 2. ALL 6 FACES (Fixed missing faces that caused blinking)
  const faces = ['⚀', '⚁', '', '⚃', '⚄', '⚅'];
  let count = 0;
  
  // 3. USE INTERVAL FOR RELIABLE STOPPING
  const interval = setInterval(() => {
    diceEl.textContent = faces[Math.floor(Math.random() * 6)];
    count++;
    
    if (count >= 12) {
      clearInterval(interval); // FORCE STOP
      const finalRoll = Math.floor(Math.random() * 6) + 1;
      diceEl.textContent = faces[finalRoll - 1];
      diceValueEl.textContent = "Rolled: " + finalRoll;
      callback(finalRoll);
    }
  }, 80);
}

function endGame(playerWon) {
  gameActive = false;
  updateStatus();
  msgEl.textContent = playerWon ? "🎉 YOU WIN! Safety First!" : "🤖 AI Wins! Try again?";
  msgEl.style.color = playerWon ? "#27ae60" : "#e74c3c";
}

function resetGame() {
  pPos = 1; aiPos = 1; isPlayerTurn = true; gameActive = true;
  diceEl.textContent = "🎲";
  diceValueEl.textContent = "Ready";
  msgEl.textContent = "New Game! Roll to start.";
  msgEl.style.color = "var(--accent)";
  rollBtn.onclick = null;
  init();
}

// Run on load
document.addEventListener('DOMContentLoaded', init);
