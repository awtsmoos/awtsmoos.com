//B"H
//file worker-helpers.js

// Utility Functions
function getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

// --- Player Class (Performance Optimized) ---
class Player {
    constructor(x, y, length) {
        this.x = x;
        this.y = y;
        this.size = 12;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 4;
        this.body = [];
        this.maxLength = length;
        this.isTurning = false;
        this.targetAngle = this.angle;
        this.turnSpeed = 0.1;
        this.borderPadding = 25;
    }
    
    setTargetAngle(angle) { this.isTurning = true; this.targetAngle = angle; }
    stopTurning() { this.isTurning = false; }

    update() {
        if (this.isTurning) {
            let angleDiff = this.targetAngle - this.angle;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            this.angle += angleDiff * this.turnSpeed;
        }

        this.body.unshift({ x: this.x, y: this.y });
        if (this.body.length > this.maxLength) this.body.pop();

        // Border Sliding Logic
        const { width, height } = state.world;
        const pad = this.borderPadding;
        if ((this.x < pad && Math.cos(this.angle) < 0) || (this.x > width - pad && Math.cos(this.angle) > 0)) {
            this.angle = Math.PI - this.angle;
        }
        if ((this.y < pad && Math.sin(this.angle) < 0) || (this.y > height - pad && Math.sin(this.angle) > 0)) {
            this.angle = -this.angle;
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        this.x = Math.max(pad, Math.min(width - pad, this.x));
        this.y = Math.max(pad, Math.min(height - pad, this.y));
    }

    draw(ctx) {
        // --- PERFORMANCE: Use simple, flat shapes only ---
        // Body
        this.body.forEach((seg, index) => {
            const ratio = (this.body.length - index) / this.body.length;
            ctx.fillStyle = `hsl(120, 100%, ${30 + ratio * 25}%)`;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, ratio * this.size, 0, Math.PI * 2);
            ctx.fill();
        });
        // Head
        ctx.fillStyle = 'hsl(100, 100%, 70%)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    grow(amount) { this.maxLength += amount; }
}

// --- AI Snake Class (Performance Optimized) ---
class AiSnake {
    constructor(x, y, length, color) {
        this.x = x; this.y = y; this.size = 10;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 2.5 + Math.random();
        this.body = []; this.maxLength = length;
        this.color = color; this.isAlive = true;
        this.target = null; this.decisionTimer = 0;
    }

    update() {
        this.decisionTimer--;
        if (this.decisionTimer <= 0 || !this.target) {
            this.findTarget();
            this.decisionTimer = Math.random() * 150 + 50;
        }
        
        if (this.target) {
            const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            let angleDiff = targetAngle - this.angle;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            this.angle += angleDiff * 0.05;
        }

        this.body.unshift({ x: this.x, y: this.y });
        if (this.body.length > this.maxLength) this.body.pop();

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        const { width, height } = state.world;
        const pad = 20;
        if (this.x < pad || this.x > width - pad || this.y < pad || this.y > height - pad) {
            this.angle += Math.PI * 0.75;
        }
    }
    
    findTarget() {
        if (Math.random() < 0.7 && state.flowers.length > 0) {
            this.target = state.flowers[Math.floor(Math.random() * state.flowers.length)];
        } else {
            this.target = state.player;
        }
    }
    
    draw(ctx) {
        // --- PERFORMANCE: No alpha, no effects ---
        this.body.forEach((seg, index) => {
            const ratio = (this.body.length - index) / this.body.length;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, ratio * this.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    die() {
        this.isAlive = false;
        // Turn into energy (flowers)
        const energyValue = Math.floor(this.body.length / 4) + 2;
        for (let i = 0; i < energyValue; i++) {
            const seg = this.body[Math.floor(Math.random() * this.body.length)] || {x: this.x, y: this.y};
            const newFlower = new Flower(seg.x, seg.y, state.flowers[0].char); // Use char of an existing flower
            state.flowers.push(newFlower);
        }
    }

    grow(amount) { this.maxLength += amount; }
}

// --- Collectible Flower Class ---
class Flower {
    constructor(x, y, char) {
        this.x = x;
        this.y = y;
        this.size = 12;
        this.char = char;
    }

    draw(ctx) {
        ctx.font = '24px sans-serif';
        ctx.fillText(this.char, this.x - this.size / 2, this.y + this.size / 2);
    }
}

// --- Particle Class with Hebrew Letters ---
class Particle {
    constructor(x, y, color, text) {
        this.x = x; this.y = y;
        this.vx = Math.random() * 4 - 2;
        this.vy = Math.random() * 4 - 2;
        this.life = 100;
        this.color = color;
        this.text = text;
        this.size = 20;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // gravity
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / 100;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.size * alpha}px 'Cormorant Garamond'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x, this.y);
    }
}

// --- NEW Lightning Effect Class ---
class Lightning {
    constructor(x1, y1, x2, y2) {
        this.life = 20;
        this.segments = [];
        this.generate(x1, y1, x2, y2, 10);
    }

    generate(x1, y1, x2, y2, displacement) {
        if (displacement < 2) {
            this.segments.push({x1, y1, x2, y2});
        } else {
            const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displacement;
            const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displacement;
            this.generate(x1, y1, midX, midY, displacement / 2);
            this.generate(midX, midY, x2, y2, displacement / 2);
        }
    }

    update() { this.life--; }

    draw(ctx) {
        ctx.strokeStyle = `rgba(255, 255, 200, ${this.life / 20})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.segments.forEach(seg => {
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
        });
        ctx.stroke();
    }
}