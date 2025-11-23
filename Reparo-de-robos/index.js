// Salva o nome do jogador no localStorage
function salvarNome() {
    const nome = document.getElementById("nomeJogador").value;

    if (nome.trim() === "") {
        document.getElementById("statusSalvar").innerText = "Digite um nome válido!";
        document.getElementById("statusSalvar").style.color = "red";
        return;
    }

    // Salvando no localStorage
    localStorage.setItem("playerName", nome);

    document.getElementById("statusSalvar").innerText = "Nome salvo com sucesso!";
    document.getElementById("statusSalvar").style.color = "#00e676";
}

// Inicia o jogo SOMENTE se o nome estiver salvo
function iniciarJogo() {
    const nomeSalvo = localStorage.getItem("nomeJogador");

    if (!nomeSalvo) {
        alert("Você deve salvar um nome antes de iniciar o jogo!");
        return;
    }

    // Redireciona para a página do jogo
    window.location.href = "game.html";
}

function abrirRanking() {
    window.location.href = "ranking.html";
}

function sair() {
    alert("Encerrando aplicação...");
}
