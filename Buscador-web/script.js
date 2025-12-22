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
    // Exemplo: { d: TrieNode, s: TrieNode }
    this.children = {};

    // Indica se este nó representa o FINAL de uma palavra válida
    // Exemplo: "doar" termina neste nó
    this.isEnd = false;

    // Lista de páginas/conteúdos associados a essa palavra-chave
    // Exemplo: ["ONG Esperança", "Projeto Educação Viva"]
    this.pages = [];
  }
}

/* =========================================================
   CLASSE Trie
   Representa a ÁRVORE de indexação propriamente dita
   É a estrutura central do motor de busca
   ========================================================= */
class Trie {
  constructor() {
    // root é a raiz da árvore
    // Ela não representa um caractere, apenas o ponto inicial
    this.root = new TrieNode();
  }

  /* =====================================================
     INSERÇÃO DE UMA PALAVRA NA ÁRVORE
     A palavra é inserida caractere por caractere
     ===================================================== */
  insert(word, page) {
    // Começamos sempre pela raiz
    let node = this.root;

    // Percorre cada caractere da palavra
    for (let char of word) {
      // Se ainda não existe um nó para esse caractere,
      // criamos um novo nó
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }

      // Avança para o próximo nó (nível da árvore)
      node = node.children[char];
    }

    // Após inserir todos os caracteres,
    // marcamos que aqui termina uma palavra válida
    node.isEnd = true;

    // Associa a página à palavra-chave,
    // evitando duplicação
    if (!node.pages.includes(page)) {
      node.pages.push(page);
    }
  }

  /* =====================================================
     BUSCA DE UMA ÚNICA PALAVRA NA ÁRVORE
     Retorna as páginas associadas
     ===================================================== */
  searchWord(word) {
    // Começa pela raiz
    let node = this.root;

    // Percorre a árvore seguindo os caracteres da palavra
    for (let char of word) {
      // Se em algum ponto o caractere não existir,
      // a palavra não está indexada
      if (!node.children[char]) return [];

      node = node.children[char];
    }

    // Se o nó final for realmente fim de palavra,
    // retornamos as páginas associadas
    return node.isEnd ? node.pages : [];
  }

  /* =====================================================
     BUSCA COM MÚLTIPLAS PALAVRAS
     Retorna apenas páginas que possuem TODAS as palavras
     (busca do tipo AND)
     ===================================================== */
  searchMultiple(words) {
    let result = null;

    words.forEach(word => {
      // Busca páginas para cada palavra individualmente
      const pages = this.searchWord(word);

      // Primeira palavra define o conjunto inicial
      // As demais fazem interseção
      result = result === null
        ? pages
        : result.filter(p => pages.includes(p));
    });

    // Se nada foi encontrado, retorna array vazio
    return result || [];
  }

  /* =====================================================
     IMPRESSÃO DA ÁRVORE (VISUALIZAÇÃO)
     Função recursiva que percorre toda a Trie
     ===================================================== */
  print(node = this.root, prefix = "", output = []) {
    // Se este nó marca o fim de uma palavra,
    // adicionamos ao resultado
    if (node.isEnd) {
      output.push(prefix + " → " + node.pages.join(", "));
    }

    // Percorre recursivamente todos os filhos
    for (let char in node.children) {
      this.print(node.children[char], prefix + char, output);
    }

    // Retorna todas as palavras encontradas
    return output;
  }
}

/* =========================================================
   CLASSE SearchEngine
   Controla a aplicação (interface + lógica)
   ========================================================= */
class SearchEngine {
  constructor() {
    // Cria a árvore Trie
    this.trie = new Trie();

    // Carrega dados salvos (se existirem)
    this.load();

    // Renderiza a árvore na interface
    this.renderTree();
  }

  /* =====================================================
     CADASTRO DE PÁGINAS E PALAVRAS-CHAVE
     ===================================================== */
  addPage() {
    const page = pageInput.value.trim();
    const keywordsText = keywordsInput.value.trim();

    // Remove estilos de erro anteriores
    pageInput.classList.remove("error");
    keywordsInput.classList.remove("error");

    // Validação: todos os campos são obrigatórios
    if (!page || !keywordsText) {
      if (!page) pageInput.classList.add("error");
      if (!keywordsText) keywordsInput.classList.add("error");
      alert("Preencha todos os campos antes de cadastrar.");
      return;
    }

    // Divide as palavras-chave e insere na Trie
    keywordsText.split(",").forEach(k => {
      const word = k.trim().toLowerCase();
      if (word) this.trie.insert(word, page);
    });

    // Salva os dados e atualiza a visualização
    this.save();
    this.renderTree();

    alert("Página cadastrada com sucesso!");

    // Limpa os campos
    pageInput.value = "";
    keywordsInput.value = "";
  }

  /* =====================================================
     BUSCA DE CONTEÚDOS
     ===================================================== */
  search() {
    // Divide o texto da busca em palavras
    const words = searchInput.value
      .toLowerCase()
      .split(" ")
      .filter(w => w);

    // Realiza a busca na Trie
    const results = this.trie.searchMultiple(words);

    // Limpa resultados anteriores
    resultsUl.innerHTML = "";

    // Caso não encontre nada
    if (results.length === 0) {
      resultsUl.innerHTML = "<li>Nenhum resultado encontrado</li>";
      return;
    }

    // Exibe os resultados encontrados
    results.forEach(page => {
      const li = document.createElement("li");
      li.textContent = page;
      resultsUl.appendChild(li);
    });
  }

  /* =====================================================
     SALVA A ÁRVORE NO LOCALSTORAGE
     ===================================================== */
  save() {
    localStorage.setItem("trieData", JSON.stringify(this.trie));
  }

  /* =====================================================
     RECONSTRÓI A ÁRVORE A PARTIR DO LOCALSTORAGE
     ===================================================== */
  load() {
    const data = localStorage.getItem("trieData");
    if (!data) return;

    // Função recursiva para reconstruir cada nó
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
     MOSTRA A ÁRVORE NA INTERFACE
     ===================================================== */
  renderTree() {
    const tree = this.trie.print().join("\n");
    treeView.textContent = tree || "Árvore vazia";
  }
}

/* =========================================================
   REFERÊNCIAS AOS ELEMENTOS DO HTML
   ========================================================= */
const pageInput = document.getElementById("pageInput");
const keywordsInput = document.getElementById("keywordsInput");
const searchInput = document.getElementById("searchInput");
const resultsUl = document.getElementById("results");
const treeView = document.getElementById("treeView");

/* =========================================================
   INICIALIZAÇÃO DO SISTEMA
   ========================================================= */
const engine = new SearchEngine();
