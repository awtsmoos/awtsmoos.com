//B"H

class Particle {
    constructor(x, y, text, size, life) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.size = size;
        this.life = life;
        this.initialLife = life;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = -Math.random() * 8 - 4;
        this.gravity = 0.3;
    }

    update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.initialLife);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

class DamageText {
    constructor(x, y, damage) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.gematria = toGematria(damage);
        this.life = 60;
        this.vy = -2;
    }

    update() {
        this.y += this.vy;
        this.vy *= 0.95; // slow down
        this.life--;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / 60);
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // English Number
        ctx.fillStyle = "#ff4d4d"; // Red
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.font = `bold 30px 'Arial Black'`;
        ctx.strokeText(`-${this.damage}`, this.x, this.y);
        ctx.fillText(`-${this.damage}`, this.x, this.y);
        
        // Gematria
        ctx.fillStyle = "#aaa"; // Grey
        ctx.font = `bold 24px Arial`;
        ctx.strokeText(this.gematria, this.x, this.y + 25);
        ctx.fillText(this.gematria, this.x, this.y + 25);

        ctx.restore();
    }
}

class HitSpark {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 60;
        this.life = 10; // very short life
    }

    update() {
        this.life--;
        this.size *= 0.9;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / 10);
        ctx.font = `${this.size}px Arial`;
        ctx.fillText("💥", this.x - this.size / 2, this.y + this.size / 2);
        ctx.restore();
    }
}