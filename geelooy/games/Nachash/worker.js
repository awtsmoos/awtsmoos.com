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
}

function resize(width, height, pixelRatio) {
    state.camera.width = width;
    state.camera.height = height;
    state.pixelRatio = pixelRatio;
    state.canvas.width = width * pixelRatio;
    state.canvas.height = height * pixelRatio;
    state.ctx.scale(pixelRatio, pixelRatio);
}

// In Worker.js

function start() {
    Object.assign(state, {
        score: 0, level: 1, collectibles: [], particles: [], aiSnakes: [],
        lightningEffects: [], isRunning: true, scoreboard: []
    });
    particlePool.reset();

    if (!state.backgroundCanvas) {
        state.backgroundCanvas = new OffscreenCanvas(state.world.width, state.world.height);
        preRenderBackground(state.backgroundCanvas.getContext('2d'));
    }
    
    state.player = new Player(state.world.width / 2, state.world.height / 2, 20);

    // --- ADD THIS LINE TO FIX THE SCOREBOARD ---
    state.scoreboard = [{ name: state.playerName, score: state.player.score }];
    
    const { camera, player } = state;
    camera.x = player.x - (camera.width / 2 / camera.zoom);
    camera.y = player.y - (camera.height / 2 / camera.zoom);

    for (let i = 0; i < 1000; i++) spawnCollectible();
    for (let i = 0; i < 100; i++) spawnAiSnake();
    
    gameLoop();
}

function updateCamera() {
    const { camera, player } = state;
    
    // Calculate the desired zoom level based on snake length
    const lengthBonus = Math.max(1, player.maxLength / 150);
    const targetZoom = 0.8 / lengthBonus;
    
    // Smoothly interpolate the zoom for a nice effect
    camera.zoom += (targetZoom - camera.zoom) * 0.02;

    // --- FIX: Robust camera follow logic ---
    // Calculate the camera's target position to keep the player centered
    const targetX = player.x - (camera.width / 2 / camera.zoom);
    const targetY = player.y - (camera.height / 2 / camera.zoom);

    // Smoothly move the camera towards the target position every frame
    camera.x += (targetX - camera.x) * 0.1; // The interpolation factor (0.1) controls follow speed
    camera.y += (targetY - camera.y) * 0.1;
}





function gameLoop() {
    if (!state.isRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}



function update() {
    // --- PERFORMANCE: Update grid with dynamic objects ---
    state.grid.clear();
    state.grid.insert(state.player);
    state.aiSnakes.forEach(s => state.grid.insert(s));
    state.collectibles.forEach(c => state.grid.insert(c));

    // --- FIX: Ensure player update is always called ---
    state.player.update();
    state.aiSnakes.forEach(s => {
        if (s.isAlive) s.update();
    });
    
    // Update effects
    state.particles.forEach(p => p.update());
    state.lightningEffects.forEach(l => l.update());

    checkCollisionsWithGrid();
    updateTimers();

    // Cleanup dead objects
    state.particles = state.particles.filter(p => p.isActive);
    state.aiSnakes = state.aiSnakes.filter(s => s.isAlive);
    state.lightningEffects = state.lightningEffects.filter(l => l.life > 0);
    
    // Update camera AFTER player has moved
    updateCamera();
}

// In Worker.js

function draw() {
    const { ctx, camera, backgroundCanvas } = state;

    // 1. Manually clear the canvas to our base color. This fixes the "black screen" issue.
    ctx.fillStyle = '#050805';
    ctx.fillRect(0, 0, camera.width, camera.height);

    // 2. Draw the visible portion of the pre-rendered background directly onto the canvas.
    //    We do this here to guarantee it works and happens at the right time.
    if (backgroundCanvas) {
        const viewWidth = camera.width / camera.zoom;
        const viewHeight = camera.height / camera.zoom;
        ctx.drawImage(
            backgroundCanvas,
            camera.x, camera.y, viewWidth, viewHeight, // Source rectangle from our big texture
            0, 0, camera.width, camera.height         // Destination rectangle (the whole screen)
        );
    }

    // 3. Save the current state, and then apply the camera zoom and pan
    //    to prepare for drawing the game world objects.
    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // 4. Draw all the snakes, food, particles, etc.
    drawWorld(ctx);

    // 5. Restore the context, removing the camera pan/zoom.
    ctx.restore();

    // 6. Draw the UI (scoreboard, minimap) on top of everything else.
    drawUI(ctx);
}




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

function updateTimers() {
    state.collectibleTimer++;
    if (state.collectibleTimer > 10 && state.collectibles.length < 2000) {
        spawnCollectible();
        state.collectibleTimer = 0;
    }

    state.aiSnakeTimer++;
    const maxSnakes = 145 + state.level * 13;
    if (state.aiSnakeTimer > 1500 && state.aiSnakes.length < maxSnakes) {
        spawnAiSnake();
        state.aiSnakeTimer = 0;
        state.level++;
    }

    state.scoreboardUpdateTimer++;
    if (state.scoreboardUpdateTimer > 60) { // Update scoreboard every second
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