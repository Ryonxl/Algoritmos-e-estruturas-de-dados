/* =========================================================
   FUNÇÕES AUXILIARES (UTILITÁRIAS)
   ========================================================= */

/*
  normalizeWord(word)

  Normaliza palavras-chave para evitar inconsistências.
  Fundamental em buscadores reais.

  Exemplo:
  "Educação", "educacao", " EDUCAÇÃO "
  → "educacao"
*/
function normalizeWord(word) {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/*
  normalizePage(page)

  Normaliza o identificador da página.
  Aqui NÃO removemos acentos, pois não é termo de busca.
*/
function normalizePage(page) {
  return page.toLowerCase().trim();
}

/* =========================================================
   CLASSE TrieNode
   ========================================================= */

/*
  Representa um ÚNICO nó da árvore Trie.

  Cada nó armazena:
  - children → próximos caracteres
  - isEnd    → indica final de palavra
  - pages    → páginas associadas à palavra
*/
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.pages = [];
  }
}

/* =========================================================
   CLASSE Trie (ESTRUTURA DE DADOS PRINCIPAL)
   ========================================================= */

/*
  Implementação COMPLETA de uma árvore Trie.

  Responsável por:
  - Inserção
  - Busca simples
  - Busca múltipla
  - Remoção
  - Visualização
*/
class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  /* ================= INSERÇÃO ================= */

  insert(word, page) {
    let node = this.root;

    for (let char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }

    node.isEnd = true;

    if (!node.pages.includes(page)) {
      node.pages.push(page);
    }
  }

  /* ================= BUSCA ================= */

  searchWord(word) {
    let node = this.root;

    for (let char of word) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }

    return node.isEnd ? node.pages : [];
  }

  searchMultiple(words) {
    const relevanceMap = {};

    words.forEach(word => {
      this.searchWord(word).forEach(page => {
        relevanceMap[page] = (relevanceMap[page] || 0) + 1;
      });
    });

    return Object.entries(relevanceMap)
      .sort((a, b) => b[1] - a[1])
      .map(([page, score]) => ({ page, score }));
  }

  /* ================= REMOÇÃO ================= */

  remove(word, page) {
    const removeRecursive = (node, depth) => {
      if (!node) return false;

      if (depth === word.length) {
        node.pages = node.pages.filter(p => p !== page);
        if (node.pages.length === 0) node.isEnd = false;
        return Object.keys(node.children).length === 0 && !node.isEnd;
      }

      const char = word[depth];

      if (removeRecursive(node.children[char], depth + 1)) {
        delete node.children[char];
      }

      return Object.keys(node.children).length === 0 && !node.isEnd;
    };

    removeRecursive(this.root, 0);
  }

  /* ================= VISUALIZAÇÃO TEXTUAL ================= */

  print(node = this.root, prefix = "", output = []) {
    if (node.isEnd) {
      output.push(prefix + " → " + node.pages.join(", "));
    }

    for (let char in node.children) {
      this.print(node.children[char], prefix + char, output);
    }

    return output;
  }

  /* ================= VISUALIZAÇÃO GRÁFICA ================= */

  /*
    Converte a Trie em dados de grafo (nós + arestas)
    para uso com D3.js
  */
  toGraphData() {
    const nodes = [];
    const links = [];
    let id = 0;

    const traverse = (node, parentId = null, label = "ROOT") => {
      const currentId = id++;

      nodes.push({
        id: currentId,
        label,
        isEnd: node.isEnd,
        pages: node.pages
      });

      if (parentId !== null) {
        links.push({ source: parentId, target: currentId });
      }

      for (let c in node.children) {
        traverse(node.children[c], currentId, c);
      }
    };

    traverse(this.root);
    return { nodes, links };
  }
}

/* =========================================================
   CLASSE SearchEngine (CAMADA DE CONTROLE)
   ========================================================= */

class SearchEngine {
  constructor() {
    this.trie = new Trie();
    this.pagesData = {};

    this.load();
    this.renderTree();
  }

  /* ================= CADASTRO ================= */

  addPage() {
    const page = normalizePage(pageAddInput.value);
    const description = descriptionAddInput.value.trim();
    const keywords = keywordsAddInput.value.trim();

    if (!page || !description || !keywords) {
      alert("Preencha todos os campos.");
      return;
    }

    this.pagesData[page] = description;

    [...new Set(
      keywords.split(",").flatMap(k => k.split(" "))
        .map(normalizeWord)
        .filter(Boolean)
    )].forEach(word => this.trie.insert(word, page));

    this.save();
    this.renderTree();

    pageAddInput.value = "";
    descriptionAddInput.value = "";
    keywordsAddInput.value = "";
  }

  /* ================= REMOÇÃO ================= */

  removePage() {
    const page = normalizePage(pageRemoveInput.value);
    const keywords = keywordsRemoveInput.value.trim();

    if (!page || !keywords) return;

    keywords.split(",").flatMap(k => k.split(" "))
      .map(normalizeWord)
      .filter(Boolean)
      .forEach(word => this.trie.remove(word, page));

    delete this.pagesData[page];

    this.save();
    this.renderTree();
  }

  /* ================= BUSCA ================= */

  search() {
    const words = searchInput.value
      .split(" ")
      .map(normalizeWord)
      .filter(Boolean);

    const results = this.trie.searchMultiple(words);
    resultsUl.innerHTML = "";

    if (!results.length) {
      resultsUl.innerHTML = "<li>Nenhum resultado encontrado</li>";
      return;
    }

    results.forEach(({ page, score }) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${page}</strong><br>
        <small>${this.pagesData[page]}</small><br>
        <em>Relevância: ${score}</em>
      `;
      resultsUl.appendChild(li);
    });
  }

  /* ================= PERSISTÊNCIA ================= */

  save() {
    localStorage.setItem("trieData", JSON.stringify({
      root: this.trie.root,
      pagesData: this.pagesData
    }));
  }

  load() {
    const data = JSON.parse(localStorage.getItem("trieData"));
    if (!data) return;

    const rebuild = dataNode => {
      const node = new TrieNode();
      node.isEnd = dataNode.isEnd;
      node.pages = dataNode.pages;
      for (let c in dataNode.children) {
        node.children[c] = rebuild(dataNode.children[c]);
      }
      return node;
    };

    this.trie.root = rebuild(data.root);
    this.pagesData = data.pagesData;
  }

  /* ================= RENDERIZAÇÃO ================= */

  renderTree() {
    /* Texto */
    treeView.textContent = this.trie.print().join("\n") || "Árvore vazia";

    /* Gráfico */
    this.renderGraph();
  }

  renderGraph() {
    const { nodes, links } = this.trie.toGraphData();
    const container = document.getElementById("trieGraph");

    d3.select(container).selectAll("*").remove();

    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(d3.zoom().on("zoom", e => g.attr("transform", e.transform)));

    const g = svg.append("g");

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(60))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = g.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#aaa");

    const node = g.selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(d3.drag()
        .on("start", e => sim.alphaTarget(0.3).restart())
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", e => sim.alphaTarget(0))
      );

    node.append("circle")
      .attr("r", 8)
      .attr("fill", d => d.label === "ROOT" ? "#333" : d.isEnd ? "#4CAF50" : "#2196F3");

    node.append("text")
      .text(d => d.label)
      .attr("x", 10)
      .attr("y", 4)
      .style("font-size", "12px");

    node.append("title")
      .text(d => d.pages.length ? d.pages.join(", ") : "Sem páginas");

    sim.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });
  }
}

/* =========================================================
   INTERFACE
   ========================================================= */

const pageAddInput = document.getElementById("pageAddInput");
const descriptionAddInput = document.getElementById("descriptionAddInput");
const keywordsAddInput = document.getElementById("keywordsAddInput");

const pageRemoveInput = document.getElementById("pageRemoveInput");
const keywordsRemoveInput = document.getElementById("keywordsRemoveInput");

const searchInput = document.getElementById("searchInput");
const resultsUl = document.getElementById("results");
const treeView = document.getElementById("treeView");

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

window.engine = new SearchEngine();
