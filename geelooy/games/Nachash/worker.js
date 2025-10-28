//B"H
//file worker.js
importScripts('worker-helpers.js');

const state = {
    // Game State
    isRunning: false,
    score: 0,
    level: 1,
    playerName: "Nachash HaKadmoni",
    scoreboard: [],
    // --- CORE PERFORMANCE: The Spatial Grid ---
    grid: null,
    backgroundCanvas: null,
    // World & Camera
    world: {
        width: 8000,
        height: 8000
    },
    camera: {
        x: 0, y: 0, width: 0, height: 0, zoom: 0.8
    },
    
    backgroundPattern: null,
    // Canvas & Rendering
    canvas: null, ctx: null, pixelRatio: 1,
    screenFlash: { alpha: 0, duration: 0 },
    // Game Objects
    player: null,
    collectibles: [],
    particles: [],
    aiSnakes: [],
    lightningEffects: [],
    // Timers
    collectibleTimer: 0,
    aiSnakeTimer: 0,
    scoreboardUpdateTimer: 0,
};

const particlePool = new ObjectPool(() => new Particle(), 1000);

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
    state.grid = new SpatialGrid(state.world.width, state.world.height, 250); // Cell size of 250
    resize(width, height, pixelRatio);
    self.postMessage({ type: 'initialized' });
}

function resize(width, height, pixelRatio) {
    state.camera.width = width;
    state.camera.height = height;
    state.pixelRatio = pixelRatio;
    state.canvas.width = width * pixelRatio;
    state.canvas.height = height * pixelRatio;
    state.ctx.scale(pixelRatio, pixelRatio);
}




// Replace your entire start function with this:
function start() {
    Object.assign(state, {
        score: 0, level: 1, collectibles: [], particles: [], aiSnakes: [],
        lightningEffects: [], isRunning: true, scoreboard: []
    });
    particlePool.reset();

    
    
    state.player = new Player(state.world.width / 2, state.world.height / 2, 20);
    state.scoreboard = [{ name: state.playerName, score: state.player.score }];
    
    const { camera, player } = state;
    camera.x = player.x - (camera.width / 2 / camera.zoom);
    camera.y = player.y - (camera.height / 2 / camera.zoom);

    for (let i = 0; i < 1000; i++) spawnCollectible();
    for (let i = 0; i < 150; i++) spawnAiSnake(); // Increased initial snakes
    
    gameLoop();
}
//B"H
//B"H
// In worker.js - Replace your entire `draw` function with this definitive version.

function draw() {
    const { ctx, camera, world } = state;

    // --- SCREEN FILL ---
    // Fill the screen with the base color first. This prevents any flickering or black voids.
    ctx.fillStyle = '#1d221d';
    ctx.fillRect(0, 0, camera.width, camera.height);

    // Save the canvas state before applying camera transformations.
    ctx.save();

    // --- WORLD RENDERING (Everything that moves) ---
    // Apply the camera's zoom and pan.
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // --- THE LIGHTNING-FAST, CORRECTLY CALCULATED GRID ---

    // 1. Define the exact boundaries of the visible world area.
    const viewLeft = camera.x;
    const viewTop = camera.y;
    const viewRight = camera.x + (camera.width / camera.zoom);
    const viewBottom = camera.y + (camera.height / camera.zoom);

    const gridSize = 50;
    ctx.strokeStyle = "rgba(255, 255, 255, 255)";
    ctx.lineWidth = 1;

    // 2. Calculate the start and end grid lines based on the view boundaries.
    // This math is simple and direct, avoiding all previous errors.
    const startX = Math.floor(viewLeft / gridSize) * gridSize;
    const endX = Math.ceil(viewRight / gridSize) * gridSize;
    const startY = Math.floor(viewTop / gridSize) * gridSize;
    const endY = Math.ceil(viewBottom / gridSize) * gridSize;

    ctx.beginPath();
    // 3. Draw only the handful of lines that are actually inside the view.
    // This is what makes it lightning-fast.
    for (let x = startX; x < endX; x += gridSize) {
        ctx.moveTo(x, viewTop);
        ctx.lineTo(x, viewBottom);
    }
    for (let y = startY; y < endY; y += gridSize) {
        ctx.moveTo(viewLeft, y);
        ctx.lineTo(viewRight, y);
    }
    ctx.stroke();

    // 4. Draw all game objects (snakes, food) on top of the grid.
    drawWorld(ctx);

    // 5. Draw the world border.
    ctx.strokeStyle = '#241a0c';
    ctx.lineWidth = 40;
    ctx.strokeRect(20, 20, world.width - 40, world.height - 40);

    // --- UI RENDERING (Fixed on screen) ---
    // Restore the canvas to its original state (no camera transformations).
    ctx.restore();

    // Draw the UI on top of everything.
    drawUI(ctx);
}
//B"H
// In worker.js - Replace the existing updateCamera function with this one.

function updateCamera() {
    const { camera, player } = state;

    // --- Camera Logic with Sanity Checks ---
    // If the player object is invalid for any reason, stop to prevent errors.
    if (!player || isNaN(player.x) || isNaN(player.y)) {
        return;
    }

    const lengthBonus = Math.max(1, player.maxLength / 150);
    let targetZoom = 0.8 / lengthBonus;

    // --- Sanity Check 1: Prevent zoom from ever becoming NaN, zero, or negative ---
    if (isNaN(targetZoom) || targetZoom <= 0.01) {
        targetZoom = 0.01;
    }
    camera.zoom += (targetZoom - camera.zoom) * 0.02;
    if (isNaN(camera.zoom) || camera.zoom <= 0.01) {
        camera.zoom = 0.01;
    }


    // --- Sanity Check 2: Calculate target position and ensure it's valid ---
    const zoom = camera.zoom;
    const targetX = player.x - (camera.width / 2 / zoom);
    const targetY = player.y - (camera.height / 2 / zoom);

    // If the calculation results in an invalid number, do not update the camera's position this frame.
    if (isNaN(targetX) || isNaN(targetY)) {
        console.error("B'H - Camera target became NaN. Skipping camera position update for this frame.");
        return;
    }

    camera.x += (targetX - camera.x) * 0.1;
    camera.y += (targetY - camera.y) * 0.1;

    // --- Final Sanity Check: If the position still becomes invalid, force a reset.
    if (isNaN(camera.x) || isNaN(camera.y)) {
       console.error("B'H - Camera position became NaN. Forcing a reset.");
       camera.x = targetX;
       camera.y = targetY;
    }
}





// In Worker.js
let lastTime = 0; // Add this line right before gameLoop

 

function gameLoop(currentTime) {
    // --- THE CRITICAL FIX IS HERE ---
    // If the browser hasn't provided a valid timestamp, simply skip this frame.
    // This prevents the entire simulation from being corrupted by a NaN value.
    if (typeof currentTime !== 'number' || currentTime <= 0) {
        requestAnimationFrame(gameLoop);
        return; 
    }
    // --- END FIX ---

    if (!state.isRunning) return;

    if (!lastTime) {
        lastTime = currentTime;
    }

    // Now, deltaTime calculation is guaranteed to be safe.
    let deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Additional safety: cap deltaTime to prevent physics explosions if the tab is inactive for a long time.
    if (deltaTime > 0.1) {
        deltaTime = 0.1; 
    }

    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}



function update(deltaTime) {
    // --- PERFORMANCE: Update grid with dynamic objects ---
    state.grid.clear();
    state.grid.insert(state.player);
    state.aiSnakes.forEach(s => state.grid.insert(s));
    state.collectibles.forEach(c => state.grid.insert(c));

    // --- FIX: Ensure player update is always called ---
    // --- Pass deltaTime down to all game objects ---
    state.player.update(deltaTime);
    state.aiSnakes.forEach(s => {
        if (s.isAlive) s.update(deltaTime);
    });
    
    state.particles.forEach(p => p.update(deltaTime));
    state.lightningEffects.forEach(l => l.update(deltaTime));

    checkCollisionsWithGrid();
    updateTimers(deltaTime); // Also pass to timers

    // Cleanup dead objects
    state.particles = state.particles.filter(p => p.isActive);
    state.aiSnakes = state.aiSnakes.filter(s => s.isAlive);
    state.lightningEffects = state.lightningEffects.filter(l => l.life > 0);
    
    // Update camera AFTER player has moved
    updateCamera();
}

// In Worker.js






function gameOver() {
    state.isRunning = false;
    self.postMessage({ type: 'gameover', finalScore: state.score });
}

function spawnCollectible() {
    state.collectibles.push(new Collectible(
        Math.random() * (state.world.width - 100) + 50,
        Math.random() * (state.world.height - 100) + 50
    ));
}

function spawnAiSnake() {
    state.aiSnakes.push(new AiSnake(
        Math.random() * state.world.width,
        Math.random() * state.world.height,
        Math.floor(Math.random() * 20) + 10 + state.level,
    ));
}

// In Worker.js
function updateTimers(deltaTime) { // Add deltaTime
    // Note: Timers are now floats, not integers.
    state.collectibleTimer += deltaTime;
    if (state.collectibleTimer > 0.1 && state.collectibles.length < 2000) { // 0.1 seconds
        spawnCollectible();
        state.collectibleTimer = 0;
    }

    state.aiSnakeTimer += deltaTime;
    const maxSnakes = 165 + state.level * 13;
    if (state.aiSnakeTimer > 2.3 && state.aiSnakes.length < maxSnakes) { // 2.5 seconds
        spawnAiSnake();
        state.aiSnakeTimer = 0;
        state.level++;
    }

    state.scoreboardUpdateTimer += deltaTime;
    if (state.scoreboardUpdateTimer > 1) { // 1 second
        updateScoreboard();
        state.scoreboardUpdateTimer = 0;
    }
}

function checkCollisionsWithGrid() {
    const playerAndSnakes = [state.player, ...state.aiSnakes];

    for (const snake of playerAndSnakes) {
        if (!snake.isAlive) continue;
        
        const nearbyObjects = state.grid.getNearbyObjects(snake);

        for (const target of nearbyObjects) {
            // Snake collecting food
            if (target.type === 'collectible' && getDistance(snake.x, snake.y, target.x, target.y) < snake.size + target.size) {
                target.isAlive = false; // Mark for removal
                snake.grow(1);
                snake.score += 10;
                // Player-specific effects
                if (snake.type === 'player') {
                     for (let p = 0; p < 8; p++) {
                        particlePool.get().init(target.x, target.y);
                        state.particles.push(particlePool.last);
                    }
                }
            }
            
            // Snake vs Snake collision
            if (target.type === 'player' || target.type === 'ai_snake') {
                if (snake === target) continue; // Don't check against self

                // Head-on-head collision
                if (getDistance(snake.x, snake.y, target.x, target.y) < snake.size + target.size) {
                    const biggerSnake = snake.score >= target.score ? snake : target;
                    const smallerSnake = snake.score < target.score ? snake : target;
                    
                    if (!smallerSnake.isInvincible) {
                        smallerSnake.die();
                        biggerSnake.score += smallerSnake.score / 2;
                        state.lightningEffects.push(new Lightning(snake.x, snake.y, target.x, target.y));
                       
                    }
                } 
                // Head-to-body collision
                else if (!target.isInvincible) {
                     for (const seg of target.body) {
                        if (getDistance(snake.x, snake.y, seg.x, seg.y) < snake.size) {
                            snake.die();
                            target.score += snake.score / 2;
                            break; // Stop checking this snake's body
                        }
                    }
                }
            }
        }
    }
    // Efficiently remove dead collectibles
    state.collectibles = state.collectibles.filter(c => c.isAlive);
}

// --- UI Management ---
function updateScoreboard() {
    const allSnakes = [{ name: state.playerName, score: state.player.score }, ...state.aiSnakes];
    state.scoreboard = allSnakes.sort((a, b) => b.score - a.score).slice(0, 5); // Top 5
}

function drawUI(ctx) {
    // --- Scoreboard ---
    ctx.font = '20px "Cormorant Garamond"';
    
    // Draw a semi-transparent background for better readability
    const scoreboardHeight = 30 * state.scoreboard.length + 15;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(10, 5, state.camera.width - 20, scoreboardHeight);

    state.scoreboard.forEach((entry, i) => {
        // Use a fixed Y position for each entry
        const yPos = 30 + (i * 30); 
        
        // Highlight the player's name
        ctx.fillStyle = entry.name === state.playerName ? 'yellow' : 'white';
        
        // Draw Rank and Name (aligned left)
        ctx.textAlign = 'left';
        ctx.fillText(`${i + 1}. ${entry.name}`, 20, yPos);
        
        // Draw Score (aligned right)
        ctx.textAlign = 'right';
        ctx.fillText(Math.floor(entry.score), state.camera.width - 20, yPos);
    });
    
    // Reset alignment for other UI elements
    ctx.textAlign = 'left'; 

    // --- Player Name (bottom left) ---
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '18px "Cormorant Garamond"';
    ctx.fillText(state.playerName, 10, state.camera.height - 10);
    
    // --- Minimap (bottom right) ---
    drawMinimap(ctx);
}