// =========================================================
// BASE DE HERÓIS (com imagens da sua pasta img/)
// =========================================================
let heroesOriginais = [
    { nome: "Aragorn", poder: 78, img: "img/ARAGORN.jpg" },
    { nome: "Legolas", poder: 92, img: "img/Legolas.jpg" },
    { nome: "Gimli", poder: 65, img: "img/GIMLI.jpg" },
    { nome: "Gandalf", poder: 99, img: "img/GANDALF.jpg" },
    { nome: "Frodo", poder: 34, img: "img/FRODO.jpg" },
    { nome: "Boromir", poder: 70, img: "img/BOROMIR.jpg" }
];

// cópia usada na ordenação (para permitir reset)
let heroes = JSON.parse(JSON.stringify(heroesOriginais));


// =========================================================
// FUNÇÃO: Exibe os heróis na arena
// =========================================================
function mostrarHeroes() {
    const arena = document.getElementById("arena");
    arena.innerHTML = "";

    heroes.forEach(h => {
        arena.innerHTML += `
            <div class="hero">
                <img src="${h.img}">
                <h3>${h.nome}</h3>
                <p>Poder: <span class="power">${h.poder}</span></p>
            </div>
        `;
    });
}

mostrarHeroes();


// =========================================================
// LOG: escreve mensagens no painel lateral
// =========================================================
function log(msg) {
    const area = document.getElementById("log");
    area.innerHTML += msg + "<br>";
    area.scrollTop = area.scrollHeight;
}


// =========================================================
// Destaque visual de duelo entre dois heróis
// =========================================================
async function destacar(i, j) {
    const cards = document.querySelectorAll(".hero");

    cards[i].classList.add("highlight");
    cards[j].classList.add("highlight");

    await esperar(500);

    cards[i].classList.remove("highlight");
    cards[j].classList.remove("highlight");
}


// utilitário de espera para animação
function esperar(ms) {
    return new Promise(res => setTimeout(res, ms));
}



// =========================================================
// ▶️ MERGE SORT VERSÃO RPG (Explicado Passo a Passo)
// =========================================================
//
// O Merge Sort funciona em 2 fases:
//
// 1. DIVIDIR o array em partes menores (recursão)
// 2. MESCLAR (merge) comparando os elementos e ordenando
//
// Aqui, a comparação virou “batalhas” entre heróis.
// O mais poderoso sempre vence o duelo e vai para a lista final.
//
// =========================================================

async function mergeSortRPG(arr, start) {

    // CASO BASE: listas com 1 herói já estão “ordenadas”
    if (arr.length <= 1) return arr;

    // Divide ao meio
    const meio = Math.floor(arr.length / 2);

    // Chama mergeSort recursivamente para cada metade
    // (enquanto isso, a tela mostra os duelos)
    const esquerda = await mergeSortRPG(arr.slice(0, meio), start);
    const direita  = await mergeSortRPG(arr.slice(meio), start + meio);

    // Após as metades estarem ordenadas → juntar as duas
    return await mesclarRPG(esquerda, direita, start);
}



// =========================================================
// FUNÇÃO PRINCIPAL DO MERGE (A MAIS IMPORTANTE)
//
// Aqui acontece a “fusão”: dois grupos ordenados viram um maior.
// Na prática, é onde o Merge Sort *realmente ordena*.
//
// A cada comparação, os heróis “duelam”.
//
// =========================================================

async function mesclarRPG(left, right, start) {

    let resultado = [];
    let i = 0, j = 0;

    // Enquanto ainda existem heróis nas duas metades…
    while (i < left.length && j < right.length) {

        // Mostra o duelo visualmente
        await destacar(start + i, start + left.length + j);

        log(`⚔️ ${left[i].nome} (${left[i].poder}) desafia ${right[j].nome} (${right[j].poder})!`);

        // Compara quem é mais forte
        if (left[i].poder < right[j].poder) {

            // DIREITA vence
            log(`🏆 Vencedor: <b>${right[j].nome}</b>`);
            resultado.push(right[j]);
            j++;

        } else {

            // ESQUERDA vence
            log(`🏆 Vencedor: <b>${left[i].nome}</b>`);
            resultado.push(left[i]);
            i++;
        }

        // Atualiza visualmente a fusão parcial
        atualizarHeroisMesclados(start, resultado);
        await esperar(400);
    }

    // COPIA RESTANTES (se alguma lista acabar primeiro)
    while (i < left.length) {
        resultado.push(left[i]);
        atualizarHeroisMesclados(start, resultado);
        i++;
        await esperar(200);
    }

    while (j < right.length) {
        resultado.push(right[j]);
        atualizarHeroisMesclados(start, resultado);
        j++;
        await esperar(200);
    }

    return resultado;
}



// =========================================================
// Atualiza visual da fusão na arena
// =========================================================
function atualizarHeroisMesclados(start, tempList) {
    heroes.splice(start, tempList.length, ...tempList);
    mostrarHeroes();
}



// =========================================================
// INICIAR MERGE SORT
// =========================================================
async function iniciarMergeSort() {
    document.getElementById("log").innerHTML = "";
    log("🔥 Iniciando torneio entre heróis...");

    heroes = await mergeSortRPG(heroes, 0);

    log("<br>🏅 <b>Ranking Final (Mais forte primeiro)</b>");
    heroes.forEach(h => log(`${h.nome} — Poder ${h.poder}`));

    mostrarHeroes();
}



// =========================================================
// 🔁 RESETAR (botão RESET no HTML)
// =========================================================
function resetar() {
    heroes = JSON.parse(JSON.stringify(heroesOriginais));
    document.getElementById("log").innerHTML = "";
    mostrarHeroes();
    log("🔄 Sistema resetado! Heróis voltaram ao estado original.");
}
