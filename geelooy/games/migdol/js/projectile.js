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
        this.type = config.projectileType || 'homing';
        this.splashRadius = config.splashRadius;
        this.slowFactor = config.slowFactor;
        this.slowDuration = config.slowDuration;

        // For piercing projectiles
        this.pierceLimit = config.pierceLimit || 1;
        this.hitEnemies = []; // Keep track of enemies already hit

        // For chaining projectiles
        this.chainCount = config.chainCount || 1;
        this.chainRange = config.chainRange;
        
        // For ground AoE projectiles
        this.aoeRadius = config.aoeRadius;
        this.aoeDuration = config.aoeDuration;

        // Angle for non-homing projectiles
        if (target) {
            this.angle = Math.atan2(target.y - y, target.x - x);
        }
    }

    update() {
        // Homing logic: only update angle if target is valid.
        if (this.type === 'homing' || this.type === 'chaining' || this.type === 'ground_aoe') {
            if (this.target && this.target.health > 0) {
                this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            }
        }
        
        // If the target is lost, the projectile continues on its last angle.
        if(this.angle !== undefined) {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.font = `${TILE_SIZE * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle); // Use the stored angle
        
        if (this.emoji === '🚀') {
            ctx.rotate(Math.PI / 4);
        } else if (this.type === 'piercing') {
            // Stretch the laser emoji to look like a beam
            ctx.scale(3, 1);
        }

        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
}