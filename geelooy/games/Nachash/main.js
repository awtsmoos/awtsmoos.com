// B"H - A script built on the principle of dynamic creation.
console.log('B"H');

// We wrap the entire script in this event listener to ensure the HTML is loaded before we try to access it.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. INITIAL STATE & STATIC ELEMENT REFERENCES ---
    // These are the only elements that exist when the page first loads.
    const mainMenuContainer = document.getElementById('main-menu');
    const playButton = document.getElementById('playButton');
    const highScoreDisplay = document.getElementById('highScoreDisplay');
    
    // We will store references to dynamically created elements here so we don't have to recreate them every time.
    let gameCanvas = null;
    let gameWorker = null;
    let settingsMenuElement = null; // Will hold the settings menu DOM element
    let abilitiesMenuElement = null; // Will hold the abilities menu DOM element
    let gameOverScreenElement = null; // Will hold the game over screen DOM element

    // --- 2. MANAGERS (DATA & LOGIC) ---
    // These objects manage data and logic but don't create any visible elements by themselves.
    const audioManager = { /* ... full audio manager from before ... */ context: null, isMuted: false, sounds: {}, hasBeenInitialized: false, init() { if (this.hasBeenInitialized) return; this.hasBeenInitialized = true; try { this.context = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { console.error("Web Audio API not supported"); return; } this.sounds = { collect: { f: 880, d: 0.1, t: 'triangle', v: 0.3 }, hit: { f: 120, d: 0.4, t: 'sawtooth', v: 0.6 }, chainBreak: { f: 200, d: 0.2, t: 'square', v: 0.4 }, skillUp: { f: 1500, d: 0.2, t: 'sine', v: 0.5 } }; }, play(name, opts = {}) { if (!this.context || this.isMuted || !this.sounds[name]) return; const s = this.sounds[name]; const osc = this.context.createOscillator(); const gain = this.context.createGain(); osc.type = s.t; osc.frequency.setValueAtTime(opts.pitch || s.f, this.context.currentTime); gain.gain.setValueAtTime(s.v, this.context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + s.d); osc.connect(gain); gain.connect(this.context.destination); osc.start(); osc.stop(this.context.currentTime + s.d); } };
    const skillManager = { /* ... full skill manager from before ... */ skills: { startLength: { name: 'Primordial Length', desc: 'Start with more segments.', base: 20, levels: 10, cost: i => 5 + i * 2, bonus: 3 }, turnRate: { name: 'Cosmic Agility', desc: 'Turn faster.', base: 0.04, levels: 5, cost: i => 10 + i * 5, bonus: 0.01 } }, fragments: 0, levels: {}, load() { this.fragments = parseInt(localStorage.getItem('tikkunFragments') || '0'); this.levels = JSON.parse(localStorage.getItem('tikkunSkills') || '{}'); for (const key in this.skills) { if (!this.levels[key]) this.levels[key] = 0; } }, save() { localStorage.setItem('tikkunFragments', this.fragments); localStorage.setItem('tikkunSkills', JSON.stringify(this.levels)); }, getValues() { const values = {}; for (const key in this.skills) { const skill = this.skills[key]; values[key] = skill.base + (this.levels[key] || 0) * skill.bonus; } return values; } };

    // --- 3. GAME LIFECYCLE FUNCTIONS ---

    function startGame() {
        // HIDE the main menu.
        mainMenuContainer.style.display = 'none';

        // CREATE the canvas element.
        gameCanvas = document.createElement('canvas');
        gameCanvas.id = 'gameCanvas';
        gameCanvas.style.position = 'fixed';
        gameCanvas.style.top = '0';
        gameCanvas.style.left = '0';
        gameCanvas.style.width = '100%';
        gameCanvas.style.height = '100%';
        document.body.appendChild(gameCanvas);

        // CREATE the game worker.
        gameWorker = new Worker('worker.js');
        const offscreen = gameCanvas.transferControlToOffscreen();
        gameWorker.postMessage({ type: 'init', canvas: offscreen, width: window.innerWidth, height: window.innerHeight, pixelRatio: window.devicePixelRatio, initialSettings: { skillValues: skillManager.getValues() } }, [offscreen]);
        
        // LISTEN for messages from the worker.
        gameWorker.onmessage = handleWorkerMessage;

        // ACTIVATE the game input listeners. They only exist while the game is running.
        addGameInputListeners();

        // START the game logic in the worker.
        gameWorker.postMessage({ type: 'start', skillValues: skillManager.getValues() });
    }

    function endGame(finalScore) {
        // DEACTIVATE the game input listeners IMMEDIATELY.
        removeGameInputListeners();

        // DESTROY the worker.
        if (gameWorker) {
            gameWorker.terminate();
            gameWorker = null;
        }

        // DESTROY the canvas.
        if (gameCanvas) {
            gameCanvas.remove();
            gameCanvas = null;
        }

        // --- Post-Game Logic ---
        const highScore = Math.max(parseInt(localStorage.getItem('tikkunHighScore') || '0'), finalScore);
        localStorage.setItem('tikkunHighScore', highScore);

        const fragmentsEarned = Math.floor(finalScore / 100);
        skillManager.fragments += fragmentsEarned;
        skillManager.save();

        // CREATE and SHOW the game over screen.
        createAndShowGameOverScreen(finalScore, fragmentsEarned, highScore);
    }

    function handleWorkerMessage({ type, ...data }) {
        switch (type) {
            case 'playSound':
                audioManager.play(data.name, data.opts);
                break;
            case 'gameover':
                endGame(data.finalScore);
                break;
        }
    }

    // --- 4. DYNAMIC MENU CREATION ---

    function createAndShowGameOverScreen(finalScore, fragmentsEarned, highScore) {
        if (!gameOverScreenElement) {
            gameOverScreenElement = document.createElement('div');
            // Use the same CSS class as your old menus for consistent styling
            // You can add a .menu class to your new CSS to style all dynamic menus.
            gameOverScreenElement.className = 'menu'; 
            gameOverScreenElement.innerHTML = `
                <h2>The Spark Ascends</h2>
                <div id="scoreDisplay">Final Rectification: ${finalScore}</div>
                <div id="fragmentsEarnedDisplay">Fragments Earned: ${fragmentsEarned}💎</div>
                <div id="gameOverHighScore">Highest: ${highScore}</div>
                <button id="restartButton" class="menu-button">Renew the Cycle</button>
            `;

            // Attach event listener to the new button
            gameOverScreenElement.querySelector('#restartButton').addEventListener('click', () => {
                gameOverScreenElement.remove(); // Remove itself
                startGame(); // Start a new game
            });
        }
        
        // Update the content every time it's shown
        gameOverScreenElement.querySelector('#scoreDisplay').textContent = `Final Rectification: ${finalScore}`;
        gameOverScreenElement.querySelector('#fragmentsEarnedDisplay').textContent = `Fragments Earned: ${fragmentsEarned}💎`;
        gameOverScreenElement.querySelector('#gameOverHighScore').textContent = `Highest: ${highScore}`;
        
        document.body.appendChild(gameOverScreenElement);
    }

    // You can add functions for Settings and Abilities menus here in the same pattern
    // e.g., createAndShowSettingsMenu()

    // --- 5. INPUT HANDLING ---
    // These functions are responsible for adding and removing the event listeners that control the game.
    // This separation is key to preventing them from interfering with the menus.

    let isDragging = false;
    let lastAngle = 0;
    const handleDown = (x, y) => { audioManager.init(); isDragging = true; lastAngle = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2); };
    const handleMove = (x, y) => { if (!isDragging || !gameWorker) return; let angleChange = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2) - lastAngle; if (angleChange > Math.PI) angleChange -= 2 * Math.PI; if (angleChange < -Math.PI) angleChange += 2 * Math.PI; gameWorker.postMessage({ type: 'inputRot', rotation: angleChange }); lastAngle = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2); };
    const handleUp = () => { isDragging = false; if (gameWorker) gameWorker.postMessage({ type: 'inputUp' }); };

    const handleMouseDown = e => handleDown(e.clientX, e.clientY);
    const handleMouseMove = e => handleMove(e.clientX, e.clientY);
    const handleTouchStart = e => { e.preventDefault(); handleDown(e.touches[0].clientX, e.touches[0].clientY); };
    const handleTouchMove = e => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); };

    function addGameInputListeners() {
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleUp);
    }
    
    function removeGameInputListeners() {
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleUp);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleUp);
    }

    // --- 6. INITIALIZATION ---
    
    function init() {
        // Load data from localStorage.
        skillManager.load();
        const currentHighScore = localStorage.getItem('tikkunHighScore') || '0';
        highScoreDisplay.textContent = `Highest Rectification: ${currentHighScore}`;

        // Attach the one, single, critical event listener that starts everything.
        playButton.addEventListener('click', startGame);
        
        // Note: NO other listeners are active at this point.
    }

    // Run the initialization function.
    init();
});