const canvas = document.getElementById("mapa");
const ctx = canvas.getContext("2d");

const tamanho = 10; // 10x10
const celula = 40;  // tamanho de cada quadrado
let mapa = [];      // matriz [y][x]
let inicio = null;
let destino = null;
let caminho = [];
let tipoDeElemento = 0;  // Padrão: rua (0)

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

// Desenha cada célula com base no tipo
function desenharMapa() {
  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {
      switch (mapa[y][x]) {
        case 0: ctx.fillStyle = "#ccc"; break;       // Rua
        case 1: ctx.fillStyle = "#333"; break;       // Obstáculo (manual)
        case 2: ctx.fillStyle = "green"; break;      // Início
        case 3: ctx.fillStyle = "red"; break;        // Destino
        case 4: ctx.fillStyle = "#ff6347"; break;    // Engarrafamento
        case 6: ctx.fillStyle = "#00bcd4"; break;    // Praça
        case 7: ctx.fillStyle = "#8e44ad"; break;    // Prédio
        case 5: ctx.fillStyle = "#ffeb3b"; break;    // Casa (opcional extra)
        default: ctx.fillStyle = "#999"; break;
      }
      ctx.fillRect(x * celula, y * celula, celula - 1, celula - 1);
    }
  }
}

// Define o tipo de elemento a ser colocado no clique
function setTipoElemento(tipo) {
  tipoDeElemento = tipo;
}

// Clique no canvas
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / celula);
  const y = Math.floor((e.clientY - rect.top) / celula);

  const valor = mapa[y][x];

  // Definindo início e destino de forma exclusiva
  if (tipoDeElemento === 2) {
    if (inicio) mapa[inicio.y][inicio.x] = 0;
    inicio = { x, y };
  }

  if (tipoDeElemento === 3) {
    if (destino) mapa[destino.y][destino.x] = 0;
    destino = { x, y };
  }

  mapa[y][x] = tipoDeElemento;
  desenharMapa();

  // Se início e destino estão definidos, tenta encontrar caminho
  if (inicio && destino) {
    encontrarCaminho();
  }
});

// Gera engarrafamentos aleatórios em ruas
function gerarEngarrafamento() {
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(Math.random() * tamanho);
    const y = Math.floor(Math.random() * tamanho);
    if (mapa[y][x] === 0) mapa[y][x] = 4; // 4 = engarrafamento
  }
  desenharMapa();
}

// Resetar tudo
function resetar() {
  inicio = null;
  destino = null;
  caminho = [];
  criarMapa();
}

// Busca caminho com BFS (evita obstáculos e engarrafamentos)
function encontrarCaminho() {
  const fila = [];
  const visitado = Array.from({ length: tamanho }, () => Array(tamanho).fill(false));
  const anterior = Array.from({ length: tamanho }, () => Array(tamanho).fill(null));

  fila.push(inicio);
  visitado[inicio.y][inicio.x] = true;

  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];
  let encontrou = false;

  while (fila.length > 0) {
    const atual = fila.shift();
    const { x, y } = atual;

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
        [0, 3].includes(mapa[ny][nx])  // Só passa por rua e destino
      ) {
        fila.push({ x: nx, y: ny });
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

// Anima o caminho com azul
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

// Salvar mapa atual no localStorage
function salvarMapa() {
  const nome = document.getElementById("nomeCidade").value.trim();
  if (!nome) {
    alert("Digite um nome para a cidade!");
    return;
  }

  const dados = {
    mapa: mapa,
    inicio: inicio,
    destino: destino
  };

  localStorage.setItem("cidade_" + nome, JSON.stringify(dados));
  alert("✅ Cidade salva como: " + nome);
  atualizarListaCidades();
}

// Carregar mapa pelo nome digitado
function carregarMapa() {
  const nome = document.getElementById("nomeCidade").value.trim();
  if (!nome) {
    alert("Digite o nome da cidade para carregar!");
    return;
  }

  const dados = localStorage.getItem("cidade_" + nome);
  if (!dados) {
    alert("❌ Cidade não encontrada.");
    return;
  }

  const { mapa: m, inicio: ini, destino: dest } = JSON.parse(dados);
  mapa = m;
  inicio = ini;
  destino = dest;
  desenharMapa();

  if (inicio && destino) encontrarCaminho();
}

// Atualizar a lista de cidades no <select>
function atualizarListaCidades() {
  const select = document.getElementById("listaCidades");
  select.innerHTML = '<option value="">-- Cidades salvas --</option>';

  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    if (chave.startsWith("cidade_")) {
      const nome = chave.replace("cidade_", "");
      const option = document.createElement("option");
      option.value = nome;
      option.textContent = nome;
      select.appendChild(option);
    }
  }
}

// Carregar cidade ao selecionar do dropdown
function selecionarCidade(nome) {
  if (!nome) return;
  document.getElementById("nomeCidade").value = nome;
  carregarMapa();
}

criarMapa();
atualizarListaCidades(); // Atualiza a lista ao abrir a página
