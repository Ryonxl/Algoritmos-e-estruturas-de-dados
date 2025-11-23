// Carrega o ranking salvo no localStorage
const ranking = JSON.parse(localStorage.getItem("ranking")) || [];

// Seleciona o container onde os cards aparecerão
const container = document.getElementById("ranking-container");

// Ordena pelo tempo (menor tempo primeiro)
ranking.sort((a, b) => a.tempo - b.tempo);

// Se não houver dados, avisa
if (ranking.length === 0) {
    container.innerHTML = "<p>Nenhum registro encontrado.</p>";
}

// Cria um card para cada jogador
ranking.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
        <h2>#${index + 1} - ${item.nome}</h2>
        <p><strong>Tempo:</strong> ${item.tempo} segundos</p>
        <p><strong>Data:</strong> ${item.data}</p>
    `;

    container.appendChild(card);
});
