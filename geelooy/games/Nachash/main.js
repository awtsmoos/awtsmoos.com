//B"H
console.log('B"H');

if (!window.Worker || !window.OffscreenCanvas) {
    alert("Your browser does not support features critical for this game (Web Workers or OffscreenCanvas). Please use a modern browser like Chrome or Firefox.");
} else {
    const ui = {
        mainMenu: document.getElementById('mainMenu'),
        settingsMenu: document.getElementById('settingsMenu'),
        abilitiesMenu: document.getElementById('abilitiesMenu'),
        captionEditor: document.getElementById('captionEditor'),
        gameOverScreen: document.getElementById('gameOverScreen'),
        scoreDisplay: document.getElementById('scoreDisplay'),
        highScoreDisplay: document.getElementById('highScoreDisplay'),
        fragmentDisplay: document.getElementById('fragmentDisplay'),
        abilitiesFragmentDisplay: document.getElementById('abilitiesFragmentDisplay'),
        fragmentsEarnedDisplay: document.getElementById('fragmentsEarnedDisplay'),
        gameOverHighScore: document.getElementById('gameOverHighScore'),
        canvas: document.getElementById('gameCanvas'),
        captionToggle: document.getElementById('captionToggle'),
        captionTextarea: document.getElementById('captionTextarea'),
        loreContainer: document.getElementById('lore-container'),
        loreText: document.getElementById('lore-text'),
        loreUnlockProgressBar: document.getElementById('lore-unlock-progress-bar'),
        chainDisplay: document.getElementById('chain-display'),
        chainText: document.getElementById('chain-text'),
        chainTimerBar: document.getElementById('chain-timer-bar'),
        gameUiControls: document.getElementById('game-ui-controls'),
        pauseButton: document.getElementById('pause-button'),
        muteButton: document.getElementById('mute-button'),
        pauseOverlay: document.getElementById('pause-overlay'),
        topLeftUi: document.getElementById('top-left-ui'),
        scoreReadout: document.getElementById('score-readout'),
        skillTreeContainer: document.getElementById('skill-tree')
    };
    
    let gameWorker;

    const loreManager = {
        entries: [], unlockScores: [], currentIndex: -1,
        defaultLore: [
            "In the beginning, I was a creature of pure light...",
            "But in the Garden, a choice was made, a shadow fell...",
            "This is not a fall, but a descent for the sake of ascent...",
            "Each spark is a memory, a piece of the divine blueprint...",
            "The void itself resists, its shells (Klipot) guard the light...",
            "To become whole is to become more than I ever was."
        ].join('\n\n'),
        load() {
            const raw = localStorage.getItem('tikkunLore') || this.defaultLore;
            ui.captionTextarea.value = raw;
            this.entries = raw.split('\n\n').filter(s => s.trim());
            this.unlockScores = this.entries.map((_, i) => i === 0 ? 0 : 25 * i * i + 25 * i);
        },
        save() {
            localStorage.setItem('tikkunLore', ui.captionTextarea.value);
            this.load();
            showMenu('settingsMenu');
        },
        update(score) {
            let nextUnlockIndex = this.currentIndex + 1;
            if (nextUnlockIndex < this.entries.length && score >= this.unlockScores[nextUnlockIndex]) {
                this.currentIndex = nextUnlockIndex;
            }
             if (ui.captionToggle.checked) {
                ui.loreContainer.style.opacity = '1';
                ui.loreText.textContent = this.entries[this.currentIndex] || this.entries[0];
                let progress = 0;
                if (nextUnlockIndex < this.entries.length) {
                    const prevScore = this.unlockScores[this.currentIndex] || 0;
                    const nextScore = this.unlockScores[nextUnlockIndex];
                    progress = (score - prevScore) / (nextScore - prevScore);
                } else { progress = 1; }
                ui.loreUnlockProgressBar.style.width = `${Math.min(100, progress * 100)}%`;
            } else { ui.loreContainer.style.opacity = '0'; }
        },
        reset() { this.currentIndex = -1; this.update(0); }
    };

    const audioManager = {
        context: null, isMuted: false, sounds: {},
        init() {
            if (this.context) { this.context.resume(); return; }
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
            if (!this.context || this.isMuted) return;
            const s = this.sounds[name];
            if (!s) return;
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            if (s.t !== 'noise') {
                osc.type = s.t;
                osc.frequency.setValueAtTime(opts.pitch || s.f, this.context.currentTime);
                if (name === 'supernova' || name === 'ouroboros') osc.frequency.exponentialRampToValueAtTime(30, this.context.currentTime + s.d);
                if (name === 'singularity') osc.frequency.exponentialRampToValueAtTime(1000, this.context.currentTime + s.d);
                if (name === 'comet') osc.frequency.exponentialRampToValueAtTime(1200, this.context.currentTime + s.d);
            } else {
                const bufferSize = this.context.sampleRate * s.d;
                const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
                const output = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
                const noise = this.context.createBufferSource();
                noise.buffer = buffer; noise.connect(gain); noise.start();
                noise.stop(this.context.currentTime + s.d);
            }
            gain.gain.setValueAtTime(s.v, this.context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + s.d);
            if (s.t !== 'noise') osc.connect(gain);
            gain.connect(this.context.destination);
            if (s.t !== 'noise') { osc.start(); osc.stop(this.context.currentTime + s.d); }
        },
        toggleMute() {
            this.isMuted = !this.isMuted;
            if (this.context) this.context.resume();
            ui.muteButton.textContent = this.isMuted ? '🔇' : '🔊';
        }
    };

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
    	console.log("Nachashing")
    	
    	
    	
        setupWorker();
        setupEventListeners();
        skillManager.load();
        loreManager.load();
        loadHighScore();
        showMenu('mainMenu');
    }

    function setupWorker() {
        gameWorker = new Worker('worker.js');
        const offscreen = ui.canvas.transferControlToOffscreen();
        const computedStyle = getComputedStyle(document.documentElement);

        gameWorker.postMessage({
            type: 'init',
            canvas: offscreen,
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio,
            initialSettings: {
                cosmicBg: computedStyle.getPropertyValue('--cosmic-bg').trim(),
                skillValues: skillManager.getValues()
            }
        }, [offscreen]);

        gameWorker.onmessage = (e) => handleWorkerMessage(e.data);
    }

    function handleWorkerMessage(data) {
        switch (data.type) {
            case 'updateScore':
                ui.scoreReadout.textContent = `Rectification: ${data.score}`;
                loreManager.update(data.score);
                break;
            case 'updateChain':
                updateChainUI(data.chain);
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
    	console.log("starting game!")
        showMenu(null);
        ui.gameUiControls.style.display = 'flex';
        ui.topLeftUi.style.display = 'block';
        audioManager.init();
        loreManager.reset();
        gameWorker.postMessage({ type: 'start', skillValues: skillManager.getValues() });
    }
    
    function endGame(finalScore) {
        ui.gameUiControls.style.display = 'none';
        ui.topLeftUi.style.display = 'none';
        updateChainUI({ count: 0 }); // Hide chain meter

        const highScore = checkAndSaveHighScore(finalScore);
        const fragmentsEarned = Math.floor(finalScore / 100);
        skillManager.fragments += fragmentsEarned;
        skillManager.save();

        showMenu('gameOverScreen');
        ui.scoreDisplay.textContent = `Final Rectification: ${finalScore}`;
        ui.fragmentsEarnedDisplay.textContent = `Fragments Earned: ${fragmentsEarned}💎`;
        ui.gameOverHighScore.textContent = `Highest: ${highScore}`;
    }

    function updateChainUI(chain) {
        if(chain.count > 1) {
            ui.chainDisplay.classList.add('visible');
            const multiplier = 1 + Math.floor(chain.count / 5);
            ui.chainText.textContent = `Chain: ${chain.count}` + (multiplier > 1 ? ` (x${multiplier})`:'');
            ui.chainTimerBar.style.width = `${(chain.timer / chain.maxTime) * 100}%`;
        } else {
            ui.chainDisplay.classList.remove('visible');
        }
    }

    function togglePause() {
        const isPaused = ui.pauseOverlay.classList.toggle('visible');
        ui.pauseButton.textContent = isPaused ? '▶' : '||';
        gameWorker.postMessage({ type: 'togglePause' });
    }
    
    function setupEventListeners() {
        document.getElementById('playButton').onclick = startGame;
        document.getElementById('restartButton').onclick = startGame;
        document.getElementById('settingsButton').onclick = () => showMenu('settingsMenu');
        document.getElementById('abilitiesButton').onclick = () => { skillManager.render(); showMenu('abilitiesMenu'); };
        document.getElementById('closeSettingsButton').onclick = () => showMenu('mainMenu');
        document.getElementById('closeAbilitiesButton').onclick = () => showMenu('mainMenu');
        document.getElementById('editCaptionsButton').onclick = () => showMenu('captionEditor');
        document.getElementById('saveCaptionsButton').onclick = () => loreManager.save();
        ui.captionToggle.onchange = () => loreManager.update(0);
        ui.pauseButton.onclick = togglePause;
        ui.muteButton.onclick = () => audioManager.toggleMute();

        let lastAngle = 0;
        let isDragging = false;

        const handleDown = (x, y) => {
            isDragging = true;
            lastAngle = Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2);
            audioManager.init();
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

        const handleUp = () => {
            isDragging = false;
            gameWorker.postMessage({ type: 'inputUp' });
        };

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
        window.addEventListener('keydown', e => { if (e.key.toLowerCase() === 'p') togglePause(); });
    }

    function showMenu(menuId) {
        // Hide all menus
        document.querySelectorAll('.menu').forEach(m => m.classList.remove('visible'));
        
        // Show the specific menu if one is requested
        if (menuId) {
            document.getElementById(menuId).classList.add('visible');
        }
        
        // Always update the fragment display
        updateFragmentDisplays();
    }
    
    function updateFragmentDisplays() {
        const fragmentText = `Ein Sof Fragments: ${skillManager.fragments}💎`;
        ui.fragmentDisplay.textContent = fragmentText;
        ui.abilitiesFragmentDisplay.textContent = fragmentText;
    }

    function loadHighScore() { 
        const hs = parseInt(localStorage.getItem('tikkunHighScore') || '0'); 
        ui.highScoreDisplay.textContent = `Highest Rectification: ${hs}`; 
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