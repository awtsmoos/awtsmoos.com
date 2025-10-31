//B"H

class Enemy {
    // In js/enemy.js

    // In js/enemy.js

    constructor(canvas, player, world, spawnX) { // <-- Add world object
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
        this.speed = type.speed;
        this.size = type.size;
        this.perutas = type.perutas;
        this.damage = type.damage;

        this.x = spawnX;
        // Use world.groundHeight for the correct Y position
        this.y = this.canvas.height - world.groundHeight - this.size / 2;
        this.hitCooldown = 0;
    }


    

    getBoundingBox() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }

    takeDamage(amount, particles) {
        if (this.hitCooldown > 0) return;

        this.health -= amount;
        this.hitCooldown = 10; // 10 frames of invincibility
        
        // Add damage text and hit spark
        particles.push(new DamageText(this.x, this.y - this.size / 2, amount));
        particles.push(new HitSpark(this.x, this.y));
        triggerScreenShake(8, 5);
    }

    // In js/enemy.js

    update() {
        if (this.hitCooldown > 0) this.hitCooldown--;
        
        const dx = this.player.x - this.x;
        const dist = Math.abs(dx);
        
        // Chase player
        if (dist > this.size / 2) {
            this.x += Math.sign(dx) * this.speed;
        } 
        // Attack player if close enough
        else {
            this.player.takeDamage(this.damage);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Simple shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.canvas.height - 100 + 15, this.size * 0.4, this.size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw enemy emoji
        ctx.fillText(this.emoji, this.x, this.y);

        // Health bar
        if (this.health > 0) {
            const barWidth = this.size * 0.8;
            ctx.fillStyle = '#555';
            ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 20, barWidth, 10);
            ctx.fillStyle = '#ff4d4d';
            ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 20, barWidth * (this.health / (this.emoji === '😠' ? 30 : this.emoji === '👿' ? 50 : 100)), 10);
        }

        ctx.restore();
    }
}