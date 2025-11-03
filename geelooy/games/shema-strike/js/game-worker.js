//B"H

// Shema Strike - Game Worker
// This script runs on a separate thread from the main UI thread.
// Its purpose is to handle all heavy game logic and rendering to prevent
// the main thread from freezing, ensuring a smooth and responsive user experience.

// ==================================
// 1. SCRIPT IMPORTS
// ==================================
// Since workers run in a separate global scope, they don't have access to scripts
// loaded in the main HTML file. We must explicitly import every dependency.
// The order matters if scripts depend on each other (e.g., Player depends on World).
importScripts(
    'utils.js',       // Helper functions (math, collision, etc.)
    'particle.js',    // Particle effects classes
    'healthPacket.js',// Health pickup class
    'ui.js',          // UI rendering class
    'world.js',       // Game world, background, and environment
    'enemy.js',       // Enemy class and logic
    'player.js'       // Player class and logic
);

// ==================================
// 2. WORKER-SCOPE GLOBAL VARIABLES
// ==================================
// These variables hold the state of the game within the worker.

// --- Core Worker State ---
let canvas; // The OffscreenCanvas object transferred from the main thread.
let ctx;    // The 2D rendering context for the offscreen canvas.
let gameRunning = false; // A boolean flag to control the game loop's execution.

// --- Player Controls State ---
// This is a simple object that gets continuously updated with the latest
// input state from the main thread via postMessage.
let controlsState = {
    left: false,
    right: false,
    jump: false,
    strike: false,        // Is the strike button currently held down?
    strikePressed: false  // Was the strike button just pressed this frame? (for single actions)
};


// --- Game State & Objects ---
// These are declared here and will be properly initialized in the `initializeGame` function.
let world, player, ui;
let enemies, particles, healthPackets;
let wave, waveCooldown, cameraX;
const zoomLevel = 0.8; // Defines the default camera zoom.

// ==================================
// 3. INITIALIZATION
// ==================================
/**
 * Sets up the entire game environment. This function is called once when the worker
 * receives the 'init' message from the main thread.
 * @param {OffscreenCanvas} offscreenCanvas The canvas element transferred from the main thread.
 */
function initializeGame(offscreenCanvas) {
    canvas = offscreenCanvas;
    ctx = canvas.getContext('2d');

    // Reset all game state variables to their default start values.
    gameRunning = false;
    enemies = [];
    particles = [];
    healthPackets = [];
    wave = 0;
    waveCooldown = 180; // Cooldown frames before the next wave spawns.
    cameraX = 0;

    // Instantiate all the major game components.
    world = new World(canvas);
    // The Player class is given the 'controlsState' object directly. It will read
    // from this object on every update to determine its actions.
    player = new Player(canvas, controlsState, world);
    ui = new UI(canvas);

    console.log('Worker Initialized and Game Ready');

    // Start the game loop. It won't do much until `gameRunning` is set to true.
    gameLoop();
}


// ==================================
// 4. CORE GAME LOGIC
// ==================================
/**
 * Spawns a new wave of enemies.
 * Logic includes increasing difficulty and spawning enemies just off-screen.
 */
function spawnWave() {
    wave++;
    ui.updateWave(wave);
    const numEnemies = 2 + Math.floor(wave * 1.5); // Difficulty scaling.

    for (let i = 0; i < numEnemies; i++) {
        // Stagger the spawning of enemies for a better gameplay feel.
        setTimeout(() => {
            if (!gameRunning) return; // Don't spawn if the game has stopped.

            const spawnEdgeBuffer = 100; // How far off-screen to spawn.
            const visibleWidth = canvas.width / zoomLevel;

            // Randomly choose to spawn on the left or right side of the camera's view.
            let spawnX;
            if (Math.random() < 0.5) {
                spawnX = cameraX - spawnEdgeBuffer; // Left side
            } else {
                spawnX = cameraX + visibleWidth + spawnEdgeBuffer; // Right side
            }

            // Clamp the spawn position to be within the world boundaries.
            spawnX = Math.max(50, Math.min(spawnX, world.width - 50));

            enemies.push(new Enemy(canvas, player, world, spawnX));
        }, i * 500); // 500ms delay between each enemy in the wave.
    }
}

/**
 * The main game loop, powered by requestAnimationFrame.
 * This function is the engine of the game, responsible for updating state and
 * rendering the scene on every frame.
 */
function gameLoop() {
    // If the game isn't running, we still keep the loop alive with requestAnimationFrame,
    // but we skip all the logic and rendering. This is more efficient than
    // starting/stopping the loop completely.
    if (!gameRunning) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // --- Game Over Condition ---
    if (player.health <= 0) {
        gameRunning = false;
        // Send a message back to the main thread to inform it that the game is over,
        // so it can display the game over screen.
        self.postMessage({ type: 'gameOver' });
        return; // Stop the loop's execution for this frame.
    }

    // --- (A) UPDATE LOGIC ---
    // All game state calculations happen here, before any drawing.

    // Smoothly update camera position to follow the player.
    const targetCameraX = player.x - (canvas.width / 2) / zoomLevel;
    cameraX += (targetCameraX - cameraX) * 0.1; // "Lerping" for smooth camera motion.
    const visibleWidth = canvas.width / zoomLevel;
    // Clamp camera position to the world boundaries.
    cameraX = Math.max(0, Math.min(world.width - visibleWidth, cameraX));

    // Update all game objects.
    world.update();
    player.update(particles);

    // Process enemy logic and interactions.
    const attackHitbox = player.getAttackHitbox();
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        // Check for collision between player's attack and the enemy.
        if (attackHitbox && isColliding(attackHitbox, enemy.getBoundingBox())) {
            enemy.takeDamage(player.attackDamage, particles);
        }

        // Handle enemy death.
        if (enemy.health <= 0) {
            for (let i = 0; i < 10; i++) particles.push(new Particle(enemy.x, enemy.y, getRandomFrom(HEBREW_LETTERS), Math.random() * 20 + 15, 80));
            triggerScreenShake(15, 10);
            ui.updateScore(enemy.perutas);
            if (Math.random() < 0.35) healthPackets.push(new HealthPacket(enemy.x, enemy.y, world));
            enemies.splice(enemyIndex, 1); // Remove dead enemy from the array.
        }
    });

    // Process health packets.
    healthPackets.forEach((packet, index) => {
        packet.update();
        if (isColliding(player.getBoundingBox(), packet.getBoundingBox())) {
            player.heal(packet.healAmount);
            healthPackets.splice(index, 1);
        } else if (packet.life <= 0) {
            healthPackets.splice(index, 1); // Remove expired packets.
        }
    });

    // Update and clean up particles.
    particles.forEach((p, index) => {
        p.update();
        if (p.life <= 0) {
            particles.splice(index, 1);
        }
    });

    // Check for wave completion and start the cooldown for the next wave.
    if (enemies.length === 0) {
        waveCooldown--;
        if (waveCooldown <= 0) {
            spawnWave();
            waveCooldown = 180; // Reset cooldown.
        }
    }

    // --- (B) DRAWING LOGIC ---
    // After all states are updated, draw everything to the canvas.

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas for the new frame.
    ctx.save(); // Save the default context state.

    // Apply camera transformations (zoom and translation).
    // All subsequent drawing calls will be affected by this, creating the camera effect.
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-cameraX, 0);

    // Apply screen shake effect if active.
    updateScreenShake(ctx);

    // --- Draw Game Layers (Order is important for correct layering) ---
    world.draw(ctx);          // 1. Background and ground
    healthPackets.forEach(p => p.draw(ctx)); // 2. Pickups
    enemies.forEach(e => e.draw(ctx));       // 3. Enemies
    player.draw(ctx);         // 4. Player
    particles.forEach(p => p.draw(ctx));   // 5. Effects (on top of everything)

    ctx.restore(); // Restore the context to its state before camera transforms.

    // --- Draw UI ---
    // The UI is drawn last and without camera transformations so it stays fixed on the screen.
    ui.draw(ctx, player);

    // --- Finalization ---
    // After processing this frame's input, reset the "pressed" state for the next frame.
    controlsState.strikePressed = false;
    // Queue the next frame.
    requestAnimationFrame(gameLoop);
}

// ==================================
// 5. MESSAGE HANDLER
// ==================================
// This is the entry point for all communication from the main thread to the worker.
self.onmessage = function(e) {
    const { type, payload } = e.data;

    // A switch statement to handle different types of commands.
    switch (type) {
        // 'init': Received once to set up the game with the canvas.
        case 'init':
            initializeGame(payload.canvas);
            break;

        // 'start': Received when the player clicks the start button.
        case 'start':
            if (!gameRunning) {
                gameRunning = true;
                spawnWave();
            }
            break;

        // 'controls': Received on every frame from the main thread, providing the latest input.
        case 'controls':
            Object.assign(controlsState, payload.controls);
            break;

        // 'resize': Received when the browser window is resized.
        case 'resize':
            if (canvas) {
                canvas.width = payload.width;
                canvas.height = payload.height;
                if(world) world.height = payload.height;
            }
            break;
    }
};