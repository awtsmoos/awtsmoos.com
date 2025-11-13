// B"H
// Defines the Particle class.

export class Particle {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.color = config.color;
        this.size = config.size;
        this.vx = config.vx;
        this.vy = config.vy;
        this.life = config.life;
        this.initialLife = this.life;
        this.drag = config.drag || 1;
        this.gravity = config.gravity || 0;
        this.text = config.text || null;
    }

    update() {
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.initialLife);
        ctx.globalAlpha = alpha;
        if (this.text) {
            ctx.font = `${this.size * (this.life/this.initialLife)}px Arial`;
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0, this.size * alpha), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0; // Reset global alpha
    }
}