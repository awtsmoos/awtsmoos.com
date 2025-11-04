// B"H - A script focused on reliable, direct event handling.
console.log('B"H - Script Initializing.');

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ELEMENT REFERENCES & STATE ---
    const menuContainer = document.getElementById('menu-container'); // Assuming you add this container in your HTML
    const playButton = document.getElementById('playButton');
    const highScoreDisplay = document.getElementById('highScoreDisplay');
    
    let gameCanvas = null;
    let gameWorker = null;
    
    // --- 2. MANAGERS (NO CHANGES) ---
    const audioManager = { /* ... */ context: null, isMuted: false, sounds: {}, hasBeenInitialized: false, init() { if (this.hasBeenInitialized) return; this.hasBeenInitialized = true; try { this.context = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { console.error("Web Audio API not supported"); return; } this.sounds = { collect: { f: 880, d: 0.1, t: 'triangle', v: 0.3 }, hit: { f: 120, d: 0.4, t: 'sawtooth', v: 0.6 }, chainBreak: { f: 200, d: 0.2, t: 'square', v: 0.4 }, skillUp: { f: 1500, d: 0.2, t: 'sine', v: 0.5 } }; }, play(name, opts = {}) { if (!this.context || this.isMuted || !this.sounds[name]) return; const s = this.sounds[name]; const osc = this.context.createOscillator(); const gain = this.context.createGain(); osc.type = s.t; osc.frequency.setValueAtTime(opts.pitch || s.f, this.context.currentTime); gain.gain.setValueAtTime(s.v, this.context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + s.d); osc.connect(gain); gain.connect(this.context.destination); osc.start(); osc.stop(this.context.currentTime + s.d); } };
    const skillManager = { /* ... */ skills: { startLength: { name: 'Primordial Length', desc: 'Start with more segments.', base: 20, levels: 10, cost: i => 5 + i * 2, bonus: 3 }, turnRate: { name: 'Cosmic Agility', desc: 'Turn faster.', base: 1, levels: 5, cost: i => 10 + i * 5, bonus: 0.01 } }, fragments: 0, levels: {}, load() { this.fragments = parseInt(localStorage.getItem('tikkunFragments') || '0'); this.levels = JSON.parse(localStorage.getItem('tikkunSkills') || '{}'); for (const key in this.skills) { if (!this.levels[key]) this.levels[key] = 0; } }, save() { localStorage.setItem('tikkunFragments', this.fragments); localStorage.setItem('tikkunSkills', JSON.stringify(this.levels)); }, getValues() { const values = {}; for (const key in this.skills) { const skill = this.skills[key]; values[key] = skill.base + (this.levels[key] || 0) * skill.bonus; } return values; } };

    // --- 3. INPUT HANDLING (THE CRITICAL FIX) ---
    
    let isDragging = false;
    let lastAngle = 0;
    
    // In main.js, near the top of the script


let touchStartX = 0;
let touchStartY = 0;



// B"H

let tapCount = 0;
let tapTimer = null;

// 
function onPointerDown(event) {
    event.preventDefault();
    console.log(`Pointer DOWN event fired: ${event.type}`);
    
    audioManager.init();
    isDragging = true;
    
    // --- BOOST LOGIC ---
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 300); // Reset taps if it's too slow

    if (tapCount >= 2) {
        if (gameWorker) gameWorker.postMessage({ type: 'boostStart' });
        tapCount = 0; // Reset after successful double tap
    }
    // --- END BOOST LOGIC ---

    // Set the anchor point for our virtual joystick
    touchStartX = event.touches ? event.touches[0].clientX : event.clientX;
    touchStartY = event.touches ? event.touches[0].clientY : event.clientY;
}

function onPointerMove(event) {
    if (!isDragging) return;
    event.preventDefault();
    
    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const y = event.touches ? event.touches[0].clientY : event.clientY;

    // Calculate the angle from the starting touch point to the current touch point
    let targetAngle = Math.atan2(y - touchStartY, x - touchStartX);

    if (gameWorker) {
        gameWorker.postMessage({ type: 'setInputAngle', angle: targetAngle }); 
    }
}

function onPointerUp(event) {
    if (!isDragging) return;
    event.preventDefault();
    console.log(`Pointer UP event fired: ${event.type}`);

    isDragging = false;
    if (gameWorker) {
        // Tell the worker the user is no longer actively steering OR boosting
        gameWorker.postMessage({ type: 'inputUp' });
        gameWorker.postMessage({ type: 'boostEnd' }); // Stop boosting on release
    }
}


const keys = {
    up: false,
    down: false,
    left: false,
    right: false
};

function updateKeyboardDirection() {
    if (!gameWorker) return;

    let dx = 0;
    let dy = 0;

    if (keys.up) dy -= 1;
    if (keys.down) dy += 1;
    if (keys.left) dx -= 1;
    if (keys.right) dx += 1;

    if (dx !== 0 || dy !== 0) {
        // A key is being pressed, calculate the angle and send it
        const targetAngle = Math.atan2(dy, dx);
        gameWorker.postMessage({ type: 'setInputAngle', angle: targetAngle });
    } else {
        // No keys are pressed, tell the worker to stop turning
        gameWorker.postMessage({ type: 'inputUp' });
    }
}


function handleKeyDown(event) {
    let changed = false;
    switch (event.key) {
        case 'w':
        case 'ArrowUp':
            if (!keys.up) { keys.up = true; changed = true; }
            break;
        case 's':
        case 'ArrowDown':
            if (!keys.down) { keys.down = true; changed = true; }
            break;
        case 'a':
        case 'ArrowLeft':
            if (!keys.left) { keys.left = true; changed = true; }
            break;
        case 'd':
        case 'ArrowRight':
            if (!keys.right) { keys.right = true; changed = true; }
            break;
    }
    if (changed) {
        event.preventDefault(); // Prevent scrolling with arrow keys
        updateKeyboardDirection();
    }
}

function handleKeyUp(event) {
    let changed = false;
    switch (event.key) {
        case 'w':
        case 'ArrowUp':
            if (keys.up) { keys.up = false; changed = true; }
            break;
        case 's':
        case 'ArrowDown':
            if (keys.down) { keys.down = false; changed = true; }
            break;
        case 'a':
        case 'ArrowLeft':
            if (keys.left) { keys.left = false; changed = true; }
            break;
        case 'd':
        case 'ArrowRight':
            if (keys.right) { keys.right = false; changed = true; }
            break;
    }
    if (changed) {
        event.preventDefault();
        updateKeyboardDirection();
    }
}


let resizeTimeout;

function handleResize() {
    // Clear the timeout if it's already been set.
    // This ensures the logic only runs after the user has stopped resizing.
    clearTimeout(resizeTimeout);
    
    // Set a new timeout
    resizeTimeout = setTimeout(() => {
        console.log("B'H - Window resized. Sending new dimensions to worker.");
        
        // We only send the message if the game is actually running
        if (gameWorker && gameCanvas) {
            // Re-assert the CSS size of the canvas element.
            gameCanvas.style.width = '100%';
            gameCanvas.style.height = '100%';

            // Tell the worker about the new dimensions so it can update its own canvas
            gameWorker.postMessage({
                type: 'resize',
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio
            });
        }
    }, 250); // Wait for 250ms of inactivity before firing.
}
    
    // --- 4. GAME LIFECYCLE ---

// B"H 
function startGame() {
    console.log("startGame called.");
    
    const oldGameOverScreen = document.querySelector('.game-over-menu');
    if (oldGameOverScreen) oldGameOverScreen.remove();

    gameCanvas = document.createElement('canvas');
    gameCanvas.id = 'gameCanvas';
    gameCanvas.style.width = '100%';
    gameCanvas.style.height = '100%';
    document.body.appendChild(gameCanvas);

    // --- ADD ALL EVENT LISTENERS ---
    window.addEventListener('resize', handleResize); // For robust resizing
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gameCanvas.addEventListener('mousedown', onPointerDown);
    gameCanvas.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    console.log("All game event listeners have been ADDED.");

    // Initialize and start the worker
    gameWorker = new Worker('worker.js');
    const offscreen = gameCanvas.transferControlToOffscreen();
    gameWorker.onmessage = handleWorkerMessage;
    
    gameWorker.postMessage({ 
        type: 'init', 
        canvas: offscreen, 
        width: window.innerWidth, 
        height: window.innerHeight, 
        pixelRatio: window.devicePixelRatio, 
        initialSettings: { skillValues: skillManager.getValues() } 
    }, [offscreen]);
    
    if (menuContainer) menuContainer.remove(); 
}


// B"H
function endGame(finalScore) {
    console.log("endGame called.");
    
    // *** REMOVE ALL LISTENERS ***
    if (gameCanvas) {
        gameCanvas.removeEventListener('mousedown', onPointerDown);
        gameCanvas.removeEventListener('touchstart', onPointerDown);
    }
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
    window.removeEventListener('touchend', onPointerUp);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('resize', handleResize); // Remove resize listener
    console.log("All game event listeners have been REMOVED.");

    // Cleanup
    if (gameWorker) { gameWorker.terminate(); gameWorker = null; }
    if (gameCanvas) { gameCanvas.remove(); gameCanvas = null; }
    
    // Show game over screen
    const highScore = Math.max(parseInt(localStorage.getItem('tikkunHighScore') || '0'), finalScore);
    localStorage.setItem('tikkunHighScore', highScore);
    const fragmentsEarned = Math.floor(finalScore / 100);
    skillManager.fragments += fragmentsEarned;
    skillManager.save();
    
    createAndShowGameOverScreen(finalScore, fragmentsEarned, highScore);
}
    
    function createAndShowGameOverScreen(finalScore, fragmentsEarned, highScore) {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-menu';
        gameOverScreen.innerHTML = `
            <h2>The Spark Ascends</h2>
            <div>Final Rectification: ${finalScore}</div>
            <div>Fragments Earned: ${fragmentsEarned}💎</div>
            <div>Highest: ${highScore}</div>
            <button class="menu-button">Renew the Cycle</button>
        `;
        gameOverScreen.querySelector('button').addEventListener('click', startGame);
        document.body.appendChild(gameOverScreen);
        console.log("Game over screen created.");
    }
    
    // In main.js

// In main.js - Replace your handleWorkerMessage function with this one

function handleWorkerMessage(event) {
    const { type, ...data } = event.data; 

    switch (type) {
        case 'initialized':
            // The worker has confirmed it's ready. NOW we can start the game.
            console.log("B'H - Worker is initialized. Sending start command.");
            gameWorker.postMessage({ type: 'start' });
            break;
        case 'gameover':
            endGame(data.finalScore); 
            break;
        case 'playSound':
            audioManager.play(data.name, data.opts);
            break;
    }
}

    // --- 5. INITIALIZATION ---
    function init() {
        skillManager.load();
        const currentHighScore = localStorage.getItem('tikkunHighScore') || '0';
        highScoreDisplay.textContent = `Highest Rectification: ${currentHighScore}`;
        playButton.addEventListener('click', startGame);
        console.log("Initialization complete. Waiting for play button click.");
    }

    init();
});