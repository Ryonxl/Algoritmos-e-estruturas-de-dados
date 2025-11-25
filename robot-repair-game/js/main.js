import { RobotList } from './estruturas.js';
import { ComponentStack } from './estruturas.js';
import { generateRobot } from './robot_generator.js';
import { UI } from './ui.js';

// Configurações do jogo
const MAX_CONCURRENT = 8;     
const MAX_TOTAL_SPAWN = 30;   
const WIN_TARGET = 30;        
const START_SPAWN_MS = 6000;  
const MIN_SPAWN_MS = 1500;    
const ACCEL_PERIOD = 120;     

// Elementos do DOM
const canvas = document.getElementById('gameCanvas');
const overlayNome = document.getElementById('overlayNomeJogador');
const nomeJogadorInput = document.getElementById('nomeJogador');
let selectJogador = document.getElementById('selectJogador');

if (!selectJogador) {
  selectJogador = document.createElement('select');
  selectJogador.id = 'selectJogador';
  nomeJogadorInput.parentNode.insertBefore(selectJogador, nomeJogadorInput.nextSibling);
}

const btnModalIniciar = document.getElementById('btnIniciar');
const overlayGameOver = document.getElementById('overlayGameOver');
const tituloGameOver = document.getElementById('tituloGameOver');
const mensagemGameOver = document.getElementById('mensagemGameOver');
const btnTentarNovamente = document.getElementById('btnTentarNovamente');
const btnNovoJogador = document.getElementById('btnNovoJogador');

const labelJogador = document.getElementById('labelJogador');
const curCountEl = document.getElementById('contadorFila');
const maxCountEl = document.getElementById('maxFila');
const fixedCountEl = document.getElementById('contadorConsertados');
const compCountEl = document.getElementById('contadorComponentes');
const timeEl = document.getElementById('tempoJogo');
const inputCodigo = document.getElementById('inputCodigo');
const btnStartGame = document.getElementById('btnIniciarJogo');
const btnReset = document.getElementById('btnReset');
const rankingEl = document.getElementById('ranking');
const detalheRoboEl = document.getElementById('detalheRobo');

maxCountEl.textContent = MAX_CONCURRENT;

// Estado do jogo
let playerName = '';
let running = false;
let robotList = new RobotList();
let game = { robotList, selectedNode: null };
let ui = new UI(canvas, game);

let nextId = 1;
let fixedCount = 0;
let compCount = 0;
let elapsed = 0;
let lastTime = performance.now();
let spawnMs = START_SPAWN_MS;
let spawnTimer = 0;
let totalSpawned = 0;

/********** FUNÇÕES DE RANKING **********/

function loadRanking() {
  const raw = localStorage.getItem('robot_repair_ranking');
  try { return raw ? JSON.parse(raw) : []; } catch(e){ return []; }
}

function saveRankingArray(arr){ 
  localStorage.setItem('robot_repair_ranking', JSON.stringify(arr.slice(0,50))); 
}

function renderRanking() {
  const arr = loadRanking();
  rankingEl.innerHTML = '';
  selectJogador.innerHTML = '<option value="">-- Selecione --</option>';

  if (arr.length === 0) {
    rankingEl.innerHTML = '<div class="small">Nenhuma partida salva.</div>';
    return;
  }

  arr.slice(0,20).forEach((r, idx) => {
    const d = document.createElement('div');
    d.className = 'rank-item';
    d.innerHTML = `<b>#${idx+1} ${r.name}</b> — Robôs: ${r.fixed} • Tempo: ${r.time}s`;
    rankingEl.appendChild(d);

    const opt = document.createElement('option');
    opt.value = r.name;
    opt.textContent = r.name;
    selectJogador.appendChild(opt);
  });
}

function nameExists(name) {
  const arr = loadRanking();
  return arr.some(r => r.name.toLowerCase() === name.toLowerCase());
}

/********** HUD **********/

function updateHUD() {
  curCountEl.textContent = robotList.size();
  fixedCountEl.textContent = fixedCount;
  compCountEl.textContent = compCount;
  timeEl.textContent = Math.floor(elapsed);
  labelJogador.textContent = playerName || '—';

  const sel = game.selectedNode;
  if (!sel) {
    detalheRoboEl.innerHTML = 'Nenhum robô selecionado';
  } else {
    const r = sel.robot;
    let html = `<b>${r.model} (ID: ${r.id})</b><br>`;
    html += `Prioridade: ${r.priority} — Estado: ${r.state || (r.components.isEmpty() ? 'consertado' : 'pendente')}<br>`;
    html += `<u>Pilha (topo primeiro):</u><ol>`;
    for (const c of r.components) {
      html += `<li>${c.nome} — Código: <b>${c.codigo}</b> — ${c.tempoEst}s</li>`;
    }
    html += `</ol>`;
    detalheRoboEl.innerHTML = html;
  }
}

function saveRanking(name,fixed,time){
  const arr = loadRanking();
  const existing = arr.find(r=>r.name===name);
  if(existing){
    if(fixed>existing.fixed || (fixed===existing.fixed && time<existing.time)){
      existing.fixed = fixed; existing.time = time;
    }
  } else arr.push({name,fixed,time});

  arr.sort((a,b)=>{
    if(b.fixed!==a.fixed) return b.fixed-a.fixed;
    return a.time-b.time;
  });

  saveRankingArray(arr);
  renderRanking();
}

/********** SPAWN **********/

function spawnWave(){
  if(!running || totalSpawned >= MAX_TOTAL_SPAWN) return;

  const count = Math.random()<0.4?1:Math.random()<0.85?2:3;
  for(let i=0;i<count;i++){
    if(totalSpawned>=MAX_TOTAL_SPAWN) break;
    const r = generateRobot(nextId++);
    const node = robotList.insertByPriority(r);
    node._repairedAnim=0;
    node._removeAfter=false;
    totalSpawned++;
  }

  ui.draw();
  updateHUD();
}

/********** MODAIS E BOTÕES **********/

btnModalIniciar.addEventListener('click',()=>{
  let v = nomeJogadorInput.value.trim() || selectJogador.value;
  if(!v){ alert('Escolha ou digite um nickname'); return; }
  playerName=v;
  overlayNome.style.display='none';
  btnStartGame.disabled=false;
  resetGameState();
});

selectJogador.addEventListener('change', ()=>{
  if(selectJogador.value) nomeJogadorInput.value=selectJogador.value;
});

btnStartGame.addEventListener('click',()=>{
  if(!playerName){ alert('Escolha ou digite um nickname'); return; }
  if(!running){
    running=true;
    elapsed=0;
    fixedCount=0;
    compCount=0;
    spawnMs=START_SPAWN_MS;
    spawnTimer=0;
    lastTime=performance.now();
    spawnWave();
  }
});

btnReset.addEventListener('click',()=>{
  if(!confirm('Resetar jogo e ranking?')) return;
  running=false;
  resetGameState();
  localStorage.removeItem('robot_repair_ranking');
  renderRanking();
  // Mantém o jogador atual após reset
  if(playerName) {
    btnStartGame.disabled=false;
    nomeJogadorInput.value=playerName;
    selectJogador.value=playerName;
  }
});

function resetGameState(){
  while(robotList.head) robotList.removeNode(robotList.head);
  game.selectedNode=null;
  nextId=1;
  fixedCount=0;
  compCount=0;
  elapsed=0;
  spawnMs=START_SPAWN_MS;
  spawnTimer=0;
  totalSpawned=0;
  ui.draw();
  updateHUD();
}

/********** INTERAÇÕES **********/

canvas.addEventListener('click',e=>{
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX-rect.left;
  const my = e.clientY-rect.top;
  ui.draw();
  const node = ui.hitTest(mx,my);
  if(node){
    inputCodigo.value='';
    game.selectedNode=node;
    ui.game.selectedNode=node;
    updateHUD();
  }
});

inputCodigo.addEventListener('keydown',e=>{
  if(e.key!=='Enter') return;
  const code = inputCodigo.value.trim();
  if(!code) return;
  const sel = game.selectedNode;
  if(!sel){ inputCodigo.value=''; alert('Selecione um robô primeiro'); return; }
  const top = sel.robot.components.peek();
  if(!top){ inputCodigo.value=''; return; }

  if(code.toUpperCase()===top.codigo.toUpperCase()){
    sel.robot.components.pop();
    compCount++;
    if(sel.robot.components.isEmpty()){
      sel.robot.state='consertado';
      sel._removeAfter=true;
      sel._repairedAnim=0;
    }
  } else elapsed+=2;
  inputCodigo.value='';
  updateHUD();
});

btnTentarNovamente.addEventListener('click',()=>{
  overlayGameOver.style.display='none';
  resetGameState();
  // Mantém o jogador atual ao tentar novamente
  if(playerName){
    btnStartGame.disabled=false;
    nomeJogadorInput.value=playerName;
    selectJogador.value=playerName;
  }
  btnStartGame.click();
});

btnNovoJogador.addEventListener('click',()=>{
  overlayGameOver.style.display='none';
  overlayNome.style.display='flex';
  nomeJogadorInput.value='';
  selectJogador.value='';
  btnStartGame.disabled=true;
  playerName='';
});

/********** LOOP PRINCIPAL **********/

function loop(ts){
  const now=performance.now();
  const dt=(now-lastTime)/1000;
  lastTime=now;

  if(running){
    elapsed+=dt;
    spawnTimer+=dt*1000;

    const t=Math.min(elapsed,ACCEL_PERIOD);
    const frac=t/ACCEL_PERIOD;
    spawnMs=START_SPAWN_MS-((START_SPAWN_MS-MIN_SPAWN_MS)*frac);

    if(spawnTimer>=spawnMs){
      spawnTimer=0;
      spawnWave();
    }

    let cur=robotList.head;
    while(cur){
      const next=cur.next;
      if(cur._removeAfter){
        cur._repairedAnim=Math.min(1,(cur._repairedAnim||0)+dt/0.9);
        if(cur._repairedAnim>=1){
          const candidate=cur.next||cur.prev;
          robotList.removeNode(cur);
          fixedCount++;
          if(fixedCount>=WIN_TARGET){
            running=false;
            saveRanking(playerName,fixedCount,Math.floor(elapsed));
            setTimeout(()=>{
              tituloGameOver.textContent='Vitória!';
              mensagemGameOver.textContent=`Você venceu! Consertou ${fixedCount} robôs em ${Math.floor(elapsed)}s.`;
              overlayGameOver.style.display='flex';
              while(robotList.head) robotList.removeNode(robotList.head);
            },50);
            break;
          }
          game.selectedNode=candidate;
          ui.game.selectedNode=candidate;
        }
      }
      cur=next;
    }

    if(robotList.size()>MAX_CONCURRENT){
      running=false;
      saveRanking(playerName,fixedCount,Math.floor(elapsed));
      tituloGameOver.textContent='Game Over';
      mensagemGameOver.textContent=`Robôs excederam o limite. Consertou ${fixedCount} robôs em ${Math.floor(elapsed)}s.`;
      overlayGameOver.style.display='flex';
      // Mantém o jogador atual
      if(playerName){
        nomeJogadorInput.value=playerName;
        selectJogador.value=playerName;
        btnStartGame.disabled=false;
      }
    }

    if(totalSpawned>=MAX_TOTAL_SPAWN && robotList.size()===0 && running){
      running=false;
      saveRanking(playerName,fixedCount,Math.floor(elapsed));
      tituloGameOver.textContent='Partida finalizada';
      mensagemGameOver.textContent=`Partida finalizada. Consertou ${fixedCount} robôs em ${Math.floor(elapsed)}s.`;
      overlayGameOver.style.display='flex';
      // Mantém o jogador atual
      if(playerName){
        nomeJogadorInput.value=playerName;
        selectJogador.value=playerName;
        btnStartGame.disabled=false;
      }
    }
  }

  ui.draw();
  updateHUD();
  requestAnimationFrame(loop);
}

// Inicializa
renderRanking();
updateHUD();
requestAnimationFrame(loop);
