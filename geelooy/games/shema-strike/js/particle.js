// B"H
// IN FILE: /Remember/awtsmoos.com/geelooy/games/shema-strike/js/particle.js

class Particle {
    constructor(x, y, text, size, life) {
        // Generic properties, will be re-initialized by the pool
        this.x = x;
        this.y = y;
        this.text = text;
        this.size = size;
        this.life = life;
        this.initialLife = life;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0;

        // Bind update and draw functions to this instance
        this.updateFn = this.updateMovement;
        this.drawFn = this.drawText;
    }

    // --- Different behaviors for different particle types ---
    
    // Type 1: Standard moving text (Hebrew letters)
    updateMovement() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }
    drawText(ctx) {
        const alpha = Math.max(0, this.life / this.initialLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(this.text, this.x, this.y);
    }

    // Type 2: Damage Text
    updateDamageText() {
        this.y += this.vy;
        this.vy *= 0.95; // slow down
        this.life--;
    }
    drawDamageText(ctx) {
        const alpha = Math.max(0, this.life / 60);
        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = "#ff4d4d";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.font = `bold 30px 'Arial Black'`;
        ctx.strokeText(`-${this.damage}`, this.x, this.y);
        ctx.fillText(`-${this.damage}`, this.x, this.y);
        
        ctx.fillStyle = "#aaa";
        ctx.font = `bold 24px Arial`;
        ctx.strokeText(this.gematria, this.x, this.y + 25);
        ctx.fillText(this.gematria, this.x, this.y + 25);
    }

    // Type 3: Hit Spark
    updateHitSpark() {
        this.life--;
        this.size *= 0.9;
    }
    drawHitSpark(ctx) {
        ctx.globalAlpha = Math.max(0, this.life / 10);
        ctx.font = `${this.size}px Arial`;
        ctx.fillText("💥", this.x - this.size / 2, this.y + this.size / 2);
    }
}

// 






