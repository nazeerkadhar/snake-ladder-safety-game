const grid = document.getElementById('board');
const diceEl = document.getElementById('dice');
const diceValueEl = document.getElementById('dice-value');
const statusEl = document.getElementById('status');
const msgEl = document.getElementById('message');
const rollBtn = document.getElementById('roll-btn');

let pPos = 1;
let aiPos = 1;
let isPlayerTurn = true;
let gameActive = true;

const snakes = { 99:1, 97:79, 95:75, 93:73, 91:69, 87:24, 84:63, 82:61, 77:57, 74:54, 67:47, 64:60, 46:25, 44:23, 42:21, 36:13, 32:10 };
const ladders = { 4:14, 9:31, 12:48, 17:37, 20:39, 28:84, 33:53, 41:61, 45:65, 54:74, 62:80, 71:91 };
const safetyMsgs = { 1:"Safety Starts With Me", 10:"Incident Reporting", 15:"Safety Induction", 20:"Multiple Injury", 25:"Back Arrester", 30:"Prevent Hand Servered", 40:"Protect Eyes", 50:"No Alcohol", 60:"Material from Height", 70:"Damaged Equip", 80:"Key to Safety", 90:"Avoid Fire", 100:"Go Home Safely!" };

function createBoard() {
  grid.innerHTML = '';
  for (let row = 0; row < 10; row++) {
    let rowNum = 10 - row;
    let base = (rowNum - 1) * 10;
    if (row % 2 === 0) {
      for (let n = base + 10; n > base; n--) addCell(n);
    } else {
      for (let n = base + 1; n <= base + 10; n++) addCell(n);
    }
  }
  renderTokens();
}

function addCell(num) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.id = `cell-${num}`;
  cell.innerHTML = `
    <div class="cell-num">${num}</div>
    ${snakes[num] ? '<div class="cell-icon">🐍</div>' : ''}
    ${ladders[num] ? '<div class="cell-icon">🪜</div>' : ''}
    ${safetyMsgs[num] ? `<div class="cell-msg">${safetyMsgs[num]}</div>` : ''}
  `;
  grid.appendChild(cell);
}

function renderTokens() {
  document.querySelectorAll('.cell').forEach(c => {
    const n = parseInt(c.id.split('-')[1]);
    c.style.boxShadow = 'none';
    c.style.background = n % 2 === 0 ? '#3d566e' : '#2c3e50';
  });
  const pCell = document.getElementById(`cell-${pPos}`);
  const aCell = document.getElementById(`cell-${aiPos}`);
  if(pCell) { pCell.style.boxShadow = 'inset 0 0 0 3px #27ae60'; pCell.style.background = '#1e3a2f'; }
  if(aCell) { aCell.style.boxShadow = 'inset 0 0 0 3px #e74c3c'; aCell.style.background = '#3a1e1e'; }
}

function animateDice(callback) {
  diceEl.classList.add('rolling');
  diceValueEl.textContent = 'Rolling...';
  const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
  let count = 0;
  const interval = setInterval(() => {
    diceEl.textContent = faces[Math.floor(Math.random() * 6)];
    count++;
    if (count > 12) {
      clearInterval(interval);
      diceEl.classList.remove('rolling');
      const roll = Math.floor(Math.random() * 6) + 1;
      diceEl.textContent = faces[roll - 1];
      diceValueEl.textContent = `Rolled: ${roll}`;
      callback(roll);
    }
  }, 80);
}

function processMove(pos, roll, isPlayer) {
  let next = pos + roll;
  if (next > 100) next = pos;
  let msg = '';
  
  if (snakes[next]) {
    msg = `🐍 Snake! Slid to ${snakes[next]}. ${safetyMsgs[snakes[next]]||''}`;
    next = snakes[next];
  } else if (ladders[next]) {
    msg = `🪜 Ladder! Climbed to ${ladders[next]}. ${safetyMsgs[ladders[next]]||''}`;
    next = ladders[next];
  } else if (safetyMsgs[next]) {
    msg = safetyMsgs[next];
  }
  
  if (isPlayer) pPos = next; else aiPos = next;
  
  renderTokens();
  updateStatus();
  if (msg) msgEl.textContent = msg;
  
  if (next === 100) {
    gameActive = false;
    rollBtn.disabled = true;
    msgEl.textContent = isPlayer ? "🎉 YOU WIN! Safety Champion!" : "🤖 AI WINS! Better luck next time.";
    msgEl.style.color = isPlayer ? '#27ae60' : '#e74c3c';
    return true;
  }
  return false;
}

function updateStatus() {
  statusEl.textContent = isPlayerTurn ? "🟢 Your Turn" : "🔴 AI's Turn";
  rollBtn.disabled = !isPlayerTurn || !gameActive;
  statusEl.textContent += ` | You: ${pPos} | AI: ${aiPos}`;
}

function playerRoll() {
  if (!gameActive || !isPlayerTurn) return;
  rollBtn.disabled = true;
  msgEl.textContent = "Rolling...";
  
  animateDice((roll) => {
    const ended = processMove(pPos, roll, true);
    if (!ended) {
      isPlayerTurn = false;
      updateStatus();
      setTimeout(aiTurn, 1200);
    }
  });
}

function aiTurn() {
  if (!gameActive || isPlayerTurn) return;
  msgEl.textContent = "🤖 AI is rolling...";
  
  animateDice((roll) => {
    const ended = processMove(aiPos, roll, false);
    if (!ended) {
      isPlayerTurn = true;
      updateStatus();
      msgEl.textContent = "Your turn! Roll the dice.";
    }
  });
}

rollBtn.addEventListener('click', playerRoll);
document.addEventListener('DOMContentLoaded', () => {
  createBoard();
  updateStatus();
  msgEl.textContent = "🎲 Click ROLL DICE to start!";
});
