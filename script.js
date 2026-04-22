const grid = document.getElementById('board');
const diceEl = document.getElementById('dice');
const diceValueEl = document.getElementById('dice-value');
const statusEl = document.getElementById('status');
const msgEl = document.getElementById('message');
const rollBtn = document.getElementById('roll-manual');

let pPos = 1;
let aiPos = 1;
let isPlayerTurn = true;
let gameActive = true;
let autoRollInterval;

const snakes = {
  99: 1, 97: 79, 95: 75, 93: 73, 91: 69, 
  87: 24, 84: 63, 82: 61, 77: 57, 74: 54, 
  67: 47, 64: 60, 46: 25, 44: 23, 42: 21, 
  36: 13, 32: 10
};

const ladders = {
  4: 14, 9: 31, 12: 48, 17: 37, 20: 39, 
  28: 84, 33: 53, 41: 61, 45: 65, 54: 74, 
  62: 80, 71: 91
};

const safetyMsgs = {
  1: "Safety Starts With Me", 10: "Incident Reporting", 15: "Safety Induction",
  20: "Result in Multiple Injury", 25: "Back Arrester", 30: "Prevent Hand Servered",
  40: "Protect Your Eyes", 50: "No Consumption of Alcohol", 60: "Material from Height",
  70: "Damaged Equipment", 80: "Key to Your Safety", 90: "Avoid Fire & Explosions",
  100: "Go Home Safely!"
};

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
}

function addCell(num) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.id = `cell-${num}`;
  let content = num;
  if (snakes[num]) content += `<br>🐍`;
  if (ladders[num]) content += `<br>🪜`;
  if (safetyMsgs[num]) content += `<br><small>${safetyMsgs[num]}</small>`;
  cell.innerHTML = content;
  grid.appendChild(cell);
}

function animateDice(roll, callback) {
  diceEl.classList.add('rolling');
  diceValueEl.textContent = 'Rolling...';
  
  // Rapidly cycle through dice faces for animation effect
  const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
  let cycleCount = 0;
  const maxCycles = 15 + Math.random() * 10; // Random duration for realism
  
  const cycle = setInterval(() => {
    diceEl.textContent = faces[Math.floor(Math.random() * 6)];
    cycleCount++;
    if (cycleCount >= maxCycles) {
      clearInterval(cycle);
      diceEl.classList.remove('rolling');
      diceEl.classList.add('stopped');
      diceEl.textContent = faces[roll - 1];
      diceValueEl.textContent = `Rolled: ${roll}`;
      
      // Remove stopped class after animation
      setTimeout(() => diceEl.classList.remove('stopped'), 500);
      callback();
    }
  }, 80);
}

function rollDice(isAuto = true) {
  if (!gameActive || !isPlayerTurn) return;
  
  isPlayerTurn = false; // Lock turn during animation
  const roll = Math.floor(Math.random() * 6) + 1;
  
  animateDice(roll, () => {
    setTimeout(() => {
      pPos = move(pPos, roll);
      updateUI();
      
      if (pPos === 100) {
        msgEl.textContent = "🎉 YOU WIN! Safety Champion!";
        endGame();
        return;
      }
      
      // AI turn after delay
      setTimeout(aiTurn, 1500);
    }, 300);
  });
}

function aiTurn() {
  if (!gameActive || isPlayerTurn) return;
  
  const roll = Math.floor(Math.random() * 6) + 1;
  
  animateDice(roll, () => {
    setTimeout(() => {
      aiPos = move(aiPos, roll);
      updateUI();
      
      if (aiPos === 100) {
        msgEl.textContent = "🤖 AI WINS! Safety is serious!";
        endGame();
        return;
      }
      
      isPlayerTurn = true;
      // Schedule next auto-roll
      if (gameActive) {
        msgEl.textContent = "Your turn... Auto-roll in 2s";
        setTimeout(() => { if (gameActive && isPlayerTurn) rollDice(); }, 2000);
      }
    }, 300);
  });
}

function move(pos, roll) {
  let next = pos + roll;
  if (next > 100) next = pos;
  
  if (snakes[next]) {
    msgEl.textContent = `🐍 Snake! Slid to ${snakes[next]}. ${safetyMsgs[snakes[next]]||''}`;
    next = snakes[next];
  } else if (ladders[next]) {
    msgEl.textContent = `🪜 Ladder! Climbed to ${ladders[next]}. ${safetyMsgs[ladders[next]]||''}`;
    next = ladders[next];
  } else if (safetyMsgs[next]) {
    msgEl.textContent = safetyMsgs[next];
  }
  
  return next;
}

function updateUI() {
  statusEl.textContent = `You: ${pPos} | AI: ${aiPos}`;
  document.querySelectorAll('.cell').forEach(c => c.style.background = '');
  const pCell = document.getElementById(`cell-${pPos}`);
  const aCell = document.getElementById(`cell-${aiPos}`);
  if(pCell) pCell.style.background = 'rgba(39,174,96,0.3)';
  if(aCell) aCell.style.background = 'rgba(231,76,60,0.3)';
}

function endGame() {
  gameActive = false;
  if (autoRollInterval) clearInterval(autoRollInterval);
  rollBtn.style.display = 'inline-block';
  rollBtn.textContent = 'Play Again';
  rollBtn.onclick = resetGame;
}

function resetGame() {
  pPos = 1; aiPos = 1; isPlayerTurn = true; gameActive = true;
  diceEl.textContent = '🎲';
  diceValueEl.textContent = 'Rolling...';
  msgEl.textContent = 'Game restarting...';
  rollBtn.style.display = 'none';
  updateUI();
  createBoard();
  // Start auto-rolls again
  setTimeout(() => { if (gameActive) rollDice(); }, 1500);
}

// Manual override (optional)
if (rollBtn) {
  rollBtn.addEventListener('click', () => {
    if (gameActive && isPlayerTurn) rollDice();
    else if (!gameActive) resetGame();
  });
}

// Start game automatically
document.addEventListener('DOMContentLoaded', () => {
  createBoard();
  updateUI();
  // First auto-roll after 3 seconds
  setTimeout(() => { if (gameActive) rollDice(); }, 3000);
});
