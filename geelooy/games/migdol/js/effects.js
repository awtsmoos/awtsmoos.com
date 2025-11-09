//B"H
import { TILE_SIZE } from './config.js';

export class GroundEffect {
    constructor(x, y, radius, duration, damagePerTick, tickRate) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.duration = duration;
        this.damagePerTick = damagePerTick;
        this.tickRate = tickRate;
        this.tickTimer = 0;
        this.maxDuration = duration;
    }

    update(enemies) {
        this.duration--;
        this.tickTimer++;

        if (this.tickTimer >= this.tickRate) {
            this.tickTimer = 0;
            enemies.forEach(enemy => {
                const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
                if (dist < this.radius) {
                    enemy.takeDamage(this.damagePerTick);
                }
            });
        }
    }

    draw(ctx) {
        const opacity = 0.6 * (this.duration / this.maxDuration);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 255, 102, ${opacity})`;
        ctx.fill();
    }
}

export class LetterParticle {
    constructor(x, y, letter) {
        this.x = x;
        this.y = y;
        this.letter = letter;
        this.life = 60; // 1 second duration
        this.vx = (Math.random() - 0.5) * 4; // Horizontal velocity
        this.vy = (Math.random() * -3) - 2;   // Initial upward velocity
        this.gravity = 0.15;
        this.opacity = 1;
        this.size = TILE_SIZE * 0.5;
        
        const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#ecf0f1'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.life--;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        if (this.life < 30) {
            this.opacity = this.life / 30;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.letter, this.x, this.y);
        ctx.restore();
    }
}