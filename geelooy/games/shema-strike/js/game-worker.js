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



// B"H

// --- OPTIMIZATION 2: PARTICLE OBJECT POOL ---
class ParticleSystem {
    constructor(maxParticles = 500) {
        this.pool = [];
        for (let i = 0; i < maxParticles; i++) {
            this.pool.push(new Particle(0,0,'',0,0)); // Create generic particles
        }
        this.activeIndex = 0;
    }

    spawn(type, x, y, options = {}) {
        // Find the next available particle in the pool
        const p = this.pool[this.activeIndex];
        
        // Re-initialize it based on the desired type
        p.life = p.initialLife = 60; // Default life
        p.x = x;
        p.y = y;

        if (type === 'hebrewLetter') {
            p.text = getRandomFrom(HEBREW_LETTERS);
            p.size = Math.random() * 20 + 15;
            p.life = p.initialLife = 80;
            p.vx = (Math.random() - 0.5) * 6;
            p.vy = -Math.random() * 8 - 4;
            p.gravity = 0.3;
            p.updateFn = p.updateMovement;
            p.drawFn = p.drawText;
        } else if (type === 'damageText') {
            p.damage = options.damage;
            p.gematria = toGematria(p.damage);
            p.vy = -2;
            p.updateFn = p.updateDamageText;
            p.drawFn = p.drawDamageText;
        } else if (type === 'hitSpark') {
            p.size = 60;
            p.life = p.initialLife = 10;
            p.updateFn = p.updateHitSpark;
            p.drawFn = p.drawHitSpark;
        }
        
        // Move to the next particle in the pool, wrapping around if necessary
        this.activeIndex = (this.activeIndex + 1) % this.pool.length;
    }

    update() {
        for (const p of this.pool) {
            if (p.life > 0) {
                p.updateFn();
            }
        }
    }

    draw(ctx) {
        ctx.save();
        for (const p of this.pool) {
            if (p.life > 0) {
                p.drawFn(ctx);
            }
        }
        ctx.restore();
    }
}
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
let world, player, ui, particleSystem;
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
    
    particleSystem = new ParticleSystem();

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
// B"H

function gameLoop() {
    // Frame exit condition: If game isn't running, just queue the next frame and do nothing.
    if (!gameRunning) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // Game over condition: Stop all logic and rendering, notify the main thread.
    if (player.health <= 0) {
        gameRunning = false;
        self.postMessage({ type: 'gameOver' });
        return; // Halt execution for this frame.
    }

    // =================================================================
    //  STAGE 1: STATE UPDATES & PRE-CALCULATIONS
    // =================================================================
    // All state changes happen here before any processing or drawing.

    // Update core objects that always need updating.
    world.update();
    player.update(particleSystem);
    particleSystem.update(); // Update all active particles in the pool.

    // Calculate camera and view boundaries once for the entire frame.
    // This is much faster than recalculating it inside different loops.
    const zoomInv = 1.0 / zoomLevel; // Use multiplication instead of division in loops.
    const targetCameraX = player.x - (canvas.width / 2) * zoomInv;
    cameraX += (targetCameraX - cameraX) * 0.1; // Smooth camera lerp

    const visibleWidth = canvas.width * zoomInv;
    cameraX = Math.max(0, Math.min(world.width - visibleWidth, cameraX));

    // Define the "active zone" for culling. Objects outside this zone won't be updated or drawn.
    // The buffer prevents objects from suddenly popping in/out at the screen edge.
    const cullBuffer = 200;
    const viewLeft = cameraX - cullBuffer;
    const viewRight = cameraX + visibleWidth + cullBuffer;

    // Get the player's hitboxes once. If attackHitbox is null, no attack is happening.
    const attackHitbox = player.getAttackHitbox();
    const playerHitbox = player.getBoundingBox();


    // =================================================================
    //  STAGE 2: GAME LOGIC & COLLISION (THE HEAVY LIFTING)
    // =================================================================
    // Use highly efficient loops and filtering. We build new arrays of
    // "living" objects instead of using slow `splice()` calls.

    // --- Process Enemies ---
    const livingEnemies = [];
    for (const enemy of enemies) {
        let isAlive = true;

        // CULLING: Only process logic for enemies within the active zone.
        if (enemy.x + enemy.size > viewLeft && enemy.x - enemy.size < viewRight) {
            enemy.update();

            // Check for collision with player's attack.
            if (attackHitbox && isColliding(attackHitbox, enemy.getBoundingBox())) {
                enemy.takeDamage(player.attackDamage, particleSystem);
            }
        }

        // Death check is cheap and runs for all enemies, on or off-screen.
        if (enemy.health <= 0) {
            isAlive = false;
            // Spawn death effects using the object pool.
            for (let i = 0; i < 10; i++) {
                particleSystem.spawn('hebrewLetter', enemy.x, enemy.y);
            }
            triggerScreenShake(15, 10);
            ui.updateScore(enemy.perutas);
            // 35% chance to drop a health packet.
            if (Math.random() < 0.35) {
                healthPackets.push(new HealthPacket(enemy.x, enemy.y, world));
            }
        }

        if (isAlive) {
            livingEnemies.push(enemy);
        }
    }
    enemies = livingEnemies; // The old 'enemies' array is garbage collected.

    // --- Process Health Packets ---
    const activeHealthPackets = [];
    for (const packet of healthPackets) {
        packet.update(); // Update is cheap (bobbing effect).
        
        let collected = false;
        // Only check collision for visible packets to save processing.
        if (packet.x > viewLeft && packet.x < viewRight) {
            if (isColliding(playerHitbox, packet.getBoundingBox())) {
                player.heal(packet.healAmount);
                collected = true;
            }
        }
        
        // Keep the packet if it hasn't expired and wasn't collected.
        if (packet.life > 0 && !collected) {
            activeHealthPackets.push(packet);
        }
    }
    healthPackets = activeHealthPackets;


    // =================================================================
    //  STAGE 3: WAVE MANAGEMENT
    // =================================================================

    if (enemies.length === 0) {
        waveCooldown--;
        if (waveCooldown <= 0) {
            spawnWave();
            waveCooldown = 180; // Reset cooldown for next wave.
        }
    }


    // =================================================================
    //  STAGE 4: RENDERING
    // =================================================================
    // Draw everything to the offscreen canvas.

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Apply global camera transformations (zoom, pan, screenshake).
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-cameraX, 0);
    updateScreenShake(ctx); // Apply screen shake translation if active.

    // --- Draw Game Layers in Order (Back to Front) ---
    world.draw(ctx);

    for (const packet of healthPackets) { packet.draw(ctx); }

    // RENDER CULLING: Only draw enemies actually inside the camera's final view.
    const drawViewLeft = cameraX;
    const drawViewRight = cameraX + visibleWidth;
    for (const enemy of enemies) {
        if (enemy.x + enemy.size > drawViewLeft && enemy.x - enemy.size < drawViewRight) {
            enemy.draw(ctx);
        }
    }
    
    player.draw(ctx); // Player is always drawn.
    particleSystem.draw(ctx); // The particle system handles its own efficient drawing.

    // Restore context to pre-camera state to draw the UI.
    ctx.restore();

    // Draw UI on top of everything, with no camera transformations.
    ui.draw(ctx, player);


    // =================================================================
    //  STAGE 5: FRAME CLEANUP
    // =================================================================

    // Reset one-time press flags.
    controlsState.strikePressed = false;
    
    // Request the next animation frame to continue the loop.
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