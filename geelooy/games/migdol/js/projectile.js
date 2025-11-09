//B"H

import { TILE_SIZE } from './config.js';

export default class Projectile {
    constructor(x, y, target, damage, emoji, config = {}) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.emoji = emoji;
        this.speed = 8;
        
        // Carry special properties from the tower's config
        this.splashRadius = config.splashRadius;
        this.slowFactor = config.slowFactor;
        this.slowDuration = config.slowDuration;
    }

    update() {
        if (!this.target || this.target.health <= 0) return;

        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.font = `${TILE_SIZE * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        
        if (this.emoji === '🚀') {
            ctx.rotate(Math.PI / 4);
        }

        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
}