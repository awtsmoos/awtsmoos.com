// B"H - A script built on the principle of dynamic creation. CORRECTED.
console.log('B"H');

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. INITIAL STATE & STATIC ELEMENT REFERENCES ---
    const mainMenuContainer = document.getElementById('main-menu');
    const playButton = document.getElementById('playButton');
    const highScoreDisplay = document.getElementById('highScoreDisplay');
    
    let gameCanvas = null;
    let gameWorker = null;
    let gameOverScreenElement = null; 

    // --- 2. MANAGERS (DATA & LOGIC) ---
    const audioManager = { context: null, isMuted: false, sounds: {}, hasBeenInitialized: false, init() { if (this.hasBeenInitialized) return; this.hasBeenInitialized = true; try { this.context = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { console.error("Web Audio API not supported"); return; } this.sounds = { collect: { f: 880, d: 0.1, t: 'triangle', v: 0.3 }, hit: { f: 120, d: 0.4, t: 'sawtooth', v: 0.6 }, chainBreak: { f: 200, d: 0.2, t: 'square', v: 0.4 }, skillUp: { f: 1500, d: 0.2, t: 'sine', v: 0.5 } }; }, play(name, opts = {}) { if (!this.context || this.isMuted || !this.sounds[name]) return; const s = this.sounds[name]; const osc = this.context.createOscillator(); const gain = this.context.createGain(); osc.type = s.t; osc.frequency.setValueAtTime(opts.pitch || s.f, this.context.currentTime); gain.gain.setValueAtTime(s.v, this.context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + s.d); osc.connect(gain); gain.connect(this.context.destination); osc.start(); osc.stop(this.context.currentTime + s.d); } };
    const skillManager = { skills: { startLength: { name: 'Primordial Length', desc: 'Start with more segments.', base: 20, levels: 10, cost: i => 5 + i * 2, bonus: 3 }, turnRate: { name: 'Cosmic Agility', desc: 'Turn faster.', base: 0.04, levels: 5, cost: i => 10 + i * 5, bonus: 0.01 } }, fragments: 0, levels: {}, load() { this.fragments = parseInt(localStorage.getItem('tikkunFragments') || '0'); this.levels = JSON.parse(localStorage.getItem('tikkunSkills') || '{}'); for (const key in this.skills) { if (!this.levels[key]) this.levels[key] = 0; } }, save() { localStorage.setItem('tikkunFragments', this.fragments); localStorage.setItem('tikkunSkills', JSON.stringify(this.levels)); }, getValues() { const values = {}; for (const key in this.skills) { const skill = this.skills[key]; values[key] = skill.base + (this.levels[key] || 0) * skill.bonus; } return values; } };

    // --- 3. GAME LIFECYCLE FUNCTIONS ---

    function startGame() {
        mainMenuContainer.style.display = 'none';
        if (gameOverScreenElement) {
             gameOverScreenElement.remove();
             gameOverScreenElement = null;
        }

        gameCanvas = document.createElement('canvas');
        gameCanvas.id = 'gameCanvas';
        gameCanvas.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%;';
        document.body.appendChild(gameCanvas);

        gameWorker = new Worker('worker.js');
        const offscreen = gameCanvas.transferControlToOffscreen();
        gameWorker.postMessage({ type: 'init', canvas: offscreen, width: window.innerWidth, height: window.innerHeight, pixelRatio: window.devicePixelRatio, initialSettings: { skillValues: skillManager.getValues() } }, [offscreen]);
        
        gameWorker.onmessage = handleWorkerMessage;
        addGameInputListeners(); // ACTIVATE game controls
        gameWorker.postMessage({ type: 'start', skillValues: skillManager.getValues() });
    }

    function endGame(finalScore) {
        removeGameInputListeners(); // DEACTIVATE game controls FIRST

        if (gameWorker) {
            gameWorker.terminate();
            gameWorker = null;
        }
        if (gameCanvas) {
            gameCanvas.remove();
            gameCanvas = null;
        }

        const highScore = Math.max(parseInt(localStorage.getItem('tikkunHighScore') || '0'), finalScore);
        localStorage.setItem('tikkunHighScore', highScore);
        const fragmentsEarned = Math.floor(finalScore / 100);
        skillManager.fragments += fragmentsEarned;
        skillManager.save();
        
        createAndShowGameOverScreen(finalScore, fragmentsEarned, highScore);
    }

    function handleWorkerMessage({ type, ...data }) {
        switch (type) {
            case 'playSound': audioManager.play(data.name, data.opts); break;
            case 'gameover': endGame(data.finalScore); break;
        }
    }

    // --- 4. DYNAMIC MENU CREATION ---

    function createAndShowGameOverScreen(finalScore, fragmentsEarned, highScore) {
        // Ensure old one is gone before creating a new one
        if (gameOverScreenElement) gameOverScreenElement.remove();

        gameOverScreenElement = document.createElement('div');
        // IMPORTANT: Add a class you can style in your CSS file
        // e.g., in style.css, add .menu { ... } with centering and styling.
        gameOverScreenElement.className = 'menu'; 
        gameOverScreenElement.innerHTML = `
            <h2>The Spark Ascends</h2>
            <div id="scoreDisplay">Final Rectification: ${finalScore}</div>
            <div id="fragmentsEarnedDisplay">Fragments Earned: ${fragmentsEarned}💎</div>
            <div id="gameOverHighScore">Highest: ${highScore}</div>
            <button class="menu-button">Renew the Cycle</button>
        `;
        
        gameOverScreenElement.querySelector('button').addEventListener('click', startGame);
        document.body.appendChild(gameOverScreenElement);
    }

    // --- 5. INPUT HANDLING (REWRITTEN FOR RELIABILITY) ---
    
    let isDragging = false;
    let lastAngle = 0;

    // These are the actual event handler functions. They are defined once.
    function onPointerDown(event) {
        // Handle touch and mouse events in one place
        if (event.type === 'touchstart') event.preventDefault();
        audioManager.init();
        
        const x = (event.type === 'touchstart') ? event.touches[0].clientX : event.clientX;
        const y = (event.type === 'touchstart') ? event.touches[0].clientY : event.clientY;
        
        isDragging = true;
        lastAngle = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2);
    }

    function onPointerMove(event) {
        if (!isDragging || !gameWorker) return;
        if (event.type === 'touchmove') event.preventDefault();

        const x = (event.type === 'touchmove') ? event.touches[0].clientX : event.clientX;
        const y = (event.type === 'touchmove') ? event.touches[0].clientY : event.clientY;

        let angleChange = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2) - lastAngle;
        if (angleChange > Math.PI) angleChange -= 2 * Math.PI;
        if (angleChange < -Math.PI) angleChange += 2 * Math.PI;

        gameWorker.postMessage({ type: 'inputRot', rotation: angleChange });
        lastAngle = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2);
    }

    function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;
        if (gameWorker) gameWorker.postMessage({ type: 'inputUp' });
    }

    // These functions now add/remove the exact same named function references. This is guaranteed to work.
    function addGameInputListeners() {
        window.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchstart', onPointerDown, { passive: false });
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('touchend', onPointerUp);
    }
    
    function removeGameInputListeners() {
        window.removeEventListener('mousedown', onPointerDown);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchstart', onPointerDown);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
    }

    // --- 6. INITIALIZATION ---
    function init() {
        skillManager.load();
        const currentHighScore = localStorage.getItem('tikkunHighScore') || '0';
        highScoreDisplay.textContent = `Highest Rectification: ${currentHighScore}`;
        playButton.addEventListener('click', startGame);
    }

    init();
});