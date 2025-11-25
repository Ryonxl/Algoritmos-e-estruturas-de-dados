// estruturas.js
// Lista duplamente ligada + pilha de componentes

// js/estruturas.js

// --------------------- ComponentStack ---------------------
export class ComponentStack {
    constructor() { this.stack = []; }
    push(nome, codigo, tempoEst) { this.stack.push({nome,codigo,tempoEst}); }
    pop() { return this.stack.pop(); }
    peek() { return this.stack[this.stack.length-1]; }
    isEmpty() { return this.stack.length===0; }
    [Symbol.iterator]() { return this.stack.slice().reverse()[Symbol.iterator](); } // topo primeiro
}

// --------------------- Node / LinkedList ---------------------
export class Node {
    constructor(robot) {
        this.robot = robot;
        this.next = null;
        this.prev = null;
    }
}

export class RobotList {
    constructor() {
        this.head = null;
        this.tail = null;
        this._size = 0;
    }

    size() { return this._size; }

    insertByPriority(robot) {
        const node = new Node(robot);
        if (!this.head) {
            this.head = this.tail = node;
        } else {
            let cur = this.head;
            let inserted = false;
            const prioValue = p => p.toLowerCase() === 'alta' ? 3 : p.toLowerCase() === 'média' ? 2 : 1;
            const newVal = prioValue(robot.priority);

            while(cur) {
                if (prioValue(cur.robot.priority) < newVal) {
                    // inserir antes de cur
                    node.next = cur;
                    node.prev = cur.prev;
                    if(cur.prev) cur.prev.next = node;
                    cur.prev = node;
                    if(cur===this.head) this.head=node;
                    inserted=true;
                    break;
                }
                cur=cur.next;
            }
            if(!inserted) {
                // inserir no final
                node.prev = this.tail;
                this.tail.next = node;
                this.tail = node;
            }
        }
        this._size++;
        return node;
    }

    removeNode(node) {
        if(node.prev) node.prev.next = node.next;
        else this.head = node.next;
        if(node.next) node.next.prev = node.prev;
        else this.tail = node.prev;
        node.next = node.prev = null;
        this._size--;
    }

    *nodes() {
        let cur = this.head;
        while(cur) {
            yield cur;
            cur = cur.next;
        }
    }
}
