/* =========================================================
   FUNÇÃO AUXILIAR
   Normaliza palavras:
   - Converte para minúsculas
   - Remove acentos
   - Remove espaços extras
   ========================================================= */
function normalizeWord(word) {
  return word
    .toLowerCase()
    .normalize("NFD")                 // separa letras de acentos
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .trim();
}

/* =========================================================
   FUNÇÃO AUXILIAR
   Normaliza páginas/conteúdos:
   - Converte para minúsculas
   - Remove espaços extras
   ========================================================= */
function normalizePage(page) {
  return page
    .toLowerCase()
    .trim();
}

/* =========================================================
   CLASSE TrieNode
   Representa um NÓ da árvore Trie (árvore de prefixos)
   Cada nó guarda:
   - Seus filhos (children)
   - Se ele marca o fim de uma palavra (isEnd)
   - As páginas associadas à palavra (pages)
   ========================================================= */
class TrieNode {
  constructor() {
    // children é um objeto onde:
    // a chave = caractere
    // o valor = outro TrieNode
    this.children = {};

    // Indica se este nó representa o FINAL de uma palavra válida
    this.isEnd = false;

    // Lista de páginas associadas à palavra-chave
    this.pages = [];
  }
}

/* =========================================================
   CLASSE Trie
   Representa a ÁRVORE de indexação
   ========================================================= */
class Trie {
  constructor() {
    // Nó raiz da árvore
    this.root = new TrieNode();
  }

  /* =====================================================
     INSERÇÃO DE UMA PALAVRA NA ÁRVORE
     ===================================================== */
  insert(word, page) {
    let node = this.root;

    for (let char of word) {
      // Se o caractere ainda não existir, cria o nó
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }

    // Marca o fim da palavra
    node.isEnd = true;

    // Evita páginas duplicadas
    if (!node.pages.includes(page)) {
      node.pages.push(page);
    }
  }

  /* =====================================================
     BUSCA DE UMA ÚNICA PALAVRA
     ===================================================== */
  searchWord(word) {
    let node = this.root;

    for (let char of word) {
      // Se o caminho não existir, a palavra não está indexada
      if (!node.children[char]) return [];
      node = node.children[char];
    }

    // Retorna as páginas apenas se for fim de palavra
    return node.isEnd ? node.pages : [];
  }

  /* =====================================================
     BUSCA COM MÚLTIPLAS PALAVRAS
     COM CONTADOR DE RELEVÂNCIA
     ===================================================== */
  searchMultiple(words) {
    const relevanceMap = {};

    words.forEach(word => {
      const pages = this.searchWord(word);

      pages.forEach(page => {
        // Incrementa a relevância da página
        relevanceMap[page] = (relevanceMap[page] || 0) + 1;
      });
    });

    // Ordena da maior relevância para a menor
    return Object.entries(relevanceMap)
      .sort((a, b) => b[1] - a[1])
      .map(([page, score]) => ({ page, score }));
  }

  /* =====================================================
     REMOÇÃO DE UMA PÁGINA ASSOCIADA A UMA PALAVRA
     ===================================================== */
  remove(word, page) {
    const removeRecursive = (node, word, depth) => {
      if (!node) return false;

      // Chegou ao final da palavra
      if (depth === word.length) {
        if (node.isEnd) {
          // Remove a página associada
          node.pages = node.pages.filter(p => p !== page);

          // Se não houver mais páginas, remove a marcação de fim
          if (node.pages.length === 0) {
            node.isEnd = false;
          }
        }

        // Indica se o nó pode ser removido
        return Object.keys(node.children).length === 0 && !node.isEnd;
      }

      const char = word[depth];

      const shouldDeleteChild = removeRecursive(
        node.children[char],
        word,
        depth + 1
      );

      // Remove o filho se não for mais necessário
      if (shouldDeleteChild) {
        delete node.children[char];
      }

      return Object.keys(node.children).length === 0 && !node.isEnd;
    };

    // Inicia a remoção a partir da raiz
    removeRecursive(this.root, word, 0);
  }

  /* =====================================================
     IMPRESSÃO DA ÁRVORE (VISUALIZAÇÃO)
     ===================================================== */
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
   CLASSE SearchEngine
   Controla a aplicação
   ========================================================= */
class SearchEngine {
  constructor() {
    this.trie = new Trie();
    this.load();
    this.renderTree();
  }

  /* =====================================================
     CADASTRO DE PÁGINAS
     ===================================================== */
  addPage() {
    const page = normalizePage(pageInput.value);
    const keywordsText = keywordsInput.value.trim();

    pageInput.classList.remove("error");
    keywordsInput.classList.remove("error");

    if (!page || !keywordsText) {
      if (!page) pageInput.classList.add("error");
      if (!keywordsText) keywordsInput.classList.add("error");
      alert("Preencha todos os campos.");
      return;
    }

    // Remove palavras repetidas antes de inserir
    const uniqueWords = [...new Set(
      keywordsText.split(",").map(k => normalizeWord(k))
    )];

    uniqueWords.forEach(word => {
      if (word) this.trie.insert(word, page);
    });

    this.save();
    this.renderTree();

    alert("Página cadastrada com sucesso!");
    pageInput.value = "";
    keywordsInput.value = "";
  }

  /* =====================================================
     REMOÇÃO DE UMA PÁGINA DO ÍNDICE
     ===================================================== */
  removePage() {
    const page = normalizePage(pageInput.value);
    const keywordsText = keywordsInput.value.trim();

    if (!page || !keywordsText) {
      alert("Informe a página e as palavras para remover.");
      return;
    }

    keywordsText.split(",").forEach(k => {
      const word = normalizeWord(k);
      if (word) this.trie.remove(word, page);
    });

    this.save();
    this.renderTree();

    alert("Página removida com sucesso!");
  }

  /* =====================================================
     BUSCA DE CONTEÚDOS
     ===================================================== */
  search() {
    const words = searchInput.value
      .split(" ")
      .map(w => normalizeWord(w))
      .filter(w => w);

    if (words.length === 0) {
      alert("Digite ao menos uma palavra para buscar.");
      return;
    }

    const results = this.trie.searchMultiple(words);
    resultsUl.innerHTML = "";

    if (results.length === 0) {
      resultsUl.innerHTML = "<li>Nenhum resultado encontrado</li>";
      return;
    }

    results.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.page} (relevância: ${item.score})`;
      resultsUl.appendChild(li);
    });
  }

  /* =====================================================
     PERSISTÊNCIA
     ===================================================== */
  save() {
    localStorage.setItem("trieData", JSON.stringify(this.trie));
  }

  load() {
    const data = localStorage.getItem("trieData");
    if (!data) return;

    const rebuild = (nodeData) => {
      const node = new TrieNode();
      node.isEnd = nodeData.isEnd;
      node.pages = nodeData.pages;

      for (let c in nodeData.children) {
        node.children[c] = rebuild(nodeData.children[c]);
      }
      return node;
    };

    const parsed = JSON.parse(data);
    this.trie.root = rebuild(parsed.root);
  }

  /* =====================================================
     VISUALIZAÇÃO DA ÁRVORE
     ===================================================== */
  renderTree() {
    treeView.textContent = this.trie.print().join("\n") || "Árvore vazia";
  }
}

/* =========================================================
   ELEMENTOS DA INTERFACE
   ========================================================= */
const pageInput = document.getElementById("pageInput");
const keywordsInput = document.getElementById("keywordsInput");
const searchInput = document.getElementById("searchInput");
const resultsUl = document.getElementById("results");
const treeView = document.getElementById("treeView");

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
const engine = new SearchEngine();
