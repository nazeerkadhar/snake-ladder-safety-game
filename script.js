const snakes={99:1,97:79,95:75,93:73,91:69,87:24,84:63,82:61,77:57,74:54,67:47,64:60,46:25,44:23,42:21,36:13,32:10};
const ladders={4:14,9:31,12:48,17:37,20:39,28:84,33:53,41:61,45:65,54:74,62:80,71:91};
const msg={1:"Safety Starts With Me",10:"Incident Reporting",15:"Safety Induction",20:"Multiple Injury",25:"Back Arrester",30:"Prevent Hand Servered",40:"Protect Eyes",50:"No Alcohol",60:"Material from Height",70:"Damaged Equip",80:"Key to Safety",90:"Avoid Fire",100:"Go Home Safely!"};

let p=1,a=1,turn=true,active=true;
const g=document.getElementById('board'),d=document.getElementById('dice'),dv=document.getElementById('dice-value'),s=document.getElementById('status'),m=document.getElementById('message'),b=document.getElementById('roll-btn');

function init(){
  if(!g||!b) return console.error("Board or button missing");
  g.innerHTML='';
  for(let r=0;r<10;r++){let base=(9-r)*10;for(let i=0;i<10;i++){let n=r%2===0?base+(10-i):base+(1+i);let c=document.createElement('div');c.className='cell';c.id='c'+n;c.innerHTML=`<div class="num">${n}</div>${snakes[n]?'<div class="icon">🐍</div>':ladders[n]?'<div class="icon">🪜</div>':'<div class="icon"> </div>'}${msg[n]?`<div class="msg">${msg[n]}</div>`:''}`;g.appendChild(c);}}
  render();upd();m.textContent="Click ROLL to start";
  console.log("Game initialized successfully");
}

function render(){
  document.querySelectorAll('.cell').forEach(c=>{c.style.border='1px solid #34495e';c.style.background=parseInt(c.id.slice(1))%2?'#2c3e50':'#3d566e';});
  let pc=document.getElementById('c'+p),ac=document.getElementById('c'+a);
  if(pc){pc.style.border='2px solid #27ae60';pc.style.background='#1e3a2f';}
  if(ac){ac.style.border='2px solid #e74c3c';ac.style.background='#3a1e1e';}
}

function upd(){
  if(!active){s.textContent="Game Over";b.textContent="Play Again";b.disabled=false;b.onclick=resetGame;return;}
  s.textContent=turn?`🟢 Your Turn | You:${p} AI:${a}`:`🔴 AI Turn | You:${p} AI:${a}`;
  b.disabled=!turn;
}

function spin(cb){
  d.style.animation='none';
  let i=0,f=['⚀','⚁','⚂','⚃','⚄','⚅'];
  let iv=setInterval(()=>{d.textContent=f[Math.floor(Math.random()*6)];i++;if(i>10){clearInterval(iv);let r=Math.floor(Math.random()*6)+1;d.textContent=f[r-1];dv.textContent='Rolled: '+r;cb(r);}},80);
}

function move(pos,r,isP){
  let n=pos+r;if(n>100)n=pos;
  let ms='';
  if(snakes[n]){ms=`🐍 Snake! → ${snakes[n]}`;n=snakes[n];}
  else if(ladders[n]){ms=`🪜 Ladder! → ${ladders[n]}`;n=ladders[n];}
  if(isP)p=n;else a=n;
  render();if(ms)m.textContent=ms;
  if(n===100){active=false;upd();m.textContent=isP?'🎉 YOU WIN!':'🤖 AI WINS!';m.style.color=isP?'#27ae60':'#e74c3c';return true;}
  return false;
}

function play(){
  if(!active||!turn)return;
  b.disabled=true;m.textContent='Rolling...';
  spin(r=>{
    if(!move(p,r,true)){
      turn=false;upd();
      setTimeout(()=>{
        if(!active)return;
        m.textContent='🤖 AI rolling...';
        spin(ar=>{
          if(!move(a,ar,false)){
            turn=true;upd();
            m.textContent='Your turn! Click ROLL.';
          }
        });
      },1200);
    }
  });
}

function resetGame(){
  p=1;a=1;turn=true;active=true;
  d.textContent='🎲';dv.textContent='Ready';
  m.textContent='New game! Click ROLL.';m.style.color='#bdc3c7';
  b.textContent='🎲 ROLL DICE';b.onclick=null;
  b.addEventListener('click', play); // Reattach for manual clicks if needed
  init();
}

document.addEventListener('DOMContentLoaded', init);
