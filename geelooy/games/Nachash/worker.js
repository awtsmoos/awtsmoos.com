//B"H
//file worker.js
importScripts('worker-helpers.js');

const state = {
    // Game State
    isRunning: false,
    score: 0,
    level: 1,
    energyRush: {
        active: false,
        timer: 0,
        activationScore: 0
    },
    // World & Camera
    world: {
        width: 3000,
        height: 3000,
        backgroundLines: []
    },
    camera: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        zoom: 0.8 // Start more zoomed in
    },
    // Canvas
    canvas: null,
    ctx: null,
    pixelRatio: 1,
    // Game Objects
    player: null,
    flowers: [],
    particles: [],
    aiSnakes: [],
    wormholes: [],
    comet: null,
    // Timers
    flowerTimer: 0,
    aiSnakeTimer: 0,
    wormholeTimer: 15000, // 15 seconds
    cometTimer: 30000, // 30 seconds
};

// --- PERFORMANCE: Object Pooling for Particles ---
const particlePool = new ObjectPool(() => new Particle(), 500);

const FLOWER_EMOJIS = Array.from('🌼🌻💐🌹🌺🌸🏵️🪻');
const HEBREW_LETTERS = Array.from('אבגדהוזחטיכלמנסעפצקרשת');

self.onmessage = (e) => {
    const { type, ...data } = e.data;
    switch (type) {
        case 'init': init(data); break;
        case 'start': start(); break;
        case 'resize': resize(data.width, data.height, data.pixelRatio); break;
        case 'setInputAngle': if (state.player) state.player.setTargetAngle(data.angle); break;
        case 'inputUp': if (state.player) state.player.stopTurning(); break;
    }
};

function init({ canvas, width, height, pixelRatio }) {
    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');
    resize(width, height, pixelRatio);
    generateBackground();
}

function resize(width, height, pixelRatio) {
    state.camera.width = width;
    state.camera.height = height;
    state.pixelRatio = pixelRatio;
    state.canvas.width = width * pixelRatio;
    state.canvas.height = height * pixelRatio;
    state.ctx.scale(pixelRatio, pixelRatio);
}

function generateBackground() {
    for (let i = 0; i < 200; i++) {
        const vertical = Math.random() > 0.5;
        state.world.backgroundLines.push({
            x: Math.random() * state.world.width,
            y: Math.random() * state.world.height,
            length: Math.random() * 200 + 50,
            width: Math.random() * 3 + 1,
            color: `hsl(${100 + Math.random() * 40}, 30%, ${20 + Math.random() * 10}%)`,
            vertical: vertical
        });
    }
}

function start() {
    Object.assign(state, {
        score: 0, level: 1, flowers: [], particles: [], aiSnakes: [],
        wormholes: [], comet: null, isRunning: true,
        energyRush: { active: false, timer: 0, activationScore: 0 }
    });
    particlePool.reset();

    state.player = new Player(state.world.width / 2, state.world.height / 2, 20);

    for (let i = 0; i < 200; i++) spawnFlower();
    for (let i = 0; i < 15; i++) spawnAiSnake();
    
    gameLoop();
}

function updateCamera() {
    const { camera, player } = state;
    // --- DYNAMIC ZOOM: Zooms out as player gets longer/faster ---
    const lengthBonus = Math.max(1, player.maxLength / 100);
    const speedBonus = player.speed / player.baseSpeed;
    const targetZoom = 2.0 / (lengthBonus * speedBonus);

    camera.zoom += (targetZoom - camera.zoom) * 0.02;

    const targetX = player.x - (camera.width / 2 / camera.zoom);
    const targetY = player.y - (camera.height / 2 / camera.zoom);
    
    camera.x += (targetX - camera.x) * 0.1;
    camera.y += (targetY - camera.y) * 0.1;

    camera.x = Math.max(0, Math.min(camera.x, state.world.width - (camera.width / camera.zoom)));
    camera.y = Math.max(0, Math.min(camera.y, state.world.height - (camera.height / camera.zoom)));
}

function gameLoop(timestamp) {
    if (!state.isRunning) return;
    const deltaTime = 16.67; // Assume 60fps for simplicity
    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    state.player.update();
    state.aiSnakes.forEach(s => s.update());
    state.particles.forEach(p => p.update(p));
    if (state.comet) state.comet.update();
    state.wormholes.forEach(w => w.update());

    checkCollisions();
    updateTimers(deltaTime);

    // --- PERFORMANCE: Efficiently manage active particles ---
    state.particles = state.particles.filter(p => {
        if (p.life <= 0) {
            particlePool.release(p);
            return false;
        }
        return true;
    });
    
    updateCamera();
}

function draw() {
    const { ctx, camera, player, flowers, aiSnakes, particles, comet, wormholes } = state;
    ctx.save();
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, camera.width, camera.height);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    drawBackground(ctx);

    wormholes.forEach(w => w.draw(ctx));
    flowers.forEach(f => f.draw(ctx));
    if (comet) comet.draw(ctx);
    aiSnakes.forEach(s => s.draw(ctx));
    player.draw(ctx);
    particles.forEach(p => p.draw(ctx));

    ctx.restore();

    ctx.fillStyle = state.energyRush.active ? '#FFFF00' : 'white';
    ctx.font = '28px "Cormorant Garamond"';
    ctx.fillText(`Score: ${state.score}`, 20, 40);
    if(state.energyRush.active) {
         ctx.fillText(`ENERGY RUSH!`, camera.width / 2 - 80, 40);
    }
}

function drawBackground(ctx) {
    const { camera } = state;
    const view = { x: camera.x, y: camera.y, right: camera.x + camera.width / camera.zoom, bottom: camera.y + camera.height / camera.zoom };
    
    state.world.backgroundLines.forEach(line => {
        if (line.x < view.right && line.x + (line.vertical ? line.width : line.length) > view.x &&
            line.y < view.bottom && line.y + (line.vertical ? line.length : line.width) > view.y) {
            ctx.fillStyle = line.color;
            if (line.vertical) {
                ctx.fillRect(line.x, line.y, line.width, line.length);
            } else {
                ctx.fillRect(line.x, line.y, line.length, line.width);
            }
        }
    });

    ctx.strokeStyle = '#3a2a12';
    ctx.lineWidth = 40;
    ctx.strokeRect(20, 20, state.world.width - 40, state.world.height - 40);
}

function gameOver() {
    state.isRunning = false;
    self.postMessage({ type: 'gameover', finalScore: state.score });
}

// --- Spawning Functions ---
function spawnFlower() { state.flowers.push(new Flower(Math.random() * (state.world.width - 100) + 50, Math.random() * (state.world.height - 100) + 50, FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)])); }
function spawnAiSnake() { state.aiSnakes.push(new AiSnake(Math.random() * state.world.width, Math.random() * state.world.height, Math.floor(Math.random() * 10) + 5 + state.level, `hsl(${Math.random() * 360}, 90%, 60%)`)); }
function spawnWormholes() {
    if (state.wormholes.length > 0) return;
    const w1 = new Wormhole(Math.random() * state.world.width, Math.random() * state.world.height);
    const w2 = new Wormhole(Math.random() * state.world.width, Math.random() * state.world.height);
    w1.link(w2); w2.link(w1);
    state.wormholes = [w1, w2];
}
function spawnComet() { state.comet = new Comet(state.world.width, state.world.height); }

function updateTimers(deltaTime) {
    // Flowers & AI Snakes
    if ((state.flowerTimer += deltaTime) > 200 && state.flowers.length < 300) { spawnFlower(); state.flowerTimer = 0; }
    if ((state.aiSnakeTimer += deltaTime) > 5000 && state.aiSnakes.length < 20 + state.level * 2) { spawnAiSnake(); state.aiSnakeTimer = 0; state.level++; }

    // Wormholes
    if ((state.wormholeTimer -= deltaTime) <= 0) { spawnWormholes(); state.wormholeTimer = 30000; }
    if (state.wormholes.length > 0 && state.wormholes[0].life <= 0) state.wormholes = [];

    // Comet
    if ((state.cometTimer -= deltaTime) <= 0) { if(!state.comet) spawnComet(); state.cometTimer = 45000; }
    if (state.comet && state.comet.isOutOfBounds(state.world.width, state.world.height)) state.comet = null;
    
    // --- NEW: Energy Rush Mode ---
    if(state.energyRush.active) {
        state.energyRush.timer -= deltaTime;
        if(state.energyRush.timer <= 0) {
            state.energyRush.active = false;
            state.player.setEnergyRush(false);
        }
    }
}

function triggerEnergyRush() {
    state.energyRush.active = true;
    state.energyRush.timer = 8000; // 8 seconds
    state.energyRush.activationScore = state.score;
    state.player.setEnergyRush(true);
}

function checkCollisions() {
    const { player, flowers, aiSnakes, wormholes, comet } = state;

    // Player collects flowers
    for (let i = flowers.length - 1; i >= 0; i--) {
        if (getDistance(player.x, player.y, flowers[i].x, flowers[i].y) < player.size + flowers[i].size) {
            const flower = flowers.splice(i, 1)[0];
            state.score += 10;
            player.grow(1);
            if (!state.energyRush.active && state.score > state.energyRush.activationScore + 1000) {
                triggerEnergyRush();
            }
            for (let p = 0; p < 12; p++) {
                particlePool.get().init(flower.x, flower.y, `hsl(${Math.random() * 360}, 100%, 80%)`, HEBREW_LETTERS[p % HEBREW_LETTERS.length]);
                state.particles.push(particlePool.last);
            }
        }
    }
    
    // Player interactions
    if (comet && getDistance(player.x, player.y, comet.x, comet.y) < player.size + 30) {
        player.activateCometBoost(5000); state.comet = null;
    }
    wormholes.forEach(w => w.teleport(player));

    // Player vs AI
    for (let i = aiSnakes.length - 1; i >= 0; i--) {
        const enemy = aiSnakes[i];
        if (!enemy.isAlive) continue;
        // Head-on-head
        if (getDistance(player.x, player.y, enemy.x, enemy.y) < player.size + enemy.size) {
            if (player.maxLength >= enemy.maxLength) {
                enemy.die(); state.score += 50;
            } else { gameOver(); return; }
        }
        // Player head to AI body
        for (const seg of enemy.body) { if (getDistance(player.x, player.y, seg.x, seg.y) < player.size) { gameOver(); return; } }
        // AI head to Player body
        if (!state.player.isInvincible) {
            for (const seg of player.body) { if (getDistance(enemy.x, enemy.y, seg.x, seg.y) < enemy.size) { enemy.die(); state.score += 25; break; } }
        }
    }
}