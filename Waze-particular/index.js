const canvas = document.getElementById("mapa");
const ctx = canvas.getContext("2d");

const tamanho = 10; // 10x10
const celula = 40;  // tamanho de cada quadrado
let mapa = [];      // matriz [y][x]
let inicio = null;
let destino = null;
let caminho = [];

// Criar matriz inicial (array clássico)
function criarMapa() {
  mapa = [];
  for (let y = 0; y < tamanho; y++) {
    mapa[y] = [];
    for (let x = 0; x < tamanho; x++) {
      mapa[y][x] = 0; // 0 = rua
    }
  }
  desenharMapa();
}

// Desenha cada célula
function desenharMapa() {
  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {
      if (mapa[y][x] === 0) ctx.fillStyle = "#ccc"; // rua
      if (mapa[y][x] === 1) ctx.fillStyle = "#333"; // obstáculo
      if (mapa[y][x] === 2) ctx.fillStyle = "green"; // início
      if (mapa[y][x] === 3) ctx.fillStyle = "red"; // destino
      ctx.fillRect(x * celula, y * celula, celula - 1, celula - 1);
    }
  }
}

// Converter clique para coordenadas
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / celula);
  const y = Math.floor((e.clientY - rect.top) / celula);

  if (!inicio) {
    mapa[y][x] = 2;
    inicio = { x, y };
  } else if (!destino) {
    mapa[y][x] = 3;
    destino = { x, y };
    encontrarCaminho();
  }
  desenharMapa();
});

// Gerar obstáculos aleatórios
function gerarObstaculos() {
  resetar();
  for (let i = 0; i < 25; i++) {
    const x = Math.floor(Math.random() * tamanho);
    const y = Math.floor(Math.random() * tamanho);
    if (mapa[y][x] === 0) mapa[y][x] = 1;
  }
  desenharMapa();
}

// Resetar o mapa
function resetar() {
  inicio = null;
  destino = null;
  caminho = [];
  criarMapa();
}

// Implementação de BFS usando arrays clássicos
function encontrarCaminho() {
  const filaX = [];
  const filaY = [];
  const visitado = [];
  const anterior = [];

  for (let y = 0; y < tamanho; y++) {
    visitado[y] = [];
    anterior[y] = [];
    for (let x = 0; x < tamanho; x++) {
      visitado[y][x] = false;
      anterior[y][x] = null;
    }
  }

  filaX.push(inicio.x);
  filaY.push(inicio.y);
  visitado[inicio.y][inicio.x] = true;

  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];
  let encontrou = false;

  while (filaX.length > 0) {
    const x = filaX.shift();
    const y = filaY.shift();

    if (x === destino.x && y === destino.y) {
      encontrou = true;
      break;
    }

    for (let i = 0; i < 4; i++) {
      const nx = x + dx[i];
      const ny = y + dy[i];
      if (
        nx >= 0 && nx < tamanho &&
        ny >= 0 && ny < tamanho &&
        !visitado[ny][nx] &&
        (mapa[ny][nx] === 0 || mapa[ny][nx] === 3)
      ) {
        filaX.push(nx);
        filaY.push(ny);
        visitado[ny][nx] = true;
        anterior[ny][nx] = { x, y };
      }
    }
  }

  if (!encontrou) {
    alert("🚫 Nenhum caminho possível!");
    return;
  }

  // Reconstruir caminho
  let p = { x: destino.x, y: destino.y };
  const temp = [];
  while (p && !(p.x === inicio.x && p.y === inicio.y)) {
    temp.push(p);
    p = anterior[p.y][p.x];
  }
  caminho = temp.reverse();
  animarCaminho();
}

// Anima o deslocamento do carro
function animarCaminho() {
  let i = 0;
  const timer = setInterval(() => {
    desenharMapa();
    ctx.fillStyle = "blue";
    for (let j = 0; j <= i && j < caminho.length; j++) {
      const { x, y } = caminho[j];
      ctx.fillRect(x * celula, y * celula, celula - 1, celula - 1);
    }
    i++;
    if (i > caminho.length) clearInterval(timer);
  }, 200);
}

criarMapa();