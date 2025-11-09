//B"H

// Get the canvas and its 2D rendering context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Player (The Chossid) ---
class Player {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocityY = 0;
        this.gravity = 0.8;
        this.jumpForce = -18;
        this.groundY = y;
        this.isJumping = false;
        this.emoji = '🏃'; // The running Chossid
    }

    draw() {
        // Draw the yamulka (a half-circle)
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.radius, this.radius / 1.5, Math.PI, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();

        // Draw the Chossid emoji
        ctx.font = `${this.radius * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
        }
    }

    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Prevent falling through the ground
        if (this.y > this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.isJumping = false;
        }
        
        this.draw();
    }
}

// --- Obstacles (Kelipos - Distractions) ---
class Obstacle {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        // Array of possible "distraction" emojis
        const kelipos = ['📱', '📺', '🗣️'];
        this.emoji = kelipos[Math.floor(Math.random() * kelipos.length)];
    }

    draw() {
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
    }

    update() {
        this.x -= this.speed;
        this.draw();
    }
}

// --- Collectibles (Mitzvos) ---
class Collectible {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
         // Array of possible "Mitzvah" emojis
        const mitzvos = ['📖', '🪙', '🕯️']; // Holy Book, Charity, Shabbos Candle
        this.emoji = mitzvos[Math.floor(Math.random() * mitzvos.length)];
    }
    
    draw() {
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, this.x, this.y);
    }

    update() {
        this.x -= this.speed;
        this.draw();
    }
}