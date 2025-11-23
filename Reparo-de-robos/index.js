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
