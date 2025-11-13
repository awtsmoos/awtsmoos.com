// B"H
// Defines the base Entity class and all derived game entities.

import { Particle } from './Particle.js';

// --- Base Class for all game objects ---
class Entity {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.size = config.size;
        this.toRemove = false; // Flag for removal from the game
    }

    // Methods to be overridden by subclasses
    update(cameraSpeed, particles, player, canvasWidth) {}
    draw(ctx) {}

    // Default collision is circular
    collidesWith(player) {
        const distSq = (player.x - this.x)**2 + (player.y - this.y)**2;
        const hitDist = player.radius + this.size / 2;
        return distSq < hitDist**2;
    }
}

// --- Otiot (Hebrew Letter) Class ---
export class Otiot extends Entity {
    constructor(config) {
        super(config);
        this.type = 'otiot';
        this.letter = config.letter;
        this.isSacred = false;
        this.sacredLife = 0;
    }

    update(cameraSpeed, particles) {
        if (this.isSacred) {
            this.sacredLife--;
            if (this.sacredLife <= 0) this.isSacred = false;

            // Create the performant particle aura
            if (Math.random() > 0.4) {
                particles.push(new Particle({
                    x: this.x + (Math.random() - 0.5) * this.size,
                    y: this.y + (Math.random() - 0.5) * this.size,
                    color: `rgba(255, 223, 100, 0.7)`,
                    size: Math.random() * 3 + 1,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5 - cameraSpeed * 0.5,
                    life: 40 + Math.random() * 20,
                    drag: 0.98,
                    gravity: 0
                }));
            }
        }
    }

    draw(ctx) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${this.size}px "Times New Roman"`;

        if (this.isSacred) {
            ctx.fillStyle = '#FFFF00'; // Bright, glowing yellow
        } else {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#300842';
        }
        ctx.fillText(this.letter, this.x, this.y);
        ctx.globalAlpha = 1.0;
    }

    sanctify() {
        this.isSacred = true;
        this.sacredLife = 350;
    }
}

// --- Tzomeach (Plant) Class ---
export class Tzomeach extends Entity {
    constructor(config) {
        super(config);
        this.type = 'tzomeach';
        this.emoji = config.emoji;
        this.height = config.height;
        this.maxHeight = config.maxHeight;
        this.growthRate = config.growthRate;
    }

    update(cameraSpeed) {
        this.y -= cameraSpeed;
        if (this.height < this.maxHeight) {
            this.height += this.growthRate;
        }
    }

    draw(ctx) {
        // Draw the stem
        ctx.fillStyle = '#2C5E1A';
        ctx.fillRect(this.x - 4, this.y, 8, -this.height);
        // Draw the emoji on top
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(this.emoji, this.x, this.y - this.height);
    }

    // Custom, more accurate collision for plants
    collidesWith(player) {
        // Check collision with the top emoji (circle)
        const topY = this.y - this.height;
        const distSq = (player.x - this.x)**2 + (player.y - topY)**2;
        if (distSq < (player.radius + this.size / 2)**2) {
            return true;
        }
        
        // Check collision with the stem (rectangle)
        const playerLeft = player.x - player.radius;
        const playerRight = player.x + player.radius;
        const playerTop = player.y - player.radius;
        const playerBottom = player.y + player.radius;

        const stemLeft = this.x - 4;
        const stemRight = this.x + 4;
        const stemTop = this.y - this.height;
        const stemBottom = this.y;

        // Check for overlap
        return playerRight > stemLeft && playerLeft < stemRight && playerBottom > stemTop && playerTop < stemBottom;
    }
}

// --- Chai (Animal) Class ---
export class Chai extends Entity {
    constructor(config) {
        super(config);
        this.type = 'chai';
        this.emoji = config.emoji;
        this.vx = config.vx;
        this.vy = config.vy;
        this.bobbleAngle = Math.random() * Math.PI * 2; // For sine wave movement
    }

    update(cameraSpeed, particles, player, canvasWidth) {
        this.y -= cameraSpeed;
        this.x += this.vx;
        this.y += this.vy;
        
        // Add organic bobbing movement
        this.bobbleAngle += 0.05;
        this.y += Math.sin(this.bobbleAngle) * 0.5;

        // Wall bouncing
        if (this.x < this.size / 2 || this.x > canvasWidth - this.size / 2) {
            this.vx *= -1;
        }
    }

    draw(ctx) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(this.emoji, this.x, this.y);
    }
}