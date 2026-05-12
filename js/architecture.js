// --- ARCHITECTURE PIPELINE ANIMATION ---
class ArchitectureVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.nodes = [];
        this.init();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }

    init() {
        this.resize();
        this.createNodes();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        if (rect.width === 0) return;
        this.canvas.width = rect.width;
        this.canvas.height = 300;
        this.createNodes();
    }

    createNodes() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.nodes = [
            { x: w * 0.1, y: h / 2, label: "RAW DATA", icon: "\uf1c0", color: "#38bdf8" },
            { x: w * 0.35, y: h / 2, label: "SUB-SAMPLING", icon: "\uf0b0", color: "#6366f1" },
            { x: w * 0.65, y: h / 2, label: "iFOREST", icon: "\uf1bb", color: "#0ea5e9", isForest: true },
            { x: w * 0.9, y: h / 2, label: "SCORE", icon: "\uf3fd", color: "#10b981" }
        ];
    }

    createParticle() {
        return {
            x: this.nodes[0].x,
            y: this.nodes[0].y,
            targetNodeIndex: 1,
            progress: 0,
            speed: 0.005 + Math.random() * 0.01,
            size: 2 + Math.random() * 3,
            color: this.nodes[0].color,
            offsetY: (Math.random() - 0.5) * 20
        };
    }

    draw() {
        if (this.nodes.length === 0) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Connections
        this.ctx.beginPath();
        this.ctx.strokeStyle = "rgba(148, 163, 184, 0.1)";
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
        for(let i=1; i<this.nodes.length; i++) {
            this.ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
        }
        this.ctx.stroke();

        // Update & Draw Particles
        if (Math.random() < 0.1) this.particles.push(this.createParticle());

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            let startNode = this.nodes[p.targetNodeIndex - 1];
            let endNode = this.nodes[p.targetNodeIndex];

            p.progress += p.speed;
            
            // Forest branching effect
            let currentY = startNode.y + p.offsetY * (1 - Math.abs(p.progress - 0.5) * 2);
            if (startNode.isForest || endNode.isForest) {
                currentY = startNode.y + p.offsetY * Math.sin(p.progress * Math.PI) * 2;
            }

            p.x = startNode.x + (endNode.x - startNode.x) * p.progress;
            p.y = currentY;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = endNode.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = endNode.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            if (p.progress >= 1) {
                p.progress = 0;
                p.targetNodeIndex++;
                if (p.targetNodeIndex >= this.nodes.length) {
                    this.particles.splice(i, 1);
                }
            }
        }

        // Draw Nodes
        this.nodes.forEach(node => {
            // Glow
            this.ctx.beginPath();
            let gradient = this.ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 40);
            gradient.addColorStop(0, node.color + "33");
            gradient.addColorStop(1, "transparent");
            this.ctx.fillStyle = gradient;
            this.ctx.arc(node.x, node.y, 40, 0, Math.PI * 2);
            this.ctx.fill();

            // Icon
            this.ctx.fillStyle = node.color;
            this.ctx.font = '20px "Font Awesome 6 Free"';
            this.ctx.fontWeight = "900";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(node.icon, node.x, node.y);

            // Label
            this.ctx.font = 'bold 10px "Inter"';
            this.ctx.fillStyle = "var(--text-muted)";
            this.ctx.fillText(node.label, node.x, node.y + 50);
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.archViz = new ArchitectureVisualizer('archCanvas');
});
