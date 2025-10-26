// B"H
console.log('B"H');

if (!window.Worker || !window.OffscreenCanvas) {
    alert("Your browser does not support features critical for this game (Web Workers or OffscreenCanvas). Please use a modern browser like Chrome or Firefox.");
} else {
    // The UI object now only references elements that still exist in our clean HTML.
    const ui = {
        mainMenu: document.getElementById('mainMenu'),
        settingsMenu: document.getElementById('settingsMenu'),
        abilitiesMenu: document.getElementById('abilitiesMenu'),
        gameOverScreen: document.getElementById('gameOverScreen'),
        scoreDisplay: document.getElementById('scoreDisplay'),
        highScoreDisplay: document.getElementById('highScoreDisplay'),
        fragmentDisplay: document.getElementById('fragmentDisplay'),
        canvas: document.getElementById('gameCanvas'),
        // This is the one element we added back for the skill manager.
        skillTreeContainer: document.getElementById('skill-tree') 
    };
    
    let gameWorker;

    // NO DUMMY CODE. This is your full audio manager.
    const audioManager = {
        context: null, isMuted: false, sounds: {}, hasBeenInitialized: false,
        init() {
            // It will only ever initialize once.
            if (this.hasBeenInitialized) return; 
            this.hasBeenInitialized = true;
            console.log("Audio Context Initialized on user gesture.");
            try { this.context = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { console.error("Web Audio API not supported"); return; }
            this.sounds = {
                collect: { f: 880, d: 0.1, t: 'triangle', v: 0.3 }, hit: { f: 120, d: 0.4, t: 'sawtooth', v: 0.6 },
                chainBreak: { f: 200, d: 0.2, t: 'square', v: 0.4 }, shatter: { f: 4000, d: 0.2, t: 'square', v: 0.5 },
                supernova: { f: 100, d: 2.0, t: 'sine', v: 0.8 }, powerup: { f: 1200, d: 0.3, t: 'sine', v: 0.6 },
                ouroboros: { f: 300, d: 1.0, t: 'sawtooth', v: 0.7 }, asteroidShatter: { f: 600, d: 0.5, t: 'noise', v: 0.4 },
                singularity: { f: 50, d: 1.5, t: 'sine', v: 0.8 }, skillUp: { f: 1500, d: 0.2, t: 'sine', v: 0.5 },
                comet: { f: 200, d: 1.5, t: 'sawtooth', v: 0.7}, wormhole: { f: 500, d: 0.5, t: 'square', v: 0.5}
            };
        },
        play(name, opts = {}) {
            if (!this.context || this.isMuted || !this.sounds[name]) return;
            const s = this.sounds[name];
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = s.t;
            osc.frequency.setValueAtTime(opts.pitch || s.f, this.context.currentTime);
            gain.gain.setValueAtTime(s.v, this.context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + s.d);
            osc.connect(gain);
            gain.connect(this.context.destination);
            osc.start();
            osc.stop(this.context.currentTime + s.d);
        }
    };

    // NO DUMMY CODE. This is your full skill manager.
    const skillManager = {
        skills: {
            startLength: { name: 'Primordial Length', desc: 'Start with more segments.', base: 20, levels: 10, cost: i => 5 + i * 2, bonus: 3 },
            turnRate: { name: 'Cosmic Agility', desc: 'Turn faster.', base: 0.04, levels: 5, cost: i => 10 + i * 5, bonus: 0.01 },
            powerupDuration: { name: 'Temporal Echo', desc: 'Power-ups last longer.', base: 8000, levels: 5, cost: i => 15 + i * 10, bonus: 2000 },
            chainTime: { name: 'Chain Persistence', desc: 'Chain timer decays slower.', base: 240, levels: 5, cost: i => 10 + i * 5, bonus: 60 }
        },
        fragments: 0,
        levels: {},
        load() {
            this.fragments = parseInt(localStorage.getItem('tikkunFragments') || '0');
            this.levels = JSON.parse(localStorage.getItem('tikkunSkills') || '{}');
            for (const key in this.skills) {
                if (!this.levels[key]) this.levels[key] = 0;
            }
        },
        save() {
            localStorage.setItem('tikkunFragments', this.fragments);
            localStorage.setItem('tikkunSkills', JSON.stringify(this.levels));
        },
        getCost(key) {
            const level = this.levels[key];
            const skill = this.skills[key];
            return level >= skill.levels ? Infinity : skill.cost(level);
        },
        purchase(key) {
            const cost = this.getCost(key);
            if (this.fragments >= cost) {
                this.fragments -= cost;
                this.levels[key]++;
                this.save();
                this.render();
                audioManager.play('skillUp');
                updateFragmentDisplays();
            }
        },
        getValues() {
            const values = {};
            for (const key in this.skills) {
                const skill = this.skills[key];
                values[key] = skill.base + this.levels[key] * skill.bonus;
            }
            return values;
        },
        render() {
            // This function now works because ui.skillTreeContainer exists again.
            if (!ui.skillTreeContainer) return;
            let html = '';
            for (const key in this.skills) {
                const skill = this.skills[key];
                const level = this.levels[key];
                const cost = this.getCost(key);
                const canAfford = this.fragments >= cost;
                html += `<div class="skill-row">
                    <span>${skill.name} [${level}/${skill.levels}]<br><small>${skill.desc}</small></span>
                    <button class="skill-button" data-skill="${key}" ${level >= skill.levels || !canAfford ? 'disabled' : ''}>
                        ${level >= skill.levels ? 'Max' : `Upgrade (${cost}💎)`}
                    </button>
                </div>`;
            }
            ui.skillTreeContainer.innerHTML = html;
            ui.skillTreeContainer.querySelectorAll('.skill-button').forEach(btn => {
                btn.onclick = () => this.purchase(btn.dataset.skill);
            });
        }
    };

    function main() {
    	console.log("Nachashing");
        setupWorker();
        setupEventListeners();
        skillManager.load();
        loadHighScore();
        showMenu('mainMenu');
    }

    function setupWorker() {
        gameWorker = new Worker('worker.js');
        const offscreen = ui.canvas.transferControlToOffscreen();
        gameWorker.postMessage({
            type: 'init',
            canvas: offscreen,
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio,
            initialSettings: { skillValues: skillManager.getValues() }
        }, [offscreen]);
        gameWorker.onmessage = (e) => handleWorkerMessage(e.data);
    }

    function handleWorkerMessage(data) {
        switch (data.type) {
            // These cases have been safely modified to not assume UI elements exist.
            case 'updateScore':
                // The score is tracked in the worker, no UI to update mid-game.
                break;
            case 'updateChain':
                // The chain UI was removed, so we do nothing here to prevent a crash.
                break;
            case 'playSound':
                audioManager.play(data.name, data.opts);
                break;
            case 'gameover':
                endGame(data.finalScore);
                break;
        }
    }
    
    function startGame() {
    	console.log("starting game!");
        // We do NOT initialize audio here. It happens on gesture.
        showMenu(null);
        ui.canvas.style.display = 'block';
        gameWorker.postMessage({ type: 'start', skillValues: skillManager.getValues() });
    }
    
    function endGame(finalScore) {
        ui.canvas.style.display = 'none';
        const highScore = checkAndSaveHighScore(finalScore);
        const fragmentsEarned = Math.floor(finalScore / 100);
        skillManager.fragments += fragmentsEarned;
        skillManager.save();

        showMenu('gameOverScreen');
        ui.scoreDisplay.textContent = `Final Rectification: ${finalScore}`;
        // Update the main menu's fragment display for the next run
        updateFragmentDisplays(); 
    }
    
    function setupEventListeners() {
        document.getElementById('playButton').onclick = startGame;
        document.getElementById('restartButton').onclick = startGame;
        document.getElementById('settingsButton').onclick = () => showMenu('settingsMenu');
        document.getElementById('abilitiesButton').onclick = () => { skillManager.render(); showMenu('abilitiesMenu'); };
        document.getElementById('closeSettingsButton').onclick = () => showMenu('mainMenu');
        document.getElementById('closeAbilitiesButton').onclick = () => showMenu('mainMenu');

        let lastAngle = 0;
        let isDragging = false;

        const handleDown = (x, y) => {
            // *** CORE FEATURE RESTORED: Audio is initialized on the FIRST gesture ***
            audioManager.init();
            isDragging = true;
            lastAngle = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2);
        };

        const handleMove = (x, y) => {
            if (!isDragging) return;
            const currentAngle = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2);
            let angleChange = currentAngle - lastAngle;
            if (angleChange > Math.PI) angleChange -= 2 * Math.PI;
            if (angleChange < -Math.PI) angleChange += 2 * Math.PI;
            gameWorker.postMessage({ type: 'inputRot', rotation: angleChange });
            lastAngle = currentAngle;
        };

        const handleUp = () => { isDragging = false; gameWorker.postMessage({ type: 'inputUp' }); };

        window.addEventListener('mousedown', e => handleDown(e.clientX, e.clientY));
        window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchstart', e => { e.preventDefault(); handleDown(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
        window.addEventListener('touchmove', e => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
        window.addEventListener('touchend', handleUp);
        
        window.addEventListener('resize', () => {
            gameWorker.postMessage({
                type: 'resize',
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio
            });
        });
    }

    function showMenu(menuId) {
        const menuContainer = document.getElementById('menu-container');
        document.querySelectorAll('.menu').forEach(m => m.classList.remove('visible'));
        if (menuId) {
            menuContainer.style.display = 'flex';
            document.getElementById(menuId).classList.add('visible');
        } else {
            menuContainer.style.display = 'none';
        }
        updateFragmentDisplays();
    }
    
    function updateFragmentDisplays() {
        // This function is now safe because fragmentDisplay exists
        if (ui.fragmentDisplay) {
            ui.fragmentDisplay.textContent = `Ein Sof Fragments: ${skillManager.fragments}💎`;
        }
    }

    function loadHighScore() { 
        const hs = parseInt(localStorage.getItem('tikkunHighScore') || '0'); 
        if (ui.highScoreDisplay) {
            ui.highScoreDisplay.textContent = `Highest Rectification: ${hs}`; 
        }
    }
    function checkAndSaveHighScore(score) {
        let hs = parseInt(localStorage.getItem('tikkunHighScore') || '0');
        if (score > hs) { 
            hs = score; 
            localStorage.setItem('tikkunHighScore', hs); 
        }
        return hs;
    }

    main();
}