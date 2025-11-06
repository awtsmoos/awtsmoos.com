//B"H

import { TILE_SIZE, TOWER_TYPES } from './config.js';
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
        
        // Stats that can be upgraded
        this.damage = config.baseDamage;
        this.range = config.baseRange;
        this.fireRate = config.baseFireRate; // Lower is faster
        this.maxRange = config.maxRange;
        
        // Upgrade levels
        this.damageLevel = 1;
        this.speedLevel = 1;
        this.rangeLevel = 1;

        this.target = null;
        this.fireCooldown = 0;
    }

    findTarget(enemies) {
        this.target = null;
        let closestDist = this.range;
        for (const enemy of enemies) {
            const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
            if (dist < closestDist) {
                closestDist = dist;
                this.target = enemy;
            }
        }
    }

    update(enemies, projectiles) {
        if (this.fireCooldown > 0) {
            this.fireCooldown--;
        }

        this.findTarget(enemies);

        if (this.target && this.fireCooldown === 0) {
            this.shoot(projectiles);
            this.fireCooldown = this.fireRate;
        }
    }

    shoot(projectiles) {
        const newProjectile = new Projectile(this.x, this.y, this.target, this.damage, this.projectileEmoji);
        projectiles.push(newProjectile);
    }
    
    upgrade(stat) {
        const upgradeInfo = TOWER_TYPES[this.type].upgradeCost;
        if (stat === 'damage') {
            this.damage *= 1.5;
            this.damageLevel++;
            return upgradeInfo.damage * this.damageLevel;
        }
        if (stat === 'speed') {
            this.fireRate *= 0.85; // Decrease cooldown time
            this.speedLevel++;
            return upgradeInfo.speed * this.speedLevel;
        }
        if (stat === 'range' && this.range < this.maxRange) {
            this.range += TILE_SIZE / 2;
            this.rangeLevel++;
            return upgradeInfo.range * this.rangeLevel;
        }
        return 0; // Cost is 0 if upgrade fails
    }


    draw(ctx, isSelected = false) {
        ctx.font = `${TILE_SIZE * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
        
        // Draw range circle if selected
        if(isSelected) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.stroke();
        }
    }
}