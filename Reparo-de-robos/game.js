/* ============================
   SISTEMA DE NOME + RANKING
   ============================ */

// ❌ REMOVIDO window.onload (estava iniciando o jogo sem nome)

function salvarNome() {
    const nome = document.getElementById("nomeInput").value;

    if (nome.trim() === "") {
        alert("Digite um nome válido!");
        return;
    }

    localStorage.setItem("nomeJogador", nome);

    // salva o início do jogo
    localStorage.setItem("tempoInicio", Date.now());

    iniciarJogo(nome);
}

function iniciarJogo(nome) {
    document.getElementById("telaNome").style.display = "none";
    document.getElementById("telaJogo").style.display = "block";
    document.getElementById("nomeJogador").textContent = nome;
}

function finalizarJogo() {
    const inicio = parseInt(localStorage.getItem("tempoInicio"));
    const tempoFinal = ((Date.now() - inicio) / 1000).toFixed(2);

    const nome = localStorage.getItem("nomeJogador");

    const resultado = { nome: nome, tempo: Number(tempoFinal) };

    let ranking = JSON.parse(localStorage.getItem("rankingJogadores")) || [];
    ranking.push(resultado);

    localStorage.setItem("rankingJogadores", JSON.stringify(ranking));

    alert(`Parabéns, ${nome}! Jogo finalizado em ${tempoFinal}s`);

    window.location.href = "ranking.html";
}

/* ============================
   CLASSE DO NÓ DA LISTA
   ============================ */

class RobotNode {
    constructor(robotData) {
        this.data = robotData;
        this.next = null;
    }
}

/* ============================
   LISTA ENCADEADA DE ROBÔS
   ============================ */
class RobotLinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    // Insere no final
    insert(robotData) {
        const newNode = new RobotNode(robotData);

        if (!this.head) {
            this.head = newNode;
        } else {
            let cur = this.head;
            while (cur.next !== null) cur = cur.next;
            cur.next = newNode;
        }

        this.size++;
    }

    // Remove usando ID
    removeById(id) {
        if (!this.head) return null;

        if (this.head.data.id === id) {
            const removed = this.head;
            this.head = this.head.next;
            this.size--;
            return removed.data;
        }

        let cur = this.head;
        let prev = null;

        while (cur !== null && cur.data.id !== id) {
            prev = cur;
            cur = cur.next;
        }

        if (cur === null) return null;

        prev.next = cur.next;
        this.size--;
        return cur.data;
    }

    // Buscar robô pelo ID
    searchById(id) {
        let cur = this.head;
        while (cur !== null) {
            if (cur.data.id === id) return cur.data;
            cur = cur.next;
        }
        return null;
    }

    // Converter para array APENAS PARA EXIBIÇÃO
    toArray() {
        let arr = [];
        let cur = this.head;
        while (cur !== null) {
            arr.push(cur.data);
            cur = cur.next;
        }
        return arr;
    }
}

/* ============================
   NÓ DA PILHA DE COMPONENTES
   ============================ */
class ComponentNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

/* ============================
   PILHA MANUAL (STACK)
   ============================ */
class ComponentStack {
    constructor() {
        this.top = null;
        this.size = 0;
    }

    push(data) {
        const newNode = new ComponentNode(data);
        newNode.next = this.top;
        this.top = newNode;
        this.size++;
    }

    pop() {
        if (!this.top) return null;
        const removed = this.top;
        this.top = this.top.next;
        this.size--;
        return removed.data;
    }

    peek() {
        return this.top ? this.top.data : null;
    }

    isEmpty() {
        return this.top === null;
    }

    // Conversão para tela (permitido)
    toArray() {
        let list = [];
        let cur = this.top;
        while (cur !== null) {
            list.push(cur.data);
            cur = cur.next;
        }
        return list;
    }
}

/* ============================
   CLASSE DO ROBÔ
   ============================ */

class Robot {
    constructor(id, model, priority, stack) {
        this.id = id;
        this.model = model;
        this.priority = priority;
        this.components = stack;
        this.state = "pendente";
    }
}

/* ============================
   ===== LÓGICA DO JOGO ======
   ============================ */

const robotsList = new RobotLinkedList();
let selectedRobotId = null;

// Gerar robô aleatório
function spawnRobot() {
    const id = Math.floor(Math.random() * 10000);
    const modelos = ["RX-2000", "T-800", "ZetaPrime", "MK-3"];
    const prioridades = ["emergência", "padrão", "baixo risco"];

    // Criar pilha de componentes
    const stack = new ComponentStack();

    const qty = Math.floor(Math.random() * 4) + 1; // 1–4 componentes

    for (let i = 0; i < qty; i++) {
        stack.push({
            nome: "Componente " + (i + 1),
            codigo: "C-" + Math.floor(Math.random() * 900 + 100),
            tempo: Math.floor(Math.random() * 5) + 1
        });
    }

    const robot = new Robot(
        id,
        modelos[Math.floor(Math.random() * modelos.length)],
        prioridades[Math.floor(Math.random() * prioridades.length)],
        stack
    );

    robotsList.insert(robot);
    render();
}

/* ============================
   EXIBIR ROBÔS NA TELA
   ============================ */

function render() {
    const robotArea = document.getElementById("robots");
    robotArea.innerHTML = "";

    const robots = robotsList.toArray();

    robots.forEach(robot => {
        const div = document.createElement("div");
        div.className = "robot-card";
        if (robot.id === selectedRobotId) div.classList.add("selected");

        div.innerHTML = `
            <strong>ID:</strong> ${robot.id}<br>
            Modelo: ${robot.model}<br>
            Prioridade: ${robot.priority}<br>
            Componentes restantes: ${robot.components.size}
        `;

        div.onclick = () => selectRobot(robot.id);

        robotArea.appendChild(div);
    });

    renderStack();
}

/* ============================
   SELECIONAR ROBÔ
   ============================ */

function selectRobot(id) {
    selectedRobotId = id;
    render();
}

/* ============================
   EXIBIR A PILHA DO ROBÔ
   ============================ */

function renderStack() {
    const stackArea = document.getElementById("stack");
    const info = document.getElementById("selected-info");

    stackArea.innerHTML = "";

    if (!selectedRobotId) {
        info.innerText = "Nenhum robô selecionado";
        return;
    }

    const robot = robotsList.searchById(selectedRobotId);

    info.innerHTML = `
        <strong>ID:</strong> ${robot.id}<br>
        Modelo: ${robot.model}<br>
        Prioridade: ${robot.priority}<br>
        Estado: ${robot.state}
    `;

    const components = robot.components.toArray();
    components.forEach(c => {
        let div = document.createElement("div");
        div.className = "component";
        div.innerText = `${c.nome} → Código: ${c.codigo}`;
        stackArea.appendChild(div);
    });
}

/* ============================
   VALIDAR CÓDIGO DIGITADO
   ============================ */

function verifyCode() {
    if (!selectedRobotId) return alert("Selecione um robô!");

    const typed = document.getElementById("codeInput").value;
    const robot = robotsList.searchById(selectedRobotId);

    const top = robot.components.peek();
    if (!top) return;

    if (typed === top.codigo) {
        alert("✔ Código correto! Componente substituído.");
        robot.components.pop();

        // Se acabou a pilha, remove o robô
        if (robot.components.isEmpty()) {
            alert("🤖 Robô consertado!");
            robotsList.removeById(robot.id);
            selectedRobotId = null;

            // Se não houver mais robôs → finaliza o jogo
            if (robotsList.size === 0) {
                finalizarJogo();
                return;
            }
        }

    } else {
        alert("❌ Código errado!");
    }

    document.getElementById("codeInput").value = "";
    render();
}
