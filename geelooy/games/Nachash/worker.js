//B"H

importScripts('worker-helpers.js');

const state = {
    // Game state
    isRunning: false,
    isPaused: false,
    score: 0,
    // Canvas and rendering
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    pixelRatio: 1,
    // Game objects
    player: null,
    sparks: [],
    particles: [],
    drones: [],
    debris: [],
    wormholes: [],
    comet: null,
    // Timers and counters
    sparkTimer: 0,
    droneTimer: 0,
    debrisTimer: 0,
    wormholeTimer: 15000,
    cometTimer: 20000,
    // Settings
    skillValues: {},
    cosmicBg: '#02021a',
    chain: {
        count: 0,
        timer: 0,
        maxTime: 240
    }
};

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];

self.onmessage = function(e) {
    const { type, ...data } = e.data;
    switch (type) {
        case 'init':
            init(data);
            break;
        case 'start':
            start(data);
            break;
        case 'resize':
            resize(data);
            break;
        case 'inputRot':
            if (state.player) state.player.turn(data.rotation * state.skillValues.turnRate);
            break;
        case 'inputUp':
             if (state.player) state.player.turning = 0;
            break;
        case 'togglePause':
            state.isPaused = !state.isPaused;
            if (state.isPaused === false) {
                gameLoop();
            }
            break;
    }
};

function init({ canvas, width, height, pixelRatio, initialSettings }) {
    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');
    state.cosmicBg = initialSettings.cosmicBg;
    state.skillValues = initialSettings.skillValues;
    resize({ width, height, pixelRatio });
}

function resize({ width, height, pixelRatio }) {
    state.width = width;
    state.height = height;
    state.pixelRatio = pixelRatio;
    state.canvas.width = width * pixelRatio;
    state.canvas.height = height * pixelRatio;
    state.ctx.scale(pixelRatio, pixelRatio);
}

function start({ skillValues }) {
    state.skillValues = skillValues;
    state.score = 0;
    state.sparks = [];
    state.particles = [];
    state.drones = [];
    state.debris = [];
    state.wormholes = [];
    state.comet = null;

    state.player = new Player(state.width / 2, state.height / 2, state.skillValues.startLength);
    state.chain.maxTime = state.skillValues.chainTime;

    for(let i = 0; i < 15; i++) {
        spawnSpark();
    }
    for(let i = 0; i < 5; i++) {
        spawnDebris();
    }
    
    state.isRunning = true;
    state.isPaused = false;
    gameLoop();
}

function gameLoop() {
    if (!state.isRunning || state.isPaused) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

function update() {
    const { player, sparks, particles, drones, debris, wormholes, comet, width, height } = state;

    player.update();
    wrapPosition(player);

    // Update game objects
    particles.forEach(p => p.update());
    drones.forEach(d => { d.update(); wrapPosition(d); });
    debris.forEach(d => { d.update(); wrapPosition(d); });
    wormholes.forEach(w => w.update());
    if (comet) comet.update();

    // Collision detection
    checkCollisions();

    // Timers and spawning
    updateTimers();

    // Clean up dead particles
    state.particles = particles.filter(p => p.life > 0);
}

function draw() {
    const { ctx, width, height, player, sparks, particles, drones, debris, wormholes, comet } = state;

    // Dynamic Nebula Background
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = state.cosmicBg;
    ctx.fillRect(0, 0, width, height);

    drawNebula(ctx, width, height);

    // Galactic Core
    drawGalacticCore(ctx, width / 2, height / 2);
    
    // Draw game objects
    wormholes.forEach(w => w.draw(ctx));
    debris.forEach(d => d.draw(ctx));
    sparks.forEach(s => s.draw(ctx));
    drones.forEach(d => d.draw(ctx));
    if (comet) comet.draw(ctx);
    player.draw(ctx);
    particles.forEach(p => p.draw(ctx));
}

function gameOver() {
    state.isRunning = false;
    self.postMessage({ type: 'gameover', finalScore: state.score });
}

function spawnSpark() {
    const spark = new Spark(
        Math.random() * state.width,
        Math.random() * state.height
    );
    state.sparks.push(spark);
}

function spawnDrone() {
    const edge = Math.floor(Math.random() * 4);
    let x, y, angle;
    switch(edge) {
        case 0: x = 0; y = Math.random() * state.height; angle = 0; break;
        case 1: x = state.width; y = Math.random() * state.height; angle = Math.PI; break;
        case 2: x = Math.random() * state.width; y = 0; angle = Math.PI / 2; break;
        case 3: x = Math.random() * state.width; y = state.height; angle = -Math.PI / 2; break;
    }
    state.drones.push(new Drone(x, y, angle));
}

function spawnDebris() {
    state.debris.push(new Debris(
        Math.random() * state.width,
        Math.random() * state.height
    ));
}

function spawnWormholes() {
    const { width, height } = state;
    const w1 = new Wormhole(Math.random() * width * 0.8 + width * 0.1, Math.random() * height * 0.8 + height * 0.1);
    const w2 = new Wormhole(Math.random() * width * 0.8 + width * 0.1, Math.random() * height * 0.8 + height * 0.1);
    w1.link(w2);
    w2.link(w1);
    state.wormholes = [w1, w2];
}

function spawnComet() {
    const { width, height } = state;
    const edge = Math.floor(Math.random() * 4);
    let x, y, angle;
    switch(edge) {
        case 0: x = -50; y = Math.random() * height; angle = Math.random() * Math.PI - Math.PI/2; break;
        case 1: x = width + 50; y = Math.random() * height; angle = Math.random() * Math.PI + Math.PI/2; break;
        case 2: x = Math.random() * width; y = -50; angle = Math.random() * Math.PI; break;
        case 3: x = Math.random() * width; y = height + 50; angle = -Math.random() * Math.PI; break;
    }
    state.comet = new Comet(x, y, angle);
    self.postMessage({ type: 'playSound', name: 'comet' });
}

function updateTimers() {
    state.sparkTimer++;
    if (state.sparkTimer > 100) {
        state.sparkTimer = 0;
        if (state.sparks.length < 30) spawnSpark();
    }

    state.droneTimer++;
    if(state.droneTimer > 500 && state.drones.length < 5) {
        state.droneTimer = 0;
        spawnDrone();
    }
    
    state.debrisTimer++;
    if(state.debrisTimer > 800 && state.debris.length < 10) {
        state.debrisTimer = 0;
        spawnDebris();
    }
    
    state.wormholeTimer -= 16;
    if(state.wormholeTimer <= 0) {
        spawnWormholes();
        state.wormholeTimer = 30000; // 30 seconds
    }
    if(state.wormholes.length > 0 && state.wormholes[0].life <= 0) {
        state.wormholes = [];
    }
    
    state.cometTimer -= 16;
    if(state.cometTimer <= 0) {
        spawnComet();
        state.cometTimer = 45000; // 45 seconds
    }
    if (state.comet && (state.comet.x < -100 || state.comet.x > state.width + 100 || state.comet.y < -100 || state.comet.y > state.height + 100)) {
        state.comet = null;
    }

    if (state.chain.timer > 0) {
        state.chain.timer--;
        if (state.chain.timer <= 0) {
            if (state.chain.count > 5) {
                 self.postMessage({ type: 'playSound', name: 'chainBreak' });
            }
            state.chain.count = 0;
        }
    }
    self.postMessage({ type: 'updateChain', chain: state.chain });
}

function checkCollisions() {
    const { player, sparks, drones, debris, wormholes, comet } = state;
    
    // Player head with sparks
    sparks.forEach((spark, index) => {
        if (getDistance(player.x, player.y, spark.x, spark.y) < player.size + spark.size) {
            state.sparks.splice(index, 1);
            const multiplier = 1 + Math.floor(state.chain.count / 5);
            state.score += 10 * multiplier;
            self.postMessage({ type: 'updateScore', score: state.score });
            self.postMessage({ type: 'playSound', name: 'collect', opts: { pitch: 880 + state.chain.count * 20 } });
            player.grow(1);
            state.chain.count++;
            state.chain.timer = state.chain.maxTime;
            
            // Hebrew letter particles
            for(let i = 0; i < 10; i++) {
                const letter = HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
                state.particles.push(new Particle(spark.x, spark.y, `hsl(${Math.random() * 360}, 100%, 75%)`, letter));
            }
        }
    });

    // Player head with drones and debris
    const obstacles = [...drones, ...debris.filter(d => d.size > 10)];
    obstacles.forEach(obs => {
        if (!player.isInvincible && getDistance(player.x, player.y, obs.x, obs.y) < player.size + obs.size) {
            gameOver();
        }
    });

    // Player body with itself
    if (!player.isInvincible && player.checkSelfCollision()) {
        gameOver();
    }
    
    // Player with wormholes
    wormholes.forEach(w => {
        if (getDistance(player.x, player.y, w.x, w.y) < w.radius && w.canTeleport) {
            w.teleport(player);
            self.postMessage({type: 'playSound', name: 'wormhole'});
        }
    });
    
    // Player with comet
    if (comet && getDistance(player.x, player.y, comet.x, comet.y) < player.size + 30) {
        player.activateCometBoost(state.skillValues.powerupDuration);
        state.comet = null;
        self.postMessage({type: 'playSound', name: 'powerup'});
    }
}```

### `worker_helpers.js`

This file contains helper classes and functions for the game, keeping `worker.js` cleaner.

```javascript
// Utility Functions
function getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

function wrapPosition(obj) {
    const { width, height } = state;
    if (obj.x < 0) obj.x = width;
    if (obj.x > width) obj.x = 0;
    if (obj.y < 0) obj.y = height;
    if (obj.y > height) obj.y = 0;
}

function drawNebula(ctx, width, height) {
    const time = Date.now() * 0.00005;
    const grd = ctx.createRadialGradient(
        width / 2 + Math.sin(time * 1.1) * 100, 
        height / 2 + Math.cos(time * 1.3) * 100, 
        0, 
        width / 2, 
        height / 2, 
        Math.max(width, height)
    );
    grd.addColorStop(0, `hsla(${time * 10 % 360}, 50%, 20%, 0.5)`);
    grd.addColorStop(0.5, `hsla(${(time * 10 + 120) % 360}, 60%, 10%, 0.5)`);
    grd.addColorStop(1, `hsla(${(time * 10 + 240) % 360}, 70%, 5%, 0.5)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
}

function drawGalacticCore(ctx, x, y) {
    const time = Date.now() * 0.001;
    for(let i = 5; i > 0; i--) {
        const radius = 20 + i * 10 + Math.sin(time + i) * 10;
        const alpha = 0.1 - i * 0.02 + Math.sin(time + i) * 0.05;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 220, ${alpha})`;
        ctx.fill();
    }
}

// Player Class
class Player {
    constructor(x, y, length) {
        this.x = x;
        this.y = y;
        this.size = 6;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 2;
        this.turning = 0;
        this.body = [];
        this.maxLength = length;
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.cometBoost = false;
    }

    turn(amount) {
        this.angle += amount;
    }

    update() {
        // Galactic Core Gravity
        const dx = state.width/2 - this.x;
        const dy = state.height/2 - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 50) {
            this.angle += Math.atan2(dy, dx) * 0.0001;
        }

        this.body.unshift({ x: this.x, y: this.y });
        if (this.body.length > this.maxLength) {
            this.body.pop();
        }

        const currentSpeed = this.cometBoost ? this.speed * 2.5 : this.speed;

        this.x += Math.cos(this.angle) * currentSpeed;
        this.y += Math.sin(this.angle) * currentSpeed;
        
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= 16;
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
                this.cometBoost = false;
            }
        }
    }

    draw(ctx) {
        // Comet boost effect
        if (this.cometBoost) {
            const grd = ctx.createRadialGradient(this.x, this.y, 5, this.x, this.y, 30);
            grd.addColorStop(0, 'rgba(255, 220, 180, 0.8)');
            grd.addColorStop(1, 'rgba(255, 100, 50, 0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Body
        this.body.forEach((seg, index) => {
            const ratio = (this.body.length - index) / this.body.length;
            const hue = (180 + (Date.now() / 20) + index * 2) % 360;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, ratio * this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
            ctx.fill();
        });

        // Head
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(60, 100%, 70%)';
        ctx.fill();
    }
    
    grow(amount) {
        this.maxLength += amount;
    }
    
    checkSelfCollision() {
        for(let i = 10; i < this.body.length; i++) {
            if (getDistance(this.x, this.y, this.body[i].x, this.body[i].y) < this.size) {
                return true;
            }
        }
        return false;
    }
    
    activateCometBoost(duration) {
        this.isInvincible = true;
        this.cometBoost = true;
        this.invincibleTimer = duration;
    }
}

// Other Game Object Classes
class Spark {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 4;
        this.angle = 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        const hue = (Date.now() / 10) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 75%)`;
        ctx.shadowColor = `hsl(${hue}, 100%, 75%)`;
        ctx.shadowBlur = 15;
        ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        ctx.restore();
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, color, text = null) {
        this.x = x;
        this.y = y;
        this.vx = Math.random() * 4 - 2;
        this.vy = Math.random() * 4 - 2;
        this.life = 100;
        this.color = color;
        this.text = text;
        this.size = this.text ? 20 : Math.random() * 3 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life / 100;
        if (this.text) {
            ctx.font = `${this.size * (this.life/100)}px 'Cormorant Garamond'`;
            ctx.fillStyle = this.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

class Drone {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.size = 8;
        this.angle = angle;
        this.speed = 1.5;
    }
    
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size, this.size);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();
        ctx.fill();
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

class Debris {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 15 + 5;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.02 - 0.01;
        const speed = 0.2;
        this.vx = Math.cos(this.angle) * speed;
        this.vy = Math.sin(this.angle) * speed;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.rotationSpeed;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = '#888';
        ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        ctx.restore();
    }
}

class Wormhole {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 30;
        this.life = 10000; // 10 seconds
        this.linked = null;
        this.canTeleport = true;
        this.teleportCooldown = 0;
    }
    
    link(other) {
        this.linked = other;
    }
    
    update() {
        this.life -= 16;
        if (this.teleportCooldown > 0) {
            this.teleportCooldown -= 16;
            if(this.teleportCooldown <= 0) this.canTeleport = true;
        }
    }
    
    draw(ctx) {
        const alpha = this.life > 1000 ? 1 : this.life / 1000;
        const time = Date.now() * 0.005;
        ctx.save();
        ctx.globalAlpha = alpha;
        for(let i = 0; i < 5; i++) {
            const r = this.radius * (1 - i*0.2) + Math.sin(time + i) * 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = `hsl(${(time * 10 + i * 40) % 360}, 100%, 70%)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
    }
    
    teleport(obj) {
        if(this.linked && this.canTeleport) {
            obj.x = this.linked.x;
            obj.y = this.linked.y;
            this.canTeleport = false;
            this.linked.canTeleport = false;
            this.teleportCooldown = 2000;
            this.linked.teleportCooldown = 2000;
        }
    }
}

class Comet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 5;
    }
    
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
    
    draw(ctx) {
        const grd = ctx.createLinearGradient(0, 0, 100, 0);
        grd.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grd.addColorStop(0.1, 'rgba(255, 220, 180, 0.8)');
        grd.addColorStop(1, 'rgba(255, 100, 50, 0)');
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(15,0);
        ctx.lineTo(-100, -15);
        ctx.lineTo(-100, 15);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(15, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}