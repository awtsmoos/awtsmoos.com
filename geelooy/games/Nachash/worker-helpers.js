//B"H
//file worker-helpers.js

// Utility Functions
function getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

const ALL_EMOJIS = Array.from("🌿🌼🌻💐🌹🥀🌺🌸💮🏵️🏵️🪻🍃🪵🪹");

// Player Class
class Player {
    constructor(x, y, length) {
        this.x = x;
        this.y = y;
        this.size = 10;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 3.5;
        this.body = [];
        this.maxLength = length;
        
        this.isTurning = false;
        this.targetAngle = this.angle;
        this.turnSpeed = 0.1; 
        
        // Border properties
        this.borderPadding = 25;
    }
    
    setTargetAngle(angle) {
        this.isTurning = true;
        this.targetAngle = angle;
    }

    stopTurning() {
        this.isTurning = false;
    }

    update() {
        if (this.isTurning) {
            let angleDifference = this.targetAngle - this.angle;
            while (angleDifference < -Math.PI) angleDifference += 2 * Math.PI;
            while (angleDifference > Math.PI) angleDifference -= 2 * Math.PI;
            this.angle += angleDifference * this.turnSpeed;
        }

        this.body.unshift({ x: this.x, y: this.y });
        if (this.body.length > this.maxLength) {
            this.body.pop();
        }

        let currentSpeed = this.speed;

        // --- BORDER SLIDING LOGIC ---
        const { width, height } = state.world;
        const pad = this.borderPadding;
        if ((this.x < pad && Math.cos(this.angle) < 0) || (this.x > width - pad && Math.cos(this.angle) > 0)) {
            this.angle = Math.PI - this.angle; // Reflect angle horizontally
        }
        if ((this.y < pad && Math.sin(this.angle) < 0) || (this.y > height - pad && Math.sin(this.angle) > 0)) {
            this.angle = -this.angle; // Reflect angle vertically
        }

        this.x += Math.cos(this.angle) * currentSpeed;
        this.y += Math.sin(this.angle) * currentSpeed;

        // Clamp position to ensure it doesn't go out of bounds
        this.x = Math.max(pad, Math.min(width - pad, this.x));
        this.y = Math.max(pad, Math.min(height - pad, this.y));
    }

    draw(ctx) {
        // Body
        this.body.forEach((seg, index) => {
            const ratio = (this.body.length - index) / this.body.length;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, ratio * this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(120, 100%, ${40 + ratio * 30}%)`; // Green shades
            ctx.fill();
        });

        // Head
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(100, 100%, 70%)'; // Brighter green head
        ctx.fill();
    }

    grow(amount) {
        this.maxLength += amount;
    }
}

// --- NEW AI SNAKE CLASS ---
class AiSnake {
    constructor(x, y, length, color) {
        this.x = x;
        this.y = y;
        this.size = 8;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 1.8 + Math.random() * 0.7;
        this.body = [];
        this.maxLength = length;
        this.color = color;
        this.isAlive = true;

        this.target = null;
        this.decisionTimer = 0;
    }

    update() {
        if (!this.isAlive) return;
        
        this.decisionTimer--;
        if (this.decisionTimer <= 0 || !this.target || (this.target.x === state.player.x && Math.random() < 0.05)) {
            this.findTarget();
            this.decisionTimer = Math.random() * 200 + 100;
        }
        
        if (this.target) {
            const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            let angleDifference = targetAngle - this.angle;
            while (angleDifference < -Math.PI) angleDifference += 2 * Math.PI;
            while (angleDifference > Math.PI) angleDifference -= 2 * Math.PI;
            this.angle += angleDifference * 0.04; 
        }

        this.body.unshift({ x: this.x, y: this.y });
        if (this.body.length > this.maxLength) {
            this.body.pop();
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // World boundary containment
        const { width, height } = state.world;
        const pad = 20;
        if (this.x < pad || this.x > width - pad || this.y < pad || this.y > height - pad) {
            this.angle += Math.PI * 0.5; // Turn away from the edge
        }
    }
    
    findTarget() {
        // 65% chance to target a spark, 35% to target the player
        if (Math.random() < 0.65 && state.sparks.length > 0) {
            let closestSpark = null;
            let minDistance = 500; // Only target nearby sparks
            for (const spark of state.sparks) {
                const dist = getDistance(this.x, this.y, spark.x, spark.y);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestSpark = spark;
                }
            }
            this.target = closestSpark;
        } else {
            this.target = state.player;
        }
    }
    
    draw(ctx) {
        // Body
        this.body.forEach((seg, index) => {
            const ratio = (this.body.length - index) / this.body.length;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, ratio * this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = ratio * 0.8 + 0.2;
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Head
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    
    die() {
        this.isAlive = false;
        // Turn into a bunch of energy (sparks)
        const energyValue = Math.floor(this.body.length / 2) + 5;
        for (let i = 0; i < energyValue; i++) {
            const segmentIndex = Math.floor(Math.random() * this.body.length);
            const segment = this.body[segmentIndex] || {x: this.x, y: this.y};
            const spark = new Spark(
                segment.x + Math.random() * 20 - 10, 
                segment.y + Math.random() * 20 - 10
            );
            state.sparks.push(spark);
        }
    }

    grow(amount) {
        this.maxLength += amount;
    }
}


// Collectable Spark Class
class Spark {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 12; // A bit bigger to be easier to see
        this.char = ALL_EMOJIS[Math.floor(Math.random() * ALL_EMOJIS.length)];
    }

    draw(ctx) {
        ctx.font = '24px sans-serif';
        ctx.fillText(this.char, this.x - this.size / 2, this.y + this.size / 2);
    }
}

// Particle Class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = Math.random() * 4 - 2;
        this.vy = Math.random() * 4 - 2;
        this.life = 80;
        this.color = color;
        this.size = Math.random() * 3 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / 80;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}