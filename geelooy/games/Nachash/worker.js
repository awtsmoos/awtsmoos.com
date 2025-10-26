//B"H
//file worker.js
importScripts('worker-helpers.js');

const state = {
    // Game state
    isRunning: false,
    isPaused: false,
    score: 0,
    level: 1,
    // World and Camera
    world: {
        width: 4000,
        height: 4000,
        backgroundStripes: [],
        backgroundEmojis: []
    },
    camera: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        zoom: 2 // Start zoomed in
    },
    // Canvas and rendering
    canvas: null,
    ctx: null,
    pixelRatio: 1,
    // Game objects
    player: null,
    sparks: [],
    particles: [],
    aiSnakes: [], // Replaces drones
    // Timers and counters
    sparkTimer: 0,
    aiSnakeTimer: 0,
};

// Emojis for the background
const BACKGROUND_EMOJIS = ['🌿', '🌼', '🌻', '💐', '🌹', '🥀', '🌺', '🌸', '💮', '🏵️', '🪻', '🍃', '🪵', '🪹'];

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

function init({ canvas, width, height, pixelRatio, initialSettings }) {
    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');
    state.skillValues = initialSettings.skillValues;
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
    // Generate grass stripes
    for (let i = 0; i < 100; i++) {
        state.world.backgroundStripes.push({
            y: Math.random() * state.world.height,
            height: Math.random() * 50 + 20,
            color: `hsl(120, 60%, ${Math.random() * 15 + 25}%)` // Shades of dark green
        });
    }
    // Generate random emojis
    const emojiArray = Array.from(BACKGROUND_EMOJIS);
    for (let i = 0; i < 500; i++) {
        state.world.backgroundEmojis.push({
            char: emojiArray[Math.floor(Math.random() * emojiArray.length)],
            x: Math.random() * state.world.width,
            y: Math.random() * state.world.height,
            size: Math.random() * 20 + 20
        });
    }
}

function start() {
    state.score = 0;
    state.level = 1;
    state.sparks = [];
    state.particles = [];
    state.aiSnakes = [];

    const startX = state.world.width / 2;
    const startY = state.world.height / 2;

    state.player = new Player(startX, startY, 20); // Player starts with length 20

    for (let i = 0; i < 200; i++) { // More sparks for a big world
        spawnSpark();
    }

    const initialSnakeCount = 5 + Math.floor(state.level / 2);
    for (let i = 0; i < initialSnakeCount; i++) { 
        spawnAiSnake();
    }

    state.isRunning = true;
    state.isPaused = false;
    gameLoop();
}

function updateCamera() {
    const { camera, player, canvas } = state;
    const targetZoom = 1.5; // Example target zoom level
    
    // Smoothly follow the player
    const targetX = player.x - (camera.width / 2 / targetZoom);
    const targetY = player.y - (camera.height / 2 / targetZoom);
    
    camera.x += (targetX - camera.x) * 0.08;
    camera.y += (targetY - camera.y) * 0.08;
    camera.zoom += (targetZoom - camera.zoom) * 0.02;

    // Clamp camera to world boundaries
    camera.x = Math.max(0, Math.min(camera.x, state.world.width - (camera.width / camera.zoom)));
    camera.y = Math.max(0, Math.min(camera.y, state.world.height - (camera.height / camera.zoom)));
}

function gameLoop() {
    if (!state.isRunning || state.isPaused) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

function update() {
    const { player, sparks, particles, aiSnakes } = state;

    player.update();

    // Update game objects
    particles.forEach(p => p.update());
    aiSnakes.forEach(s => s.update());

    // Collision detection
    checkCollisions();

    // Timers and spawning
    updateTimers();

    // Clean up dead particles and snakes
    state.particles = particles.filter(p => p.life > 0);
    state.aiSnakes = state.aiSnakes.filter(s => s.isAlive);
    
    // Update camera position
    updateCamera();
}

function draw() {
    const { ctx, camera, player, sparks, particles, aiSnakes } = state;

    ctx.save();
    ctx.clearRect(0, 0, camera.width, camera.height);

    // Apply camera zoom and translation
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // Draw Background
    drawBackground(ctx);

    // Draw Game Objects
    sparks.forEach(s => s.draw(ctx));
    aiSnakes.forEach(s => s.draw(ctx));
    player.draw(ctx);
    particles.forEach(p => p.draw(ctx));

    ctx.restore();

    // Draw UI (Score, etc.) - This is drawn without camera transforms
    ctx.fillStyle = 'white';
    ctx.font = '24px "Cormorant Garamond"';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 5;
    ctx.fillText(`Score: ${state.score}`, 20, 40);
    ctx.shadowBlur = 0;
}




function drawBackground(ctx) {
    // Base color
    ctx.fillStyle = '#2a5c2a'; // A dark grass green
    ctx.fillRect(0, 0, state.world.width, state.world.height);

    // Stripes
    state.world.backgroundStripes.forEach(stripe => {
        ctx.fillStyle = stripe.color;
        ctx.fillRect(0, stripe.y, state.world.width, stripe.height);
    });

    // Emojis - Using Array.from to ensure they render correctly
    ctx.font = '30px sans-serif'; 
    state.world.backgroundEmojis.forEach(emoji => {
        ctx.fillText(emoji.char, emoji.x, emoji.y);
    });
    
    // Border
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.5)'; // Brown, semi-transparent
    ctx.lineWidth = 40; // A thick border
    ctx.strokeRect(20, 20, state.world.width - 40, state.world.height - 40);

}






function gameOver() {
    state.isRunning = false;
    self.postMessage({ type: 'gameover', finalScore: state.score });
}

function spawnSpark() {
    const spark = new Spark(
        Math.random() * (state.world.width - 100) + 50,
        Math.random() * (state.world.height - 100) + 50
    );
    state.sparks.push(spark);
}

function spawnAiSnake() {
    const snake = new AiSnake(
        Math.random() * state.world.width,
        Math.random() * state.world.height,
        Math.floor(Math.random() * 15) + (5 * state.level), // Gets longer at higher levels
        `hsl(${Math.random() * 360}, 70%, 50%)` // Random color
    );
    state.aiSnakes.push(snake);
}


function updateTimers() {
    // Spawn more sparks if needed
    state.sparkTimer++;
    if (state.sparkTimer > 50 && state.sparks.length < 400) {
        state.sparkTimer = 0;
        spawnSpark();
    }

    // Spawn more AI snakes as the game progresses
    state.aiSnakeTimer++;
    const requiredSnakes = 5 + state.level * 2;
    if (state.aiSnakeTimer > 400 && state.aiSnakes.length < requiredSnakes) {
        state.aiSnakeTimer = 0;
        spawnAiSnake();
        state.level++; // Increase level when a new snake spawns
    }
}

function checkCollisions() {
    const { player, sparks, aiSnakes } = state;
    const playerHead = { x: player.x, y: player.y, size: player.size };

    // Player head with sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        if (getDistance(playerHead.x, playerHead.y, spark.x, spark.y) < playerHead.size + spark.size) {
            sparks.splice(i, 1);
            state.score += 10;
            player.grow(1);
            self.postMessage({ type: 'playSound', name: 'collect' });
            
            for (let p = 0; p < 5; p++) {
                state.particles.push(new Particle(spark.x, spark.y, 'gold'));
            }
        }
    }

    // Player interactions with AI snakes
    for (const enemy of aiSnakes) {
        if (!enemy.isAlive) continue;

        // Player hits enemy head -> enemy dies
        if (getDistance(playerHead.x, playerHead.y, enemy.x, enemy.y) < playerHead.size + enemy.size) {
            enemy.die(); 
            state.score += 100;
            self.postMessage({ type: 'playSound', name: 'hit' });
        } else {
            // Player hits enemy body -> game over
            for (let i = 1; i < enemy.body.length; i++) {
                const seg = enemy.body[i];
                 if (getDistance(playerHead.x, playerHead.y, seg.x, seg.y) < playerHead.size) {
                    gameOver();
                    return;
                }
            }
        }
    }
    
    // AI snake head with sparks
    for (const snake of aiSnakes) {
        for (let i = sparks.length - 1; i >= 0; i--) {
            const spark = sparks[i];
            if (getDistance(snake.x, snake.y, spark.x, spark.y) < snake.size + spark.size) {
                sparks.splice(i, 1);
                snake.grow(1);
            }
        }
    }
}