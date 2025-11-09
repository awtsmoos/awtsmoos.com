//B"H

import { TOWER_TYPES, TILE_SIZE } from './config.js';
import Projectile from './projectile.js';

export default class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        const config = TOWER_TYPES[type];
        this.emoji = config.emoji;
        this.projectileEmoji = config.projectileEmoji;
        this.cost = config.cost;
        
        this.damage = config.baseDamage;
        this.range = config.baseRange;
        this.fireRate = config.baseFireRate;
        this.maxRange = config.maxRange;
        
        this.damageLevel = 1;
        this.speedLevel = 1;
        this.rangeLevel = 1;

        this.target = null;
        this.fireCooldown = 0;
    }

    findTarget(enemies) {
        this.target = null;
        let closestDist = Infinity;
        for (const enemy of enemies) {
            const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
            if (dist < this.range && dist < closestDist) {
                closestDist = dist;
                this.target = enemy;
            }
        }
    }

    update(enemies, projectiles) {
        if (this.fireCooldown > 0) {
            this.fireCooldown--;
        }

        if (!this.target || this.target.health <= 0 || Math.hypot(this.x - this.target.x, this.y - this.target.y) > this.range) {
            this.findTarget(enemies);
        }

        if (this.target && this.fireCooldown === 0) {
            this.shoot(projectiles);
            this.fireCooldown = this.fireRate;
        }
    }

    shoot(projectiles) {
        const config = TOWER_TYPES[this.type];
        const newProjectile = new Projectile(this.x, this.y, this.target, this.damage, this.projectileEmoji, config);
        projectiles.push(newProjectile);
    }
    
    upgrade(stat) {
        if (stat === 'damage') {
            this.damage *= 1.5;
            this.damageLevel++;
        }
        if (stat === 'speed') {
            this.fireRate *= 0.85;
            this.speedLevel++;
        }
        if (stat === 'range' && this.range < this.maxRange) {
            this.range += TILE_SIZE / 2;
            this.rangeLevel++;
        }
    }

    draw(ctx) {
        ctx.font = `${TILE_SIZE * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
    }
}