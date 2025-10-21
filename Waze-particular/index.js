const canvas = document.getElementById("mapa");
const ctx = canvas.getContext("2d");

const tamanho = 10;
const celula = 40;
let mapa = [];
let inicio = null;
let destino = null;
let caminho = [];
let tipoDeElemento = 0;

function criarMapa() {
  mapa = [];
  for (let y = 0; y < tamanho; y++) {
    mapa[y] = [];
    for (let x = 0; x < tamanho; x++) {
      mapa[y][x] = 0;
    }
  }
  desenharMapa();
}

function desenharMapa() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "28px Arial";

  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {
      const tipo = mapa[y][x];
      const px = x * celula;
      const py = y * celula;

      // Fundo padrão
      ctx.fillStyle = "#ccc";
      ctx.fillRect(px, py, celula - 1, celula - 1);

       switch (tipo) {
        case 0: // Rua
          break; // já está cinza

        case 1: // 🏠 Casa
          ctx.fillText("🏠", px + celula / 2, py + celula / 2);
          break;

        case 2: // 🚗 Início
          ctx.fillText("🚗", px + celula / 2, py + celula / 2);
          break;

        case 3: // 📍 Destino
          ctx.fillText("📍", px + celula / 2, py + celula / 2);
          break;

        case 4: // 🔥 Engarrafamento
          ctx.fillStyle = "#ff6347";
          ctx.fillText("🔥", px + celula / 2, py + celula / 2);
          break;

        case 6: // 🌳 Praça
          ctx.fillText("🌳", px + celula / 2, py + celula / 2);
          break;

        case 7: // 🏢 Prédio
          ctx.fillText("🏢", px + celula / 2, py + celula / 2);
          break;

        default:
          ctx.fillStyle = "#999"; // desconhecido
          ctx.fillRect(px, py, celula - 1, celula - 1);
          break;
      }
    }
  }
}

function setTipoElemento(tipo) {
  tipoDeElemento = tipo;
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / celula);
  const y = Math.floor((e.clientY - rect.top) / celula);

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

  if (inicio && destino) {
    encontrarCaminho();
  }
});

function gerarEngarrafamento() {
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(Math.random() * tamanho);
    const y = Math.floor(Math.random() * tamanho);
    if (mapa[y][x] === 0) mapa[y][x] = 4;
  }
  desenharMapa();
}

function resetar() {
  inicio = null;
  destino = null;
  caminho = [];
  criarMapa();
}

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
        [0, 3].includes(mapa[ny][nx])
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

  let p = { x: destino.x, y: destino.y };
  const temp = [];
  while (p && !(p.x === inicio.x && p.y === inicio.y)) {
    temp.push(p);
    p = anterior[p.y][p.x];
  }
  caminho = temp.reverse();
  animarCaminho();
}

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

// Inicia ao carregar a página
criarMapa();
atualizarListaCidades();
