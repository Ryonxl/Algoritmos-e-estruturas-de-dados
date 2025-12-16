// ===== NÓ DA TRIE =====
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.pages = [];
  }
}

// ===== TRIE =====
class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, page) {
    let node = this.root;

    for (let char of word.toLowerCase()) {
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

  search(word) {
    let node = this.root;

    for (let char of word.toLowerCase()) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }

    return node.isEnd ? node.pages : [];
  }

  remove(word, page) {
    const pages = this.search(word);
    const index = pages.indexOf(page);
    if (index !== -1) {
      pages.splice(index, 1);
    }
  }
}

// ===== INSTÂNCIA DA TRIE =====
const trie = new Trie();

// ===== FUNÇÕES DA INTERFACE =====
function addPage() {
  const page = document.getElementById("pageInput").value.trim();
  const keywords = document.getElementById("keywordsInput").value.split(",");

  if (!page || keywords.length === 0) {
    alert("Preencha todos os campos!");
    return;
  }

  keywords.forEach(keyword => {
    if (keyword.trim() !== "") {
      trie.insert(keyword.trim(), page);
    }
  });

  alert("Página cadastrada com sucesso!");
  document.getElementById("pageInput").value = "";
  document.getElementById("keywordsInput").value = "";
}

function search() {
  const term = document.getElementById("searchInput").value.trim();
  const results = trie.search(term);
  const ul = document.getElementById("results");

  ul.innerHTML = "";

  if (results.length === 0) {
    ul.innerHTML = "<li>Nenhum resultado encontrado</li>";
    return;
  }

  results.forEach(page => {
    const li = document.createElement("li");
    li.textContent = page;
    ul.appendChild(li);
  });
}
