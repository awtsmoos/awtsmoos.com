// B"H - Dynamic Canvas Engine: The Final Version
console.log('B"H');

if (!window.Worker || !window.OffscreenCanvas) {
    alert("Your browser does not support features critical for this game.");
} else {

    // UI object references ONLY the permanent menu elements.
    const ui = {
        mainMenu: document.getElementById('mainMenu'),
        settingsMenu: document.getElementById('settingsMenu'),
        abilitiesMenu: document.getElementById('abilitiesMenu'),
        gameOverScreen: document.getElementById('gameOverScreen'),
        scoreDisplay: document.getElementById('scoreDisplay'),
        highScoreDisplay: document.getElementById('highScoreDisplay'),
        fragmentDisplay: document.getElementById('fragmentDisplay'),
        abilitiesFragmentDisplay: document.getElementById('abilitiesFragmentDisplay'),
        fragmentsEarnedDisplay: document.getElementById('fragmentsEarnedDisplay'),
        gameOverHighScore: document.getElementById('gameOverHighScore'),
        skillTreeContainer: document.getElementById('skill-tree')
    };
    
    let gameWorker = null; // The worker is null until the game starts.

    // --- FULL, UNCOMPROMISED FEATURE MANAGERS ---
    const audioManager = { /* ... full audio manager ... */ 
        context: null, isMuted: false, sounds: {}, hasBeenInitialized: false,
        init() {
            if (this.hasBeenInitialized) return; this.hasBeenInitialized = true; console.log("Audio Context Initialized");
            try { this.context = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { console.error("Web Audio API not supported"); return; }
            this.sounds = { collect: { f: 880, d: 0.1, t: 'triangle', v: 0.3 }, hit: { f: 120, d: 0.4, t: 'sawtooth', v: 0.6 }, chainBreak: { f: 200, d: 0.2, t: 'square', v: 0.4 }, skillUp: { f: 1500, d: 0.2, t: 'sine', v: 0.5 } };
        },
        play(name, opts = {}) { if (!this.context || this.isMuted || !this.sounds[name]) return; const s = this.sounds[name]; const osc = this.context.createOscillator(); const gain = this.context.createGain(); osc.type = s.t; osc.frequency.setValueAtTime(opts.pitch || s.f, this.context.currentTime); gain.gain.setValueAtTime(s.v, this.context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + s.d); osc.connect(gain); gain.connect(this.context.destination); osc.start(); osc.stop(this.context.currentTime + s.d); }
    };
    const skillManager = { /* ... full skill manager ... */
        skills: { startLength: { name: 'Primordial Length', desc: 'Start with more segments.', base: 20, levels: 10, cost: i => 5 + i * 2, bonus: 3 }, turnRate: { name: 'Cosmic Agility', desc: 'Turn faster.', base: 0.04, levels: 5, cost: i => 10 + i * 5, bonus: 0.01 } },
        fragments: 0, levels: {},
        load() { this.fragments = parseInt(localStorage.getItem('tikkunFragments') || '0'); this.levels = JSON.parse(localStorage.getItem('tikkunSkills') || '{}'); for (const key in this.skills) { if (!this.levels[key]) this.levels[key] = 0; } },
        save() { localStorage.setItem('tikkunFragments', this.fragments); localStorage.setItem('tikkunSkills', JSON.stringify(this.levels)); },
        getValues() { const values = {}; for (const key in this.skills) { const skill = this.skills[key]; values[key] = skill.base + (this.levels[key] || 0) * skill.bonus; } return values; },
        render() { if (!ui.skillTreeContainer) return; let html = ''; for (const key in this.skills) { const skill = this.skills[key]; const level = this.levels[key] || 0; const cost = level >= this.getCost.length ? Infinity : skill.cost(level); const canAfford = this.fragments >= cost; html += `<div class="skill-row"><span>${skill.name} [${level}/${skill.levels}]</span><button class="skill-button" data-skill="${key}" ${level >= skill.levels || !canAfford ? 'disabled' : ''}>${level >= skill.levels ? 'Max' : `Upgrade (${cost}💎)`}</button></div>`; } ui.skillTreeContainer.innerHTML = html; ui.skillTreeContainer.querySelectorAll('.skill-button').forEach(btn => { btn.onclick = () => this.purchase(btn.dataset.skill); }); },
        purchase(key) { const cost = this.getCost(key); if (this.fragments >= cost) { this.fragments -= cost; this.levels[key]++; this.save(); this.render(); audioManager.play('skillUp'); updateFragmentDisplays(); } },
        getCost(key) { const level = this.levels[key] || 0; const skill = this.skills[key]; return level >= skill.levels ? Infinity : skill.cost(level); }
    };

    // --- DYNAMIC ELEMENT FUNCTIONS ---

    function createGame() {
        showMenu(null); // Hide all menus
        
        // 1. Create canvas element
        const canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '1'; // Sits behind menus if they were visible

        // 2. Add it to the page
        document.body.appendChild(canvas);

        // 3. Initialize worker with the new canvas
        gameWorker = new Worker('worker.js');
        const offscreen = canvas.transferControlToOffscreen();
        gameWorker.postMessage({
            type: 'init', canvas: offscreen, width: window.innerWidth, height: window.innerHeight,
            pixelRatio: window.devicePixelRatio, initialSettings: { skillValues: skillManager.getValues() }
        }, [offscreen]);
        
        gameWorker.onmessage = (e) => handleWorkerMessage(e.data);
        gameWorker.postMessage({ type: 'start', skillValues: skillManager.getValues() });
    }

    function destroyGame() {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.remove();
        }
        if (gameWorker) {
            gameWorker.terminate(); // Clean up the worker
            gameWorker = null;
        }
    }

    // --- GAME FLOW FUNCTIONS ---

    function handleWorkerMessage({ type, ...data }) {
        switch (type) {
            case 'playSound': audioManager.play(data.name, data.opts); break;
            case 'gameover':
                destroyGame();
                showGameOverMenu(data.finalScore);
                break;
        }
    }

    function showGameOverMenu(finalScore) {
        const highScore = checkAndSaveHighScore(finalScore);
        const fragmentsEarned = Math.floor(finalScore / 100);
        skillManager.fragments += fragmentsEarned;
        skillManager.save();
        showMenu('gameOverScreen');
        if (ui.scoreDisplay) ui.scoreDisplay.textContent = `Final Rectification: ${finalScore}`;
        if (ui.fragmentsEarnedDisplay) ui.fragmentsEarnedDisplay.textContent = `Fragments Earned: ${fragmentsEarned}💎`;
        if (ui.gameOverHighScore) ui.gameOverHighScore.textContent = `Highest: ${highScore}`;
        updateFragmentDisplays();
    }

    // --- UTILITY FUNCTIONS ---
    
    function setupEventListeners() {
        document.getElementById('playButton').onclick = createGame;
        document.getElementById('restartButton').onclick = createGame;
        document.getElementById('settingsButton').onclick = () => showMenu('settingsMenu');
        document.getElementById('abilitiesButton').onclick = () => { skillManager.render(); showMenu('abilitiesMenu'); };
        document.getElementById('closeSettingsButton').onclick = () => showMenu('mainMenu');
        document.getElementById('closeAbilitiesButton').onclick = () => showMenu('mainMenu');

        let lastAngle = 0, isDragging = false;
        const handleDown = (x, y) => { audioManager.init(); isDragging = true; lastAngle = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2); };
        const handleMove = (x, y) => { if (!isDragging || !gameWorker) return; let angleChange = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2) - lastAngle; if (angleChange > Math.PI) angleChange -= 2 * Math.PI; if (angleChange < -Math.PI) angleChange += 2 * Math.PI; gameWorker.postMessage({ type: 'inputRot', rotation: angleChange }); lastAngle = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2); };
        const handleUp = () => { isDragging = false; if (gameWorker) gameWorker.postMessage({ type: 'inputUp' }); };
        
        window.addEventListener('mousedown', e => handleDown(e.clientX, e.clientY));
        window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchstart', e => { e.preventDefault(); handleDown(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
        window.addEventListener('touchmove', e => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
        window.addEventListener('touchend', handleUp);
    }
    
    function showMenu(menuId) {
        document.querySelectorAll('.menu').forEach(m => m.classList.remove('visible'));
        if (menuId) { document.getElementById(menuId).classList.add('visible'); }
    }
    function updateFragmentDisplays() { const text = `Ein Sof Fragments: ${skillManager.fragments}💎`; if (ui.fragmentDisplay) ui.fragmentDisplay.textContent = text; if (ui.abilitiesFragmentDisplay) ui.abilitiesFragmentDisplay.textContent = text; }
    function loadHighScore() { const hs = parseInt(localStorage.getItem('tikkunHighScore') || '0'); if (ui.highScoreDisplay) ui.highScoreDisplay.textContent = `Highest Rectification: ${hs}`; }
    function checkAndSaveHighScore(score) { let hs = parseInt(localStorage.getItem('tikkunHighScore') || '0'); if (score > hs) { hs = score; localStorage.setItem('tikkunHighScore', hs); } return hs; }

    // --- INITIALIZE ---
    skillManager.load();
    loadHighScore();
    setupEventListeners();
    showMenu('mainMenu');
}