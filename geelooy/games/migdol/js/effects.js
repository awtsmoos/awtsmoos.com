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