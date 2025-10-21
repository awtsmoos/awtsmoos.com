//B"H

class Particle {
    constructor(x, y, char) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.size = Math.random() * 20 + 10;
        this.speedX = Math.random() * 8 - 3;
        this.speedY = Math.random() * 9 - 3;
        this.alpha = 1;
        this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.02;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(this.char, this.x, this.y);
        ctx.restore();
    }
}