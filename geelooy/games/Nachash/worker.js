//B"H
//file worker.js
importScripts('worker-helpers.js');

const state = {
    // Game state
    isRunning: false,
    isPaused: false,
    score: 0,
    level: 1,
    // --- PERFORMANCE: Smaller world reduces objects to track ---
    world: {
        width: 2500,
        height: 2500,
        backgroundPatches: [] // Faster than drawing emojis
    },
    camera: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        zoom: 1.5
    },
    // Canvas and rendering
    canvas: null,
    ctx: null,
    pixelRatio: 1,
    // Game objects
    player: null,
    flowers: [], // Renamed from sparks for clarity
    particles: [],
    aiSnakes: [],
    lightningEffects: [], // For the new lightning effect
    // Timers and counters
    flowerTimer: 0,
    aiSnakeTimer: 0,
};

// --- VISUALS: Only flower emojis are collectibles ---
const FLOWER_EMOJIS = Array.from('🌼🌻💐🌹🌺🌸🏵️🪻');
const HEBREW_LETTERS = Array.from('אבגדהוזחטיכלמנסעפצקרשת');

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
            resize(data.width, data.height, data.pixelRatio);
            break;
        case 'setInputAngle':
            if (state.player) state.player.setTargetAngle(data.angle);
            break;
        case 'inputUp':
            if (state.player) state.player.stopTurning();
            break;
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

// --- PERFORMANCE & VISUALS: New, faster background generation ---
function generateBackground() {
    state.world.backgroundPatches = [];
    const patchSize = 50;
    for (let x = 0; x < state.world.width; x += patchSize) {
        for (let y = 0; y < state.world.height; y += patchSize) {
            // Creates a textured look with shades of green and brown
            const colorType = Math.random();
            let color;
            if (colorType < 0.8) { // 80% chance of grass
                color = `hsl(120, 30%, ${20 + Math.random() * 15}%)`;
            } else { // 20% chance of dirt
                color = `hsl(30, 30%, ${15 + Math.random() * 10}%)`;
            }
            state.world.backgroundPatches.push({ x, y, size: patchSize, color });
        }
    }
}

function start() {
    state.score = 0;
    state.level = 1;
    state.flowers = [];
    state.particles = [];
    state.aiSnakes = [];
    state.lightningEffects = [];

    state.player = new Player(state.world.width / 2, state.world.height / 2, 20);

    for (let i = 0; i < 150; i++) {
        spawnFlower();
    }
    // --- AI: More snakes from the start ---
    for (let i = 0; i < 10; i++) {
        spawnAiSnake();
    }

    state.isRunning = true;
    gameLoop();
}

function updateCamera() {
    const { camera, player } = state;
    const targetZoom = 1.5;
    const targetX = player.x - (camera.width / 2 / camera.zoom);
    const targetY = player.y - (camera.height / 2 / camera.zoom);
    
    camera.x += (targetX - camera.x) * 0.1;
    camera.y += (targetY - camera.y) * 0.1;
    camera.zoom += (targetZoom - camera.zoom) * 0.02;

    camera.x = Math.max(0, Math.min(camera.x, state.world.width - (camera.width / camera.zoom)));
    camera.y = Math.max(0, Math.min(camera.y, state.world.height - (camera.height / camera.zoom)));
}

function gameLoop() {
    if (!state.isRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    state.player.update();
    state.aiSnakes.forEach(s => s.update());
    state.particles.forEach(p => p.update());
    state.lightningEffects.forEach(l => l.update());

    checkCollisions();
    updateTimers();

    // Cleanup dead objects
    state.particles = state.particles.filter(p => p.life > 0);
    state.aiSnakes = state.aiSnakes.filter(s => s.isAlive);
    state.lightningEffects = state.lightningEffects.filter(l => l.life > 0);
    
    updateCamera();
}

function draw() {
    const { ctx, camera, player, flowers, aiSnakes, particles, lightningEffects } = state;

    ctx.save();
    ctx.fillStyle = '#1a2d1a'; // Dark green base
    ctx.fillRect(0, 0, camera.width, camera.height);

    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    drawBackground(ctx);

    flowers.forEach(s => s.draw(ctx));
    aiSnakes.forEach(s => s.draw(ctx));
    player.draw(ctx);
    particles.forEach(p => p.draw(ctx));
    lightningEffects.forEach(l => l.draw(ctx));

    ctx.restore();

    // UI - No shadow for performance
    ctx.fillStyle = 'white';
    ctx.font = '24px "Cormorant Garamond"';
    ctx.fillText(`Score: ${state.score}`, 20, 40);
}

function drawBackground(ctx) {
    const { camera } = state;
    // --- PERFORMANCE: Only draw patches visible to the camera ---
    const view = {
        x: camera.x,
        y: camera.y,
        right: camera.x + (camera.width / camera.zoom),
        bottom: camera.y + (camera.height / camera.zoom)
    };
    
    state.world.backgroundPatches.forEach(patch => {
        if (patch.x < view.right && patch.x + patch.size > view.x &&
            patch.y < view.bottom && patch.y + patch.size > view.y) {
            ctx.fillStyle = patch.color;
            ctx.fillRect(patch.x, patch.y, patch.size, patch.size);
        }
    });

    // Border
    ctx.strokeStyle = '#5a3a22';
    ctx.lineWidth = 40;
    ctx.strokeRect(20, 20, state.world.width - 40, state.world.height - 40);
}

function gameOver() {
    state.isRunning = false;
    self.postMessage({ type: 'gameover', finalScore: state.score });
}

function spawnFlower() {
    const flower = new Flower(
        Math.random() * (state.world.width - 100) + 50,
        Math.random() * (state.world.height - 100) + 50,
        FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)]
    );
    state.flowers.push(flower);
}

function spawnAiSnake() {
    const snake = new AiSnake(
        Math.random() * state.world.width,
        Math.random() * state.world.height,
        Math.floor(Math.random() * 10) + 5 + state.level,
        `hsl(${Math.random() * 360}, 90%, 60%)`
    );
    state.aiSnakes.push(snake);
}

function updateTimers() {
    state.flowerTimer++;
    if (state.flowerTimer > 20 && state.flowers.length < 250) {
        state.flowerTimer = 0;
        spawnFlower();
    }

    state.aiSnakeTimer++;
    const maxSnakes = 10 + state.level * 3; // --- AI: More aggressive scaling ---
    if (state.aiSnakeTimer > 300 && state.aiSnakes.length < maxSnakes) {
        state.aiSnakeTimer = 0;
        spawnAiSnake();
        state.level++;
    }
}

// --- GAMEPLAY: Rewritten collision logic ---
function checkCollisions() {
    const { player, flowers, aiSnakes } = state;
    const playerHead = { x: player.x, y: player.y, size: player.size };

    // Player collects flowers
    for (let i = flowers.length - 1; i >= 0; i--) {
        const flower = flowers[i];
        if (getDistance(playerHead.x, playerHead.y, flower.x, flower.y) < playerHead.size + flower.size) {
            const collectedFlower = flowers.splice(i, 1)[0];
            state.score += 10;
            player.grow(1);
            self.postMessage({ type: 'playSound', name: 'collect' });
            
            // --- VISUALS: Spawn Hebrew Letter Particles ---
            for (let p = 0; p < 10; p++) {
                const letter = HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
                state.particles.push(new Particle(collectedFlower.x, collectedFlower.y, `hsl(${Math.random() * 360}, 100%, 80%)`, letter));
            }
        }
    }

    // Interactions between player and AI snakes
    for (let i = aiSnakes.length - 1; i >= 0; i--) {
        const enemy = aiSnakes[i];
        if (!enemy.isAlive) continue;

        // Rule: Player head hits AI head -> AI dies
        if (getDistance(playerHead.x, playerHead.y, enemy.x, enemy.y) < playerHead.size + enemy.size) {
            enemy.die();
            state.score += 50;
            state.lightningEffects.push(new Lightning(playerHead.x, playerHead.y, enemy.x, enemy.y));
            continue; // Skip other checks for this snake
        }

        // Rule: Player head hits AI body -> Player dies
        for (const seg of enemy.body) {
            if (getDistance(playerHead.x, playerHead.y, seg.x, seg.y) < player.size) {
                gameOver();
                return;
            }
        }

        // Rule: AI head hits player body -> AI dies
        for (const seg of player.body) {
            if (getDistance(enemy.x, enemy.y, seg.x, seg.y) < enemy.size) {
                enemy.die();
                state.score += 25;
                state.lightningEffects.push(new Lightning(enemy.x, enemy.y, seg.x, seg.y));
                break; // Stop checking this AI's head against the player's body
            }
        }
    }
    
    // AI snakes collect flowers
    for (const snake of aiSnakes) {
        for (let i = flowers.length - 1; i >= 0; i--) {
            const flower = flowers[i];
            if (getDistance(snake.x, snake.y, flower.x, flower.y) < snake.size + flower.size) {
                flowers.splice(i, 1);
                snake.grow(1);
            }
        }
    }
}