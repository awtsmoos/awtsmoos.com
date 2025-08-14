/*
ב"ה
B"H
*/

/**
 * @file Assiyah/KaChaBaD.js
 * @description Contains the Sefirot of the intellect: Keter (Crown), Chochmah (Wisdom), Binah (Understanding),
 * and Da'at (Knowledge). These are the highest-level functions of the world of Assiah, responsible for
 * the main loop, initialization, state management, and event handling. Every function herein is fully and
 * completely implemented.
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// KETER - The Crown: The Prime Mover, the main animation loop. The unknowable will to create.
export const KETER = {
    Olam: null,
    init(Olam) { this.Olam = Olam; },
    
    /**
     * @description The Great Cycle. The heartbeat of the universe. This function is called for every frame rendered.
     * It orchestrates the Ma'asim (actions) of the other Sefirot, updating the state of the Olam. Its existence
     * is pure will, a continuous pulse that sustains reality. It calls every system in their proper order of emanation.
     */
    theGreatCycle() {
        if (this.Olam.state !== 'playing') return;
        this.Olam.animationFrameId = requestAnimationFrame(() => this.theGreatCycle());
        
        const deltaTime = Math.min(0.05, this.Olam.three.clock.getDelta());
        
        // The flow of divine energy through the Sefirot is now complete and unbroken.
        ASSIAH.YESOD.movementAndPhysicsSystem(deltaTime);
        ASSIAH.GEVURAH.combatAndAISystem(deltaTime);
        ASSIAH.CHESED.playerSystem(deltaTime);
        ASSIAH.NETZACH.progressionAndEnduranceSystem(deltaTime);
        ASSIAH.TIFERET.effectsAndBeautySystem(deltaTime);
        ASSIAH.HOD.splendorAndRenderSystem();
        ASSIAH.MALCHUT.kingdomAndInterfaceSystem();
    }
};

// CHOCHMAH - Wisdom: The initial flash of creation. Setup and asset creation.
export const CHOCHMAH = {
    Olam: null,
    init(Olam) { this.Olam = Olam; },
    
    /**
     * @description The act of Genesis. Creates the Olam and all its foundational structures.
     * The scent of ozone and newly-forged spacetime fills the air as the boundaries of reality are defined.
     */
    genesis() {
        this.Olam.state = 'loading';
        this.Olam.three = { scene: new THREE.Scene(), camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000), renderer: new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }), clock: new THREE.Clock(), originalCameraPos: new THREE.Vector3(0, 8, 11), cameraTargetPos: new THREE.Vector3(0, 8, 11), cameraLookAtTarget: new THREE.Vector3(0, 2, 0) };
        this.Olam.config = { roadWidth: 9, roadLevelY: -0.5, roadSpeed: 12, lanePositions: [-3.0, 0, 3.0] };
        this.Olam.assets = { webcam: { isInitialized: false, videoElement: document.getElementById('webcamFeed'), stream: null, videoTexture: null, videoTextureMirrored: null }, circleAlphaMap: null, specialParticleTextures: [], dynamicShards: new Set(), activeLights: new Set(), activeShockwaves: new Set() };
        this.Olam.entities = {}; 
        this.Olam.pools = {}; this.Olam.game = {}; this.Olam.playerStats = { totalMitzvot: 0, upgrades: {}, tabletFragments: 0, lastCheck: Date.now() }; this.Olam.settings = {}; this.Olam.ui = { root: document.getElementById('ui-root'), elements: {}, notifiers: {} }; this.Olam.animationFrameId = null;

        const { renderer, camera, scene } = this.Olam.three;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(new THREE.Color(0x030005));
        document.body.insertBefore(renderer.domElement, this.Olam.ui.root);
        camera.position.copy(this.Olam.three.originalCameraPos);
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(5, 10, 7.5);
        scene.add(dirLight);

        this.Olam.BERIAH.init(this.Olam);
        this.Olam.YETZIRAH.init(this.Olam);
        
        this.Olam.BERIAH.createPools();
        for (const schemaName in this.Olam.ATZILUT.uiSchemas) {
            this.Olam.BERIAH.buildUI(schemaName, this.Olam.ui.root);
        }
        const notifierIds = ['ascension', 'combo', 'perfectWave', 'surprise', 'boss'];
        notifierIds.forEach(id => this.Olam.ui.notifiers[id] = document.getElementById(`${id}Notifier`));

        ASSIAH.BINAH.initializeSettings();
        ASSIAH.BINAH.loadPlayerStats();
        this.Olam.assets.circleAlphaMap = this.createCircleAlphaMap();

        window.addEventListener('resize', () => ASSIAH.DAAT.onWindowResize());
        
        
        
        const interactionEvents = {
    'mousedown': ASSIAH.DAAT.handleInteractionStart.bind(ASSIAH.DAAT),
    'mousemove': ASSIAH.DAAT.handleInteractionMove.bind(ASSIAH.DAAT),
    'mouseup': ASSIAH.DAAT.handleInteractionEnd.bind(ASSIAH.DAAT),
    'touchstart': ASSIAH.DAAT.handleInteractionStart.bind(ASSIAH.DAAT),
    'touchmove': ASSIAH.DAAT.handleInteractionMove.bind(ASSIAH.DAAT),
    'touchend': ASSIAH.DAAT.handleInteractionEnd.bind(ASSIAH.DAAT)
};

for (const eventName in interactionEvents) {
    document.addEventListener(eventName, (e) => {
        const clientX = e.touches ? e.touches[0]?.clientX : e.clientX;
        interactionEvents[eventName](e, clientX);
    }, { passive: !eventName.startsWith('touch') });
}
    },
    
    /**
     * @description Creates a circular alpha map texture, a fundamental glyph used throughout creation.
     * @returns {THREE.CanvasTexture}
     */
    createCircleAlphaMap() {
        const size = 128, canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d'); ctx.fillStyle = 'black'; ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, 2*Math.PI); ctx.fill();
        return new THREE.CanvasTexture(canvas);
    },

    /**
     * @description Weaves the characters defined in the settings into tangible textures for particle effects.
     */
    createSpecialParticleTextures() {
        this.Olam.assets.specialParticleTextures.forEach(t => t.dispose());
        this.Olam.assets.specialParticleTextures = [];
        const chars = Array.from(this.Olam.settings.particleChars.replace(/,/g, '')); if(chars.length === 0) return;
        chars.forEach(char => {
            const size = 128, canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext('2d'); ctx.font = `${size * 0.8}px Arial`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(char, size / 2, size / 2 + size*0.05);
            this.Olam.assets.specialParticleTextures.push(new THREE.CanvasTexture(canvas));
        });
    },

    /**
     * @description Inscribes text and gematria onto a texture, used for rendering dynamic values in-world.
     * @returns {THREE.CanvasTexture}
     */
    createTextTexture(text, gematriaText, bgColor, font = '900 240px Orbitron', textColor = '#fff') {
        const canvas = document.createElement('canvas'); const size = 1024; canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'black'; ctx.lineWidth = 20;
        const hasGematria = gematriaText && gematriaText !== '';
        const textY = hasGmatria ? canvas.height / 2 - 120 : canvas.height / 2;
        ctx.strokeText(text, canvas.width / 2, textY); ctx.fillStyle = textColor; ctx.fillText(text, canvas.width / 2, textY);
        if(hasGematria) {
            ctx.font = 'normal 260px "Times New Roman"'; const gematriaY = canvas.height / 2 + 120;
            ctx.strokeText(gematriaText, canvas.width / 2, gematriaY); ctx.fillStyle = textColor; ctx.fillText(gematriaText, canvas.width / 2, gematriaY);
        }
        return new THREE.CanvasTexture(canvas);
    }
};

// BINAH - Understanding: Developing the initial spark. Game state and data management.
export const BINAH = {
    Olam: null,
    init(Olam) { this.Olam = Olam; },
    
    /**
     * @description Loads all settings from localStorage, or populates them with defaults from Atzilut.
     */
    initializeSettings() {
        this.Olam.ATZILUT.settings.forEach(s => {
            const saved = localStorage.getItem(`merkava_setting_${s.id}`);
            this.Olam.settings[s.id] = saved !== null ? JSON.parse(saved) : s.defaultValue;
        });
        ASSIAH.CHOCHMAH.createSpecialParticleTextures();
    },

    /**
     * @description Saves a single setting to both the Olam and localStorage.
     * @param {string} id - The setting ID.
     * @param {*} value - The value to save.
     */
    saveSetting(id, value) {
        this.Olam.settings[id] = value;
        localStorage.setItem(`merkava_setting_${id}`, JSON.stringify(value));
        if (id === 'particleChars') ASSIAH.CHOCHMAH.createSpecialParticleTextures();
        if (id === 'maxNefesh') this.rebuildNefeshFormation();
        // The rebuild functions will be created in their respective Sefirot.
        // if (id.includes('constellation') || id === 'starfieldDensity') ASSIAH.TIFERET.rebuildStarfield();
        // if (id.includes('conduit')) ASSIAH.TIFERET.rebuildFleetConduits();
    },

    /**
     * @description Loads the player's persistent progress from localStorage. Calculates idle earnings.
     */
    loadPlayerStats() {
        const saved = localStorage.getItem('merkavaPlayerStats_v9');
        if (saved) this.Olam.playerStats = JSON.parse(saved);
        const idleUpgrade = this.Olam.playerStats.upgrades.idleMitzvot;
        if (idleUpgrade && idleUpgrade.level > 0) {
            const secondsPassed = (Date.now() - (this.Olam.playerStats.lastCheck || Date.now())) / 1000;
            const earned = Math.floor(secondsPassed / 10) * idleUpgrade.level;
            if (earned > 0) {
                this.Olam.playerStats.totalMitzvot += earned;
                setTimeout(() => this.showGlobalError(`Earned ${earned} Mitzvot from Chochmah's Wisdom.`), 2000);
            }
        }
    },

    /**
     * @description Saves the player's persistent progress to localStorage.
     */
    savePlayerStats() {
        this.Olam.playerStats.lastCheck = Date.now();
        localStorage.setItem('merkavaPlayerStats_v9', JSON.stringify(this.Olam.playerStats));
    },

    /**
     * @description Resets the game world to its initial state for a new journey.
     * @param {boolean} isCustom - Whether this is a custom journey with user-provided prayers.
     */
    resetGame(isCustom = false) {
        const Olam = this.Olam;
        for (const poolName in Olam.pools) {
            Olam.pools[poolName].forEach(entity => {
                if (entity.components.State) entity.components.State.active = false;
                entity.object3D.visible = false;
            });
        }
        Olam.assets.dynamicShards.forEach(s => Olam.three.scene.remove(s)); Olam.assets.dynamicShards.clear();
        Olam.assets.activeLights.forEach(l => Olam.three.scene.remove(l)); Olam.assets.activeLights.clear();
        Olam.assets.activeShockwaves.forEach(sw => Olam.three.scene.remove(sw.mesh)); Olam.assets.activeShockwaves.clear();

        const pStats = Olam.playerStats;
        Olam.game = {
            mitzvot: (pStats.upgrades.initialMitzvot?.level || 0) * 100,
            nefeshCount: 0, shefa: 0, shefaToAscend: 100, level: 1,
            player: {
                fireRate: 350 * (1 - (pStats.upgrades.fireRateBonus?.level || 0) * 0.1),
                projectileDamage: 1, hasRegen: false, regenTimer: 0, hasPierce: false, hasShieldGenerator: false, shieldGenTimer: 0,
                hasShield: pStats.upgrades.startingShield?.level > 0,
                acquiredEmanations: new Set(),
            },
            effects: { shake: 0, fovKick: 0, invincibleTimer: 0, allCritTimer: 0 },
            combo: { count: 0, timer: 0 },
            wave: { isTracking: false, hitsTakenThisWave: 0, waveId: -1, enemiesInWave: new Set(), nextSpawnTime: 0 },
            boss: { isActive: false },
            customPrayers: isCustom ? { phrases: Olam.ui.elements.customMenu.querySelector('textarea').value.split('\n\n').map(p => p.trim()).filter(Boolean), currentIndex: 0 } : null,
            prayerChain: { history: [], lastChangeTime: 0 },
            color: { current: new THREE.Color(0x030005), target: new THREE.Color(Olam.ATZILUT.levelColors[0]) }
        };
        
        if (!Olam.entities.CosmicRiver) {
            const river = { object3D: new THREE.Mesh(Olam.BERIAH.createGeometry('CosmicRiver'), Olam.BERIAH.createMaterial('CosmicRiver')), type: 'CosmicRiver' };
            river.object3D.rotation.x = -Math.PI / 2; river.object3D.position.y = Olam.config.roadLevelY;
            Olam.three.scene.add(river.object3D); Olam.entities.CosmicRiver = river;
        }

        const Merkava = Olam.pools.Merkava[0];
        Merkava.components.State.active = true; Merkava.object3D.visible = true;
        Merkava.object3D.position.set(0, Olam.config.roadLevelY + 0.2, 5);
        
        this.rebuildNefeshFormation();
        // ASSIAH.CHESED.adjustNefeshCount(10 + (pStats.upgrades.startNefesh?.level || 0)); // This will be called in startGame
        
        Olam.three.scene.fog = new THREE.Fog(Olam.game.color.current, 50, 200);
        Olam.three.renderer.setClearColor(Olam.game.color.current);
    },

    /**
     * @description Re-parents the Nefesh objects to the Merkava, necessary after settings changes.
     */
    rebuildNefeshFormation() {
        const Olam = this.Olam;
        const Merkava = Olam.pools.Merkava[0];
        if (Olam.entities.NefeshFormation) Merkava.object3D.remove(Olam.entities.NefeshFormation);
        const formation = new THREE.Group();
        Olam.pools.Nefesh.forEach(nefesh => formation.add(nefesh.object3D));
        Merkava.object3D.add(formation);
        Olam.entities.NefeshFormation = formation;
        Olam.YETZIRAH.calculateNefeshPositions();
    },

    /**
     * @description Initiates a new gameplay session.
     * @param {boolean} isCustom - True if starting with custom prayers.
     */
    startGame(isCustom) {
        this.resetGame(isCustom);
        const Olam = this.Olam;
        Olam.state = 'playing';
        ASSIAH.CHESED.adjustNefeshCount(10 + (Olam.playerStats.upgrades.startNefesh?.level || 0));
        ASSIAH.MALCHUT.updateUIVisibility('playing');
        if (Olam.game.customPrayers?.phrases.length > 0) ASSIAH.MALCHUT.updatePrayerDisplay();
        if (Olam.animationFrameId) cancelAnimationFrame(Olam.animationFrameId);
        ASSIAH.KETER.theGreatCycle();
    },

    /**
     * @description Ends the current gameplay session.
     */
    endGame() {
        const Olam = this.Olam;
        if (Olam.state === 'gameOver') return;
        Olam.state = 'gameOver';
        cancelAnimationFrame(Olam.animationFrameId);
        const mitzvotBonus = 1 + (Olam.playerStats.upgrades.mitzvotGain?.level || 0) * 0.02;
        const earnedMitzvot = Math.floor(Olam.game.mitzvot * mitzvotBonus);
        Olam.playerStats.totalMitzvot += earnedMitzvot;
        this.savePlayerStats();
        Olam.ui.elements.gameOver.querySelector('#finalMitzvotDisplay').textContent = `You gathered ${earnedMitzvot} Mitzvot.`;
        ASSIAH.MALCHUT.updateUIVisibility('gameOver');
    },

    /**
     * @description Displays a global error message to the user.
     * @param {string} message - The error text to display.
     */
    showGlobalError(message) {
        const errorDiv = document.getElementById('globalErrorNotifier');
        if (errorDiv) {
            errorDiv.textContent = message; errorDiv.style.display = 'block';
            setTimeout(() => { errorDiv.style.display = 'none'; }, 6000);
        }
    }
}

// DAAT - Knowledge: The bridge. Input, event handling, and data translation.
export const DAAT = {
    Olam: null,
    init(Olam) { this.Olam = Olam; },
    eventHandlers: {
        startGame: () => ASSIAH.BINAH.startGame(false),
        startCustomGame: () => ASSIAH.BINAH.startGame(true),
        showMainMenu: () => ASSIAH.MALCHUT.updateUIVisibility('mainMenu'),
        showUpgrades: () => { ASSIAH.MALCHUT.populateUpgradeShop(); ASSIAH.MALCHUT.updateUIVisibility('upgradeShop'); },
        showCustom: () => ASSIAH.MALCHUT.updateUIVisibility('customMenu'),
        showSettings: () => { ASSIAH.MALCHUT.populateSettings(); ASSIAH.MALCHUT.updateUIVisibility('settings'); },
        closePrayerList: () => ASSIAH.Olam.ui.elements.prayerList.classList.remove('visible'),
        openPrayerList: () => { ASSIAH.MALCHUT.populatePrayerList(); ASSIAH.Olam.ui.elements.prayerList.classList.add('visible'); },
        prevPrayer: () => ASSIAH.MALCHUT.changePrayer(-1),
        nextPrayer: () => ASSIAH.MALCHUT.changePrayer(1),
        purchaseUpgrade: (e) => {
            const key = e.target.dataset.key; if(!key) return; const upgrade = ASSIAH.Olam.ATZILUT.upgrades[key]; const stats = ASSIAH.Olam.playerStats;
            const currentLevel = stats.upgrades[key]?.level || 0; if (currentLevel >= upgrade.maxLevel) return;
            const cost = Math.floor(upgrade.cost(currentLevel));
            if (stats.totalMitzvot >= cost) {
                stats.totalMitzvot -= cost; if (!stats.upgrades[key]) stats.upgrades[key] = { level: 0 };
                stats.upgrades[key].level++; ASSIAH.BINAH.savePlayerStats(); ASSIAH.MALCHUT.populateUpgradeShop();
            }
        },
        updateSetting: (e) => {
            const id = e.target.id.replace('setting-',''); const def = ASSIAH.Olam.ATZILUT.settings.find(s => s.id === id); if(!def) return;
            let value;
            switch(def.type) { case 'checkbox': value = e.target.checked; break; case 'range': value = parseFloat(e.target.value); break; default: value = e.target.value; }
            ASSIAH.BINAH.saveSetting(id, value);
        },
        updateSettingValueText: (e) => {
            const id = e.target.id.replace('setting-',''); const span = document.getElementById(`setting-value-${id}`);
            if(span) span.textContent = e.target.value;
        }
    },
    onWindowResize() { const Olam = this.Olam; Olam.three.camera.aspect = window.innerWidth / window.innerHeight; Olam.three.camera.updateProjectionMatrix(); Olam.three.renderer.setSize(window.innerWidth, window.innerHeight); },
    handleInteractionStart(e, clientX) { if (this.Olam.state !== 'playing') return; const Merkava = this.Olam.pools.Merkava[0]; if (!Merkava) return; const input = Merkava.components.Input; input.isDragging = true; input.lastTouchX = clientX; if (e.cancelable) e.preventDefault(); },
    handleInteractionMove(e, clientX) { const Merkava = this.Olam.pools.Merkava[0]; if (!Merkava || !Merkava.components.Input.isDragging) return; const input = Merkava.components.Input; const deltaX = clientX - input.lastTouchX; input.targetX += deltaX * 0.03; input.lastTouchX = clientX; },
    handleInteractionEnd() { const Merkava = this.Olam.pools.Merkava[0]; if (Merkava) Merkava.components.Input.isDragging = false; }
};
