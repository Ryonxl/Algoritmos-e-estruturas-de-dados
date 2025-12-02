// =======================================================================
// 📌 CLASSE HEROI
// Cada herói tem nome, poder e imagem
// =======================================================================
class Heroi {
    constructor(nome, poder, img) {
        this.nome = nome;
        this.poder = poder;
        this.img = img;
    }

    // Cria uma cópia independente do herói
    clone() {
        return new Heroi(this.nome, this.poder, this.img);
    }
}

// =======================================================================
// 📌 CLASSE ARENA (visualização)
// =======================================================================
class Arena {
    constructor(divArena) {
        this.divArena = divArena;
    }

    // Mostra todos os heróis no HTML
    mostrar(herois) {
        this.divArena.innerHTML = "";
        herois.forEach(h => {
            this.divArena.innerHTML += `
                <div class="hero">
                    <img src="${h.img}">
                    <h3>${h.nome}</h3>
                    <p>Poder: <span class="power">${h.poder}</span></p>
                </div>
            `;
        });
    }

    // Destaca visualmente dois heróis que estão duelando
    async destacar(idxA, idxB) {
        const cards = document.querySelectorAll(".hero");
        if (!cards[idxA] || !cards[idxB]) return;

        // Adiciona efeito visual
        cards[idxA].classList.add("highlight");
        cards[idxB].classList.add("highlight");

        // Espera para mostrar o destaque
        await esperar(400);

        // Remove efeito
        cards[idxA].classList.remove("highlight");
        cards[idxB].classList.remove("highlight");
    }
}

// =======================================================================
// 📌 CLASSE LOGGER (mensagens)
// =======================================================================
class Logger {
    constructor(divLog) {
        this.divLog = divLog;
    }

    escrever(msg) {
        this.divLog.innerHTML += msg + "<br>";
        this.divLog.scrollTop = this.divLog.scrollHeight; // scroll automático
    }

    limpar() {
        this.divLog.innerHTML = "";
    }
}

// =======================================================================
// 📌 CLASSE MERGE SORT RPG
// Lógica completa do Merge Sort com animação e logs
// =======================================================================
class MergeSortRPG {
    constructor(arena, logger) {
        this.arena = arena;
        this.logger = logger;
    }

    // ----------------------------------------------------
    // 🔹 Função recursiva principal do Merge Sort
    // ----------------------------------------------------
    async ordenar(lista, startIndex = 0) {
        // Caso base: se só houver 1 herói, já está ordenado
        if (lista.length <= 1) return lista;

        // Divide o array em duas metades
        const meio = Math.floor(lista.length / 2);

        // Chamada recursiva na metade esquerda
        const metadeEsq = await this.ordenar(lista.slice(0, meio), startIndex);

        // Chamada recursiva na metade direita
        const metadeDir = await this.ordenar(lista.slice(meio), startIndex + meio);

        // Mescla as duas metades e retorna o array ordenado
        return await this.mesclar(metadeEsq, metadeDir, startIndex);
    }

    // ----------------------------------------------------
    // 🔹 Mescla duas sublistas (merge)
    // Compara heróis e anima cada duelo
    // ----------------------------------------------------
    async mesclar(left, right, start) {
        let resultado = [];
        let i = 0, j = 0;

        // Enquanto houver elementos nas duas sublistas
        while (i < left.length && j < right.length) {
            // Índices reais no array global
            let idxLeft  = start + i;
            let idxRight = start + left.length + j;

            // Destaca os dois heróis duelando
            await this.arena.destacar(idxLeft, idxRight);

            // Escreve log do duelo
            this.logger.escrever(
                `⚔️ ${left[i].nome} (${left[i].poder}) desafia ${right[j].nome} (${right[j].poder})!`
            );

            // Compara poderes e escolhe o vencedor
            if (left[i].poder >= right[j].poder) {
                this.logger.escrever(`🏆 Vencedor: <b>${left[i].nome}</b>`);
                resultado.push(left[i]); // adiciona vencedor na lista resultante
                i++;
            } else {
                this.logger.escrever(`🏆 Vencedor: <b>${right[j].nome}</b>`);
                resultado.push(right[j]);
                j++;
            }

            // Atualiza o estado global e a visualização
            atualizarEstadoGlobal(start, resultado);

            // Pequena pausa para animação
            await esperar(300);
        }

        // Copia qualquer restante da metade esquerda
        while (i < left.length) {
            resultado.push(left[i]);
            atualizarEstadoGlobal(start, resultado);
            i++;
            await esperar(150);
        }

        // Copia qualquer restante da metade direita
        while (j < right.length) {
            resultado.push(right[j]);
            atualizarEstadoGlobal(start, resultado);
            j++;
            await esperar(150);
        }

        // Retorna a lista mesclada e parcialmente ordenada
        return resultado;
    }
}

// =======================================================================
// Atualiza array global sem duplicar cards
// =======================================================================
function atualizarEstadoGlobal(start, resultadoParcial) {
    let copia = [...heroes];
    for (let k = 0; k < resultadoParcial.length; k++) {
        copia[start + k] = resultadoParcial[k];
    }
    heroes = copia;
    arena.mostrar(heroes); // atualiza visual
}

// =======================================================================
// Função auxiliar de espera
// =======================================================================
function esperar(ms) {
    return new Promise(res => setTimeout(res, ms));
}

// =======================================================================
// Dados iniciais
// =======================================================================
let heroesOriginais = [
    new Heroi("Aragorn", 78, "img/ARAGORN.jpg"),
    new Heroi("Legolas", 92, "img/LEGOLAS.jpg"),
    new Heroi("Gimli", 65, "img/GIMLI.jpg"),
    new Heroi("Gandalf", 99, "img/GANDALF.jpg"),
    new Heroi("Frodo", 34, "img/FRODO.jpg"),
    new Heroi("Boromir", 70, "img/BOROMIR.jpg")
];

// Cópia independente mantendo Heroi real
let heroes = heroesOriginais.map(h => h.clone());

// =======================================================================
// Instanciando objetos principais
// =======================================================================
const arena = new Arena(document.getElementById("arena"));
const logger = new Logger(document.getElementById("log"));
const sorter = new MergeSortRPG(arena, logger);

// Desenha lista inicial
arena.mostrar(heroes);

// =======================================================================
// Controles (botões)
// =======================================================================
async function iniciarMergeSort() {
    logger.limpar();
    logger.escrever("🔥 Iniciando torneio...");

    // Ordena os heróis com merge sort animado
    heroes = await sorter.ordenar(heroes, 0);

    // Exibe ranking final
    logger.escrever("<br>🏅 <b>Ranking Final (Mais forte primeiro)</b>");
    heroes.forEach(h => logger.escrever(`${h.nome} — Poder ${h.poder}`));

    arena.mostrar(heroes);
}

// Reseta para estado inicial
function resetar() {
    heroes = heroesOriginais.map(h => h.clone());
    arena.mostrar(heroes);
    logger.limpar();
    logger.escrever("🔄 Sistema resetado!");
}
