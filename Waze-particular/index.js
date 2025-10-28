// -------------------------------
// Mini Waze - Versão Final (Grid 1000x600)
// -------------------------------

// Classe responsável por representar o mapa da cidade
class Cidade {
  constructor(largura, ctx, celula, altura = largura) {
    this.largura = largura;   // número de colunas
    this.altura = altura;     // número de linhas
    this.ctx = ctx;
    this.celula = celula;
    this.mapa = this.criarMapa();
    this.inicio = null;
    this.destino = null;
    this.caminho = [];
  }

  // Cria um array bidimensional clássico
  criarMapa() {
    const m = new Array(this.altura);
    for (let y = 0; y < this.altura; y++) {
      m[y] = new Array(this.largura);
      for (let x = 0; x < this.largura; x++) {
        m[y][x] = 0;
      }
    }
    return m;
  }

  // Redesenha o mapa
  desenharMapa() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.largura * this.celula, this.altura * this.celula);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "28px Arial";

    for (let y = 0; y < this.altura; y++) {
      for (let x = 0; x < this.largura; x++) {
        const tipo = this.mapa[y][x];
        const px = x * this.celula;
        const py = y * this.celula;

        ctx.fillStyle = "#ccc";
        ctx.fillRect(px, py, this.celula - 1, this.celula - 1);

        switch (tipo) {
          case 0: break; // rua
          case 1: ctx.fillText("🏠", px + this.celula / 2, py + this.celula / 2); break;
          case 2: ctx.fillText("🚗", px + this.celula / 2, py + this.celula / 2); break;
          case 3: ctx.fillText("📍", px + this.celula / 2, py + this.celula / 2); break;
          case 4: ctx.fillText("⛔️", px + this.celula / 2, py + this.celula / 2); break;
          case 6: ctx.fillText("🌳", px + this.celula / 2, py + this.celula / 2); break;
          case 7: ctx.fillText("🏢", px + this.celula / 2, py + this.celula / 2); break;
        }
      }
    }
  }

  definirElemento(x, y, tipo) {
    if (tipo === 2) { // início
      if (this.inicio) this.mapa[this.inicio.y][this.inicio.x] = 0;
      this.inicio = { x, y };
    }
    if (tipo === 3) { // destino
      if (this.destino) this.mapa[this.destino.y][this.destino.x] = 0;
      this.destino = { x, y };
    }

    this.mapa[y][x] = tipo;
    this.desenharMapa();
  }

  gerarEngarrafamento(qtd) {
    for (let i = 0; i < qtd; i++) {
      const x = Math.floor(Math.random() * this.largura);
      const y = Math.floor(Math.random() * this.altura);
      if (this.mapa[y][x] === 0) {
        this.mapa[y][x] = 4;
      }
    }
    this.desenharMapa();
  }

  resetar() {
    this.inicio = null;
    this.destino = null;
    this.mapa = this.criarMapa();
    this.caminho = [];
    this.desenharMapa();
  }

  salvar(nome) {
    const dados = {
      mapa: this.mapa,
      inicio: this.inicio,
      destino: this.destino
    };
    localStorage.setItem("cidade_" + nome, JSON.stringify(dados));
  }

  carregar(nome) {
    const dados = localStorage.getItem("cidade_" + nome);
    if (!dados) return false;
    const { mapa, inicio, destino } = JSON.parse(dados);
    this.mapa = mapa;
    this.inicio = inicio;
    this.destino = destino;
    this.desenharMapa();
    return true;
  }
}

// -------------------------------
// Classe responsável por encontrar caminhos (BFS manual)
// -------------------------------
class Navegador {
  constructor(cidade) {
    this.cidade = cidade;
  }

  encontrarCaminho() {
    const { largura, altura, mapa, inicio, destino } = this.cidade;
    if (!inicio || !destino) return;

    const fila = new Array(largura * altura);
    let filaInicio = 0;
    let filaFim = 0;

    const visitado = new Array(altura);
    const anterior = new Array(altura);
    for (let y = 0; y < altura; y++) {
      visitado[y] = new Array(largura);
      anterior[y] = new Array(largura);
      for (let x = 0; x < largura; x++) {
        visitado[y][x] = false;
        anterior[y][x] = null;
      }
    }

    fila[filaFim++] = inicio;
    visitado[inicio.y][inicio.x] = true;
    let encontrou = false;

    const dx = [1, -1, 0, 0];
    const dy = [0, 0, 1, -1];

    while (filaInicio < filaFim) {
      const atual = fila[filaInicio++];
      const { x, y } = atual;

      if (x === destino.x && y === destino.y) {
        encontrou = true;
        break;
      }

      for (let i = 0; i < 4; i++) {
        const nx = x + dx[i];
        const ny = y + dy[i];

        if (
          nx >= 0 && nx < largura &&
          ny >= 0 && ny < altura &&
          !visitado[ny][nx] &&
          (mapa[ny][nx] === 0 || mapa[ny][nx] === 3)
        ) {
          fila[filaFim++] = { x: nx, y: ny };
          visitado[ny][nx] = true;
          anterior[ny][nx] = { x, y };
        }
      }
    }

    if (!encontrou) {
      alert("🚫 Nenhum caminho possível!");
      return;
    }

    const caminhoTemp = [];
    let p = { x: destino.x, y: destino.y };
    while (p && !(p.x === inicio.x && p.y === inicio.y)) {
      caminhoTemp[caminhoTemp.length] = p;
      p = anterior[p.y][p.x];
    }

    const caminhoFinal = [];
    for (let i = caminhoTemp.length - 1, j = 0; i >= 0; i--, j++) {
      caminhoFinal[j] = caminhoTemp[i];
    }

    this.cidade.caminho = caminhoFinal;
    this.animarCaminho();
  }

  animarCaminho() {
    const ctx = this.cidade.ctx;
    const celula = this.cidade.celula;
    const caminho = this.cidade.caminho;
    let i = 0;

    const timer = setInterval(() => {
      this.cidade.desenharMapa();
      ctx.fillStyle = "blue";

      for (let j = 0; j <= i && j < caminho.length; j++) {
        const { x, y } = caminho[j];
        ctx.fillRect(x * celula, y * celula, celula - 1, celula - 1);
      }

      i++;
       if (i > caminho.length) {
        clearInterval(timer);
        // ✅ Mensagem ao chegar no destino
        alert("🚗 Você chegou ao destino evitando engarrafamentos e pegando o caminho mais rápido!");
      }
    }, 200);
  }
}

// -------------------------------
// Classe principal - gerencia interface e eventos
// -------------------------------
class App {
  constructor() {
    this.canvas = document.getElementById("mapa");
    this.ctx = this.canvas.getContext("2d");
    this.tipoElemento = 0;
    this.cidade = new Cidade(25, this.ctx, 40, 15);
    this.navegador = new Navegador(this.cidade);

    this.configurarEventos();
    this.cidade.desenharMapa();
    this.atualizarListaCidades();
  }

  configurarEventos() {
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / this.cidade.celula);
      const y = Math.floor((e.clientY - rect.top) / this.cidade.celula);

      this.cidade.definirElemento(x, y, this.tipoElemento);
      if (this.cidade.inicio && this.cidade.destino) {
        this.navegador.encontrarCaminho();
      }
    });
  }

  setTipoElemento(tipo) {
    this.tipoElemento = tipo;
  }

  gerarEngarrafamento() {
    this.cidade.gerarEngarrafamento(20);
  }

  resetar() {
    this.cidade.resetar();
  }

  salvarMapa() {
    const nome = document.getElementById("nomeCidade").value.trim();
    if (!nome) {
      alert("Digite um nome para a cidade!");
      return;
    }
    this.cidade.salvar(nome);
    alert("✅ Cidade salva como: " + nome);
    this.atualizarListaCidades();
  }

  carregarMapa() {
    const nome = document.getElementById("nomeCidade").value.trim();
    if (!nome) {
      alert("Digite o nome da cidade para carregar!");
      return;
    }
    if (!this.cidade.carregar(nome)) {
      alert("❌ Cidade não encontrada.");
      return;
    }
    if (this.cidade.inicio && this.cidade.destino) {
      this.navegador.encontrarCaminho();
    }
  }

  atualizarListaCidades() {
    const select = document.getElementById("listaCidades");
    select.innerHTML = '<option value="">-- Cidades salvas --</option>';
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave.indexOf("cidade_") === 0) {
        const nome = chave.substring(7);
        const option = document.createElement("option");
        option.value = nome;
        option.textContent = nome;
        select.appendChild(option);
      }
    }
  }

  selecionarCidade(nome) {
    if (!nome) return;
    document.getElementById("nomeCidade").value = nome;
    this.carregarMapa();
  }
}

// -------------------------------
// Cidades exemplo pré-carregadas (grid 25x15)
// -------------------------------
function criarCidadesExemplo() {
  const cidadesExemplo = [
    {
      nome: "Cidade Verde",
      mapa: [
        [1,1,6,1,1,0,1,1,0,6,0,7,0,6,0,7,0,6,0,7,1,1,6,1,1],
        [1,0,1,0,1,0,1,0,1,0,6,0,1,0,1,0,7,0,1,0,1,0,1,0,1],
        [6,1,0,1,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,1,0,1,6],
        [1,0,1,0,1,0,0,0,0,6,0,0,0,6,0,0,0,1,0,7,0,1,0,1,0],
        [1,1,1,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,7,0,0,0,1,1,1],
        [7,0,0,0,6,0,0,0,1,0,0,0,1,0,0,0,6,0,0,0,6,0,0,0,7],
        [1,0,1,0,0,0,7,0,1,0,0,0,1,0,7,0,0,0,6,0,1,0,1,0,1],
        [1,1,6,1,1,0,1,0,6,0,7,0,6,0,1,0,1,0,7,1,1,6,1,1,1],
        [1,0,1,0,1,0,1,0,7,0,6,0,7,0,1,0,1,0,6,0,1,0,1,0,1],
        [6,1,0,1,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,1,0,1,6],
        [1,0,1,0,1,0,0,0,0,6,0,0,0,6,0,0,0,1,0,7,0,1,0,1,0],
        [1,1,1,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,7,0,0,0,1,1,1],
        [7,0,0,0,6,0,0,0,1,0,0,0,1,0,0,0,6,0,0,0,6,0,0,0,7],
        [1,0,1,0,0,0,7,0,1,0,0,0,1,0,7,0,0,0,6,0,1,0,1,0,1],
        [1,1,6,1,1,0,1,0,6,0,7,0,6,0,1,0,1,0,7,1,1,6,1,1,1],
      ]
    },
    {
      nome: "Cidade Central",
      mapa: [
        [7,7,7,1,1,0,6,1,0,1,7,1,0,6,1,0,1,7,0,1,7,7,7,1,1],
        [1,7,1,0,1,0,7,0,1,0,1,0,7,0,1,0,7,0,1,0,1,7,1,0,1],
        [0,1,0,1,0,1,0,7,1,0,1,0,1,0,6,0,1,0,1,0,0,1,0,1,0],
        [7,0,7,1,0,0,6,0,0,0,7,0,0,0,7,0,0,0,1,0,7,0,7,1,0],
        [0,7,0,1,0,7,0,1,0,7,0,1,0,1,0,7,0,1,0,7,0,1,0,7,0],
        [1,0,1,0,7,1,0,6,1,0,1,0,7,1,0,1,0,7,1,0,1,0,7,1,0],
        [0,7,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,7,0,1,0,1,0,0],
        [1,0,1,0,1,0,1,7,0,1,0,1,0,1,0,1,0,7,0,1,0,1,0,1,0],
        [0,1,7,0,1,0,1,0,7,0,1,0,1,0,7,0,1,0,1,0,1,0,1,0,0],
        [7,1,0,1,0,0,6,0,0,0,7,0,0,0,7,0,0,0,1,0,7,1,0,1,0],
        [1,0,1,0,1,0,0,0,0,6,0,0,0,6,0,0,0,1,0,7,0,1,0,1,0],
        [1,1,1,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,7,0,0,0,1,1,1],
        [7,0,0,0,6,0,0,0,1,0,0,0,1,0,0,0,6,0,0,0,6,0,0,0,7],
        [1,0,1,0,0,0,7,0,1,0,0,0,1,0,7,0,0,0,6,0,1,0,1,0,1],
        [1,1,6,1,1,0,1,0,6,0,7,0,6,0,1,0,1,0,7,1,1,6,1,1,1],
      ]
    },
    {
      nome: "Cidade Litorânea",
      mapa: [
        [0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0],
        [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
        [0,1,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7],
        [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
        [0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0],
        [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
        [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        [6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6],
        [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
        [0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0],
        [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
        [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        [6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6,0,7,0,6],
        [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      ]
    }
  ];

  // Salva as cidades no localStorage
  for (let i = 0; i < cidadesExemplo.length; i++) {
    const c = cidadesExemplo[i];
    const chave = "cidade_" + c.nome;
    localStorage.setItem(chave, JSON.stringify({
      mapa: c.mapa,
      inicio: null,
      destino: null
    }));
  }


  // Salva no localStorage
  for (let i = 0; i < cidadesExemplo.length; i++) {
    const c = cidadesExemplo[i];
    const chave = "cidade_" + c.nome;
    localStorage.setItem(chave, JSON.stringify({
      mapa: c.mapa,
      inicio: null,
      destino: null
    }));
  }
}

// -------------------------------
// Inicialização
// -------------------------------
criarCidadesExemplo();
const app = new App();

// Funções globais
function setTipoElemento(tipo) { app.setTipoElemento(tipo); }
function gerarEngarrafamento() { app.gerarEngarrafamento(); }
function resetar() { app.resetar(); }
function salvarMapa() { app.salvarMapa(); }
function carregarMapa() { app.carregarMapa(); }
function selecionarCidade(nome) { app.selecionarCidade(nome); }
