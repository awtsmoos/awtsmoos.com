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


// In main.js, replace your existing onPointerDown, onPointerMove, and onPointerUp functions

function onPointerDown(event) {
    event.preventDefault();
    console.log(`Pointer DOWN event fired: ${event.type}`);
    
    audioManager.init();
    isDragging = true;
    
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
        // --- THIS IS THE FIX FOR THE INVERTED DIRECTION ---
        // By sending the negative of the angle, we reverse the rotation.
        // You might not need the negative sign depending on your preference,
        // but based on your description, this should feel correct.
        gameWorker.postMessage({ type: 'setInputAngle', angle: targetAngle }); 
    }
}

function onPointerUp(event) {
    if (!isDragging) return;
    event.preventDefault();
    console.log(`Pointer UP event fired: ${event.type}`);

    isDragging = false;
    if (gameWorker) {
        // Tell the worker the user is no longer actively steering
        gameWorker.postMessage({ type: 'inputUp' });
    }
}
    
    // --- 4. GAME LIFECYCLE ---

    // In main.js

function startGame() {
    console.log("startGame called.");
    
    // If a game over screen exists, remove it
    const oldGameOverScreen = document.querySelector('.game-over-menu');
    if (oldGameOverScreen) oldGameOverScreen.remove();

    // Create canvas
    gameCanvas = document.createElement('canvas');
    gameCanvas.id = 'gameCanvas';
    console.log("Canvas element created.");

    // --- THE CRITICAL FIX IS HERE ---
    // Set the CSS size of the canvas element to make it fill the viewport.
    // This is what allows it to receive touch events everywhere on the screen.
    gameCanvas.style.width = '100%';
    gameCanvas.style.height = '100%';
    // --------------------------------

    document.body.appendChild(gameCanvas);
    console.log("Canvas appended to body.");

    // Add listeners DIRECTLY to the canvas element.
    gameCanvas.addEventListener('mousedown', onPointerDown);
    gameCanvas.addEventListener('touchstart', onPointerDown, { passive: false });
    
    // Move and Up listeners are on the window, so you don't lose control if the cursor leaves the canvas
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    console.log("All game event listeners have been ADDED.");

    // Initialize and start the worker
    gameWorker = new Worker('worker.js');
    console.log("Game worker created.");
    
    const offscreen = gameCanvas.transferControlToOffscreen();
    
    gameWorker.onmessage = handleWorkerMessage;
    
    // Post the message to the worker AFTER the canvas is in the DOM and sized
    gameWorker.postMessage({ 
        type: 'init', 
        canvas: offscreen, 
        // Use the actual window dimensions for the drawing buffer
        width: window.innerWidth, 
        height: window.innerHeight, 
        pixelRatio: window.devicePixelRatio, 
        initialSettings: { skillValues: skillManager.getValues() } 
    }, [offscreen]);

    
    
    if (menuContainer) menuContainer.remove(); 


}

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