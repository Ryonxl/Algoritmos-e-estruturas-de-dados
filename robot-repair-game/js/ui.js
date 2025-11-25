export class UI {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.game = game;
        this.robotW = 520;
        this.robotH = 180;
        this.faceSize = 160;

        this._setupDPR();
        window.addEventListener("resize", () => {
            this._setupDPR();
            this.draw();
        });
    }

    _setupDPR() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    draw() {
        const ctx = this.ctx;
        const W = this.canvas.width / (window.devicePixelRatio || 1);
        const H = this.canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#071226";
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = "#0c1b2a";
        ctx.fillRect(12, 32, W - 24, H - 64);

        const areaX = 24;
        const areaY = 56;
        const slotW = this.robotW + 28;
        const maxSlots = Math.max(1, Math.floor((W - 48) / slotW));

        let i = 0;
        for (const node of this.game.robotList.nodes()) {
            if(node.animProgress === undefined) node.animProgress = 1; // ✅ Corrigido
            const slot = i % maxSlots;
            const row = Math.floor(i / maxSlots);

            let x = areaX + slot * slotW + (node.animProgress * 40);
            let y = areaY + row * (this.robotH + 22) - node.animProgress * 10;

            node.uiX = x;
            node.uiY = y;
            node.uiW = this.robotW;
            node.uiH = this.robotH;

            ctx.save();
            roundRect(ctx, x, y, this.robotW, this.robotH, 12);

            ctx.fillStyle = (this.game.selectedNode === node)
                ? "rgba(57,209,193,0.12)"
                : "rgba(255,255,255,0.02)";
            ctx.fill();

            ctx.strokeStyle = "rgba(255,255,255,0.03)";
            ctx.stroke();

            // face
            ctx.fillStyle = "#e6eef6";
            ctx.font = "120px sans-serif";
            ctx.fillText("🤖", x + 36, y + 120);

            // model + ID
            ctx.fillStyle = "#dfeff3";
            ctx.font = "18px sans-serif";
            ctx.fillText(node.robot.model, x + 180, y + 36);

            ctx.fillStyle = "#9fb7c2";
            ctx.font = "13px sans-serif";
            ctx.fillText(`ID: ${node.robot.id}`, x + 180, y + 64);

            // prioridade
            let p = node.robot.priority.toLowerCase();
            let col = "#9aa6b2";
            if (p === "média" || p === "media") col = "#ffa500";
            if (p === "alta") col = "#ff4c4c";

            ctx.fillStyle = col;
            ctx.font = "bold 14px sans-serif";
            ctx.fillText(node.robot.priority, x + 180, y + 92);

            // status
            const isDone = node.robot.components.isEmpty() && node._removeAfter;
            ctx.fillStyle = isDone ? "rgba(139,231,185,0.8)" : "rgba(255,217,122,0.8)";
            roundRect(ctx, x + 320, y + 28, 80, 24, 6);
            ctx.fill();

            ctx.fillStyle = "#022";
            ctx.font = "13px sans-serif";
            ctx.fillText(isDone ? "Consertado" : "Pendente", x + 328, y + 45);

            // componentes
            let cy = y + 120;
            const codeBoxW = 120;

            for (const comp of node.robot.components) {
                ctx.fillStyle = "#cfe8ea";
                ctx.font = "14px sans-serif";
                ctx.fillText(comp.nome, x + 180, cy);

                const bx = x + this.robotW - codeBoxW - 20;

                roundRect(ctx, bx, cy - 16, codeBoxW, 22, 8);
                ctx.fillStyle = "#39d1c1";
                ctx.fill();

                ctx.fillStyle = "#022";
                ctx.font = "15px monospace";
                ctx.fillText(comp.codigo, bx + 10, cy);

                cy += 24;
            }

            ctx.restore();
            i++;
        }

        ctx.fillStyle = "#9fb7c2";
        ctx.font = "15px sans-serif";
        ctx.fillText("Clique em um robô → digite código → ENTER.", 28, 36);
    }

    hitTest(x, y) {
        for (const node of this.game.robotList.nodes()) {
            if (x >= node.uiX && x <= node.uiX + node.uiW &&
                y >= node.uiY && y <= node.uiY + node.uiH) {
                return node;
            }
        }
        return null;
    }
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
