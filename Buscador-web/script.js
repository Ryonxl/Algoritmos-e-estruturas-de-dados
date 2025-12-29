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
    this.children = {}; // ponteiros para outros nós
    this.isEnd = false; // final de palavra
    this.pages = [];    // páginas associadas
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
    this.root = new TrieNode(); // nó raiz vazio
  }

  /* ================= INSERÇÃO ================= */

  /*
    Insere palavra-chave associada a uma página.
  */
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

  /* ================= BUSCA SIMPLES ================= */

  /*
    Busca páginas associadas a uma palavra.
  */
  searchWord(word) {
    let node = this.root;

    for (let char of word) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }

    return node.isEnd ? node.pages : [];
  }

  /* ================= BUSCA MÚLTIPLA ================= */

  /*
    Busca múltiplas palavras e calcula relevância.
  */
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

  /*
    Remove associação palavra ↔ página.
    Utiliza recursão para limpeza de nós.
  */
  remove(word, page) {
    const removeRecursive = (node, word, depth) => {
      if (!node) return false;

      if (depth === word.length) {
        node.pages = node.pages.filter(p => p !== page);
        if (node.pages.length === 0) node.isEnd = false;
        return Object.keys(node.children).length === 0 && !node.isEnd;
      }

      const char = word[depth];

      if (removeRecursive(node.children[char], word, depth + 1)) {
        delete node.children[char];
      }

      return Object.keys(node.children).length === 0 && !node.isEnd;
    };

    removeRecursive(this.root, word, 0);
  }

  /* ================= VISUALIZAÇÃO ================= */

  /*
    Gera representação textual da Trie.
  */
  print(node = this.root, prefix = "", output = []) {
    if (node.isEnd) {
      output.push(prefix + " → " + node.pages.join(", "));
    }

    for (let char in node.children) {
      this.print(node.children[char], prefix + char, output);
    }

    return output;
  }
}

/* =========================================================
   CLASSE SearchEngine (CAMADA DE CONTROLE)
   ========================================================= */

/*
  Classe que representa a APLICAÇÃO.

  Ela:
  - Controla a interface
  - Usa a Trie
  - Gerencia persistência
*/
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
      keywords
        .split(",")
        .flatMap(k => k.split(" "))
        .map(normalizeWord)
        .filter(Boolean)
    )]
      .forEach(word => this.trie.insert(word, page));

    this.save();
    this.renderTree();

    alert("Página cadastrada com sucesso!");

    pageAddInput.value = "";
    descriptionAddInput.value = "";
    keywordsAddInput.value = "";
  }

  /* ================= REMOÇÃO ================= */

  removePage() {
    const page = normalizePage(pageRemoveInput.value);
    const keywords = keywordsRemoveInput.value.trim();

    if (!page || !keywords) {
      alert("Informe os dados.");
      return;
    }

    keywords.split(",")
      .map(normalizeWord)
      .forEach(word => this.trie.remove(word, page));

    delete this.pagesData[page];

    this.save();
    this.renderTree();

    alert("Página removida com sucesso!");

    pageRemoveInput.value = "";
    keywordsRemoveInput.value = "";
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
    const data = JSON.parse(localStorage.getItem("trieData") || "null");
    if (!data) return;

    const rebuild = nodeData => {
      const node = new TrieNode();
      node.isEnd = nodeData.isEnd;
      node.pages = nodeData.pages;
      for (let c in nodeData.children) {
        node.children[c] = rebuild(nodeData.children[c]);
      }
      return node;
    };

    this.trie.root = rebuild(data.root);
    this.pagesData = data.pagesData;
  }

  renderTree() {
    treeView.textContent = this.trie.print().join("\n") || "Árvore vazia";
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
