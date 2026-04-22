const grid = document.getElementById('board');
const rollBtn = document.getElementById('roll');
const statusEl = document.getElementById('status');
const msgEl = document.getElementById('message');

let pPos = 1;
let aiPos = 1;
let isPlayerTurn = true;

// Snakes: Start -> End (Slide Down)
const snakes = {
  99: 1, 97: 79, 95: 75, 93: 73, 91: 69, 
  87: 24, 84: 63, 82: 61, 77: 57, 74: 54, 
  67: 47, 64: 60, 46: 25, 44: 23, 42: 21, 
  36: 13, 32: 10
};

// Ladders: Start -> End (Climb Up)
const ladders = {
  4: 14, 9: 31, 12: 48, 17: 37, 20: 39, 
  28: 84, 33: 53, 41: 61, 45: 65, 54: 74, 
  62: 80, 71: 91
};

// Safety Messages for key squares
const safetyMsgs = {
  1: "Safety Starts With Me",
  10: "Incident Reporting",
  15: "Safety Induction",
  20: "Result in Multiple Injury",
  25: "Back Arrester",
  30: "Prevent Hand Servered",
  40: "Protect Your Eyes",
  50: "No Consumption of Alcohol",
  60: "Material from Height",
  70: "Damaged Equipment",
  80: "Key to Your Safety",
  90: "Avoid Fire & Explosions",
  100: "Go Home Safely!"
};

function createBoard() {
  grid.innerHTML = '';
  
  // Generates 10 rows zigzag
  for (let row = 0; row < 10; row++) {
    let rowNum = 10 - row;
    let base = (rowNum - 1) * 10;
    
    if (row % 2 === 0) {
      // Descending: 100->91, 80->71...
      for (let n = base + 10; n > base; n--) {
        addCell(n);
      }
    } else {
      // Ascending: 81->90, 61->70...
      for (let n = base + 1; n <= base + 10; n++) {
        addCell(n);
      }
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

function rollDice() {
  if (!isPlayerTurn) return;
  rollBtn.disabled = true;
  
  const roll = Math.floor(Math.random() * 6) + 1;
  msgEl.innerText = `You rolled a ${roll}`;
  
  setTimeout(() => {
    pPos = move(pPos, roll);
    updateUI();
    
    if (pPos === 100) {
      msgEl.innerText = "YOU WIN!  Safety Champion!";
      return;
    }
    
    isPlayerTurn = false;
    setTimeout(aiTurn, 1500);
  }, 500);
}

function aiTurn() {
  const roll = Math.floor(Math.random() * 6) + 1;
  msgEl.innerText = `AI rolled a ${roll}`;
  
  setTimeout(() => {
    aiPos = move(aiPos, roll);
    updateUI();
    
    if (aiPos === 100) {
      msgEl.innerText = "AI WINS! 🤖 Safety is serious!";
      return;
    }
    
    isPlayerTurn = true;
    rollBtn.disabled = false;
  }, 500);
}

function move(pos, roll) {
  let next = pos + roll;
  if (next > 100) next = pos; // Bounce back rule
  
  if (snakes[next]) {
    msgEl.innerText += ` -> Snake Bite! 🐍 Sliding to ${snakes[next]}`;
    next = snakes[next];
  } else if (ladders[next]) {
    msgEl.innerText += ` -> Ladder Climb! 🪜 Moving to ${ladders[next]}`;
    next = ladders[next];
  }
  
  return next;
}

function updateUI() {
  statusEl.innerText = `You: ${pPos} | AI: ${aiPos}`;
  
  // Highlight current positions
  document.querySelectorAll('.cell').forEach(c => c.style.background = '');
  
  const pCell = document.getElementById(`cell-${pPos}`);
  const aCell = document.getElementById(`cell-${aiPos}`);
  
  if(pCell) pCell.style.background = '#a3d9ff'; // Blue for player
  if(aCell) aCell.style.background = '#ffcccc'; // Red for AI
}

rollBtn.addEventListener('click', rollDice);
createBoard();
updateUI();
