const canvas = document.getElementById('labirinto');
const ctx = canvas.getContext('2d');

const cols = 20;
const rows = 20;
const tamanho = 25;
canvas.width = cols * tamanho;
canvas.height = rows * tamanho;

let grid = [];
let player = { x: 0, y: 0 };

// Função auxiliar para embaralhar array
function shuffle(array) {
  for (let i = array.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Função recursiva para gerar labirinto
function gerarLabirinto(x, y) {
  const cell = grid[y][x];
  cell.visited = true;

  const dirs = [[0,-1],[1,0],[0,1],[-1,0]]; // top, right, bottom, left
  shuffle(dirs);

  for (let [dx, dy] of dirs) {
    const nx = x + dx;
    const ny = y + dy;

    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !grid[ny][nx].visited) {
      // Remover paredes entre células
      if (dx === 1) { cell.walls[1] = false; grid[ny][nx].walls[3] = false; } // right
      if (dx === -1) { cell.walls[3] = false; grid[ny][nx].walls[1] = false; } // left
      if (dy === 1) { cell.walls[2] = false; grid[ny][nx].walls[0] = false; } // bottom
      if (dy === -1) { cell.walls[0] = false; grid[ny][nx].walls[2] = false; } // top

      gerarLabirinto(nx, ny); // chamada recursiva
    }
  }
}

// Função para desenhar labirinto e jogador
function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid[y][x];
      const xPos = x * tamanho;
      const yPos = y * tamanho;
      ctx.strokeStyle = '#fff';

      if (cell.walls[0]) ctx.strokeRect(xPos, yPos, tamanho, 0);
      if (cell.walls[1]) ctx.strokeRect(xPos + tamanho, yPos, 0, tamanho);
      if (cell.walls[2]) ctx.strokeRect(xPos, yPos + tamanho, tamanho, 0);
      if (cell.walls[3]) ctx.strokeRect(xPos, yPos, 0, tamanho);
    }
  }

  // Desenhar jogador
  ctx.fillStyle = 'red';
  ctx.fillRect(player.x * tamanho + 5, player.y * tamanho + 5, tamanho - 10, tamanho - 10);

  // Desenhar objetivo
  ctx.fillStyle = 'green';
  ctx.fillRect((cols-1) * tamanho + 5, (rows-1) * tamanho + 5, tamanho - 10, tamanho - 10);
}

// Função para iniciar ou reiniciar o jogo
function iniciarJogo() {
  // Reset grid
  grid = [];
  for (let y = 0; y < rows; y++) {
    let linha = [];
    for (let x = 0; x < cols; x++) {
      linha.push({
        x,
        y,
        visited: false,
        walls: [true, true, true, true]
      });
    }
    grid.push(linha);
  }

  gerarLabirinto(0, 0);
  player = { x: 0, y: 0 };
  desenhar();
}

// Movimentação do jogador
document.addEventListener('keydown', (e) => {
  const cell = grid[player.y][player.x];
  if (e.key === 'ArrowUp' && !cell.walls[0]) player.y--;
  if (e.key === 'ArrowDown' && !cell.walls[2]) player.y++;
  if (e.key === 'ArrowLeft' && !cell.walls[3]) player.x--;
  if (e.key === 'ArrowRight' && !cell.walls[1]) player.x++;

  desenhar();

  // Chegou no objetivo?
  if (player.x === cols-1 && player.y === rows-1) {
    alert('🎉 Você venceu! O labirinto será reiniciado.');
    iniciarJogo();
  }
});

// Inicializa o jogo pela primeira vez
iniciarJogo();
