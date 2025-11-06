//B"H

import { TILE_SIZE, ENEMY_PATH } from './config.js';

export default class Enemy {
    constructor(type, healthMultiplier) {
        this.path = ENEMY_PATH;
        this.pathIndex = 0;
        
        // Start just off-screen
        this.x = this.path[0].x * TILE_SIZE - TILE_SIZE;
        this.y = this.path[0].y * TILE_SIZE;
        
        this.type = type.type; // e.g. 'cat'
        this.emoji = type.emoji;
        this.health = type.baseHealth * healthMultiplier;
        this.maxHealth = this.health;
        this.speed = type.speed;
        this.perutaValue = type.perutaValue;
        this.children = type.children;
    }

    update() {
        if (this.pathIndex >= this.path.length - 1) return; // Reached end

        const targetPoint = this.path[this.pathIndex + 1];
        const targetX = targetPoint.x * TILE_SIZE;
        const targetY = targetPoint.y * TILE_SIZE;
        
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;

        const distToTarget = Math.hypot(targetX - this.x, targetY - this.y);
        if (distToTarget < this.speed) {
            this.pathIndex++;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
    }

    draw(ctx) {
        // Draw health bar
        const healthBarWidth = TILE_SIZE * 0.8;
        const healthBarHeight = 5;
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(this.x - healthBarWidth / 2, this.y - TILE_SIZE / 2, healthBarWidth, healthBarHeight);
        
        const currentHealthWidth = (this.health / this.maxHealth) * healthBarWidth;
        if (currentHealthWidth > 0) {
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(this.x - healthBarWidth / 2, this.y - TILE_SIZE / 2, currentHealthWidth, healthBarHeight);
        }

        // Draw enemy
        ctx.font = `${TILE_SIZE * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
    }
}