// B"H
// IN FILE: /Remember/awtsmoos.com/geelooy/games/shema-strike/js/enemy.js

class Enemy {
    constructor(canvas, player, world, spawnX) {
        this.canvas = canvas;
        this.player = player;
        
        const types = [
            { emoji: '😠', health: 30, speed: 1.5, size: 60, perutas: 5, damage: 5 },
            { emoji: '👿', health: 50, speed: 2.0, size: 70, perutas: 10, damage: 10 },
            { emoji: '👹', health: 100, speed: 1.0, size: 90, perutas: 20, damage: 15 },
        ];
        const type = getRandomFrom(types);

        this.emoji = type.emoji;
        this.health = type.health;
        this.maxHealth = type.health; // Store max health for the health bar calculation
        this.speed = type.speed;
        this.size = type.size;
        this.perutas = type.perutas;
        this.damage = type.damage;

        this.x = spawnX;
        this.y = this.canvas.height - world.groundHeight - this.size / 2;
        this.hitCooldown = 0;

        // --- OPTIMIZATION 1: PRE-RENDER THE EMOJI ---
        // Create a separate, hidden canvas for this enemy's sprite
        this.spriteCanvas = new OffscreenCanvas(this.size * 1.5, this.size * 1.5);
        const spriteCtx = this.spriteCanvas.getContext('2d');
        spriteCtx.font = `${this.size}px Arial`;
        spriteCtx.textAlign = "center";
        spriteCtx.textBaseline = "middle";
        // Draw the emoji only once to our hidden canvas
        spriteCtx.fillText(this.emoji, this.spriteCanvas.width / 2, this.spriteCanvas.height / 2);
    }

    getBoundingBox() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }

    takeDamage(amount, particles) { // Changed to accept the particle system
        if (this.hitCooldown > 0) return;

        this.health -= amount;
        this.hitCooldown = 10;
        
        // Use the particle system instead of creating new objects
        particles.spawn('damageText', this.x, this.y - this.size / 2, { damage: amount });
        particles.spawn('hitSpark', this.x, this.y);
        triggerScreenShake(8, 5);
    }

    update() {
        if (this.hitCooldown > 0) this.hitCooldown--;
        
        const dx = this.player.x - this.x;
        
        if (Math.abs(dx) > this.size / 2) {
            this.x += Math.sign(dx) * this.speed;
        } else {
            this.player.takeDamage(this.damage);
        }
    }

    draw(ctx) {
        // --- Shadow ---
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.canvas.height - 100 + 15, this.size * 0.4, this.size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // --- OPTIMIZATION 1: DRAW THE PRE-RENDERED SPRITE ---
        // Use the much faster drawImage instead of the slow fillText
        ctx.drawImage(
            this.spriteCanvas, 
            this.x - this.spriteCanvas.width / 2, 
            this.y - this.spriteCanvas.height / 2
        );

        // --- Health bar ---
        if (this.health > 0) {
            const barWidth = this.size * 0.8;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.size / 2 - 20;
            ctx.fillStyle = '#555';
            ctx.fillRect(barX, barY, barWidth, 10);
            ctx.fillStyle = '#ff4d4d';
            ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), 10);
        }
    }
}