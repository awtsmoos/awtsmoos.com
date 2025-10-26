//B"H
//file worker-helpers.js

// --- PERFORMANCE: Re-usable object pool for particles ---
class ObjectPool {
    constructor(createFn, initialSize) {
        this._createFn = createFn;
        this._pool = [];
        this.last = null;
        for (let i = 0; i < initialSize; i++) {
            this._pool.push(this._createFn());
        }
    }
    get() {
        if (this._pool.length > 0) {
            this.last = this._pool.pop();
            return this.last;
        }
        this.last = this._createFn();
        return this.last;
    }
    release(obj) {
        obj.reset();
        this._pool.push(obj);
    }
    reset() {
        this._pool.forEach(obj => obj.reset());
    }
}

function getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2; const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

// --- Player Class (with new abilities) ---
class Player {
    constructor(x, y, length) {
        this.x = x; this.y = y; this.size = 12;
        this.angle = 0; this.speed = 4; this.baseSpeed = 4;
        this.body = []; this.maxLength = length;
        this.isTurning = false; this.targetAngle = 0;
        this.turnSpeed = 0.1; this.borderPadding = 30;
        this.isInvincible = false; this.invincibleTimer = 0;
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

        this.handleBorders();
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= 16.67;
            if (this.invincibleTimer <= 0) this.isInvincible = false;
        }
    }

    handleBorders() {
        const { width, height } = state.world;
        const pad = this.borderPadding;
        if ((this.x < pad && Math.cos(this.angle) < 0) || (this.x > width - pad && Math.cos(this.angle) > 0)) {
            this.angle = Math.PI - this.angle;
        }
        if ((this.y < pad && Math.sin(this.angle) < 0) || (this.y > height - pad && Math.sin(this.angle) > 0)) {
            this.angle = -this.angle;
        }
        this.x = Math.max(pad, Math.min(width - pad, this.x));
        this.y = Math.max(pad, Math.min(height - pad, this.y));
    }
    
    draw(ctx) {
        const color = state.energyRush.active ? 0 : 120;
        // Body
        this.body.forEach((seg, i) => {
            const ratio = (this.body.length - i) / this.body.length;
            ctx.fillStyle = `hsl(${color + i*0.5}, 100%, ${30 + ratio * 25}%)`;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, ratio * this.size, 0, Math.PI * 2);
            ctx.fill();
        });
        // Head
        ctx.fillStyle = `hsl(${color}, 100%, 70%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    grow(amount) { this.maxLength += amount; }
    
    // --- NEW: Special Abilities ---
    activateCometBoost(duration) {
        this.isInvincible = true;
        this.invincibleTimer = duration;
        this.speed = this.baseSpeed * 2.5;
        setTimeout(() => this.speed = this.baseSpeed, duration);
    }

    setEnergyRush(isActive) {
        this.speed = isActive ? this.baseSpeed * 1.5 : this.baseSpeed;
        this.isInvincible = isActive;
        if(isActive) this.invincibleTimer = 8000;
    }
}

class AiSnake {
    constructor(x, y, length, color) {
        this.x = x; this.y = y; this.size = 10;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 2.5 + Math.random();
        this.body = []; this.maxLength = length;
        this.color = color; this.isAlive = true;
        this.target = null;
    }
    update() {
        this.findTarget();
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
        if (this.x < 0 || this.x > state.world.width || this.y < 0 || this.y > state.world.height) this.angle += Math.PI;
    }
    findTarget() {
        if (Math.random() < 0.8 && state.flowers.length > 0) {
            this.target = state.flowers.sort((a,b) => getDistance(this.x, this.y, a.x, a.y) - getDistance(this.x, this.y, b.x, b.y))[0];
        } else { this.target = state.player; }
    }
    draw(ctx) {
        this.body.forEach((seg, i) => {
            const ratio = (this.body.length - i) / this.body.length;
            ctx.fillStyle = this.color;
            ctx.beginPath(); ctx.arc(seg.x, seg.y, ratio * this.size, 0, Math.PI * 2); ctx.fill();
        });
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    }
    die() {
        this.isAlive = false;
        const energyValue = Math.floor(this.body.length / 3) + 3;
        for (let i = 0; i < energyValue; i++) {
            const seg = this.body[Math.floor(Math.random() * this.body.length)] || {x: this.x, y: this.y};
            spawnFlower();
            state.flowers[state.flowers.length-1].x = seg.x;
            state.flowers[state.flowers.length-1].y = seg.y;
        }
    }
    grow(amount) { this.maxLength += amount; }
}

class Flower {
    constructor(x, y, char) { this.x = x; this.y = y; this.size = 12; this.char = char; }
    draw(ctx) { ctx.font = '24px sans-serif'; ctx.fillText(this.char, this.x - this.size, this.y + this.size / 2); }
}

class Particle {
    init(x, y, color, text) {
        this.x = x; this.y = y; this.color = color; this.text = text;
        this.vx = Math.random() * 6 - 3; this.vy = Math.random() * -6 - 2;
        this.life = 100; this.size = 20;
    }
    reset() { this.life = 0; }
    update() {
        this.x += this.vx; this.y += this.vy; this.vy += 0.1; this.life--;
    }
    draw(ctx) {
        ctx.globalAlpha = this.life / 100;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.size * (this.life / 100)}px 'Cormorant Garamond'`;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.globalAlpha = 1.0;
    }
}

// --- NEW & IMPROVED Game Objects ---
class Wormhole {
    constructor(x, y) {
        this.x = x; this.y = y; this.radius = 40; this.life = 10000;
        this.linked = null; this.canTeleport = true; this.teleportCooldown = 0;
    }
    link(other) { this.linked = other; }
    update() {
        this.life -= 16.67;
        if (this.teleportCooldown > 0) {
            this.teleportCooldown -= 16.67;
            if (this.teleportCooldown <= 0) this.canTeleport = true;
        }
    }
    draw(ctx) {
        for (let i = 0; i < 5; i++) {
            const r = this.radius * (1 - i * 0.2) + Math.sin(Date.now() * 0.005 + i) * 5;
            ctx.strokeStyle = `hsl(${(Date.now() * 0.01 + i * 40) % 360}, 100%, 70%)`;
            ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, Math.PI * 2); ctx.stroke();
        }
    }
    teleport(obj) {
        if (this.linked && this.canTeleport && getDistance(obj.x, obj.y, this.x, this.y) < this.radius) {
            obj.x = this.linked.x; obj.y = this.linked.y;
            this.canTeleport = false; this.linked.canTeleport = false;
            this.teleportCooldown = 2000; this.linked.teleportCooldown = 2000;
        }
    }
}

class Comet {
    constructor(worldW, worldH) {
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: this.x = -50; this.y = Math.random() * worldH; this.angle = 0; break;
            case 1: this.x = worldW + 50; this.y = Math.random() * worldH; this.angle = Math.PI; break;
            case 2: this.x = Math.random() * worldW; this.y = -50; this.angle = Math.PI / 2; break;
            case 3: this.x = Math.random() * worldW; this.y = worldH + 50; this.angle = -Math.PI / 2; break;
        }
        this.speed = 8;
    }
    update() { this.x += Math.cos(this.angle) * this.speed; this.y += Math.sin(this.angle) * this.speed; }
    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(this.x, this.y, 15, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = `rgba(255, 220, 180, ${1 - i * 0.1})`;
            ctx.beginPath();
            ctx.arc(this.x - Math.cos(this.angle) * i * 8, this.y - Math.sin(this.angle) * i * 8, 12 - i, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    isOutOfBounds(w, h) { return this.x < -100 || this.x > w + 100 || this.y < -100 || this.y > h + 100; }
}