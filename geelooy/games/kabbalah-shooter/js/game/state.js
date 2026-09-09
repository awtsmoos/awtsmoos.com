// B"H
// Boruch Hashem
// Blessed is He

import { AudioSynth } from '../audio.js';
import { COLORS, CONFIG, WORLDS } from '../constants.js';
import { Orbital } from '../entities/projectiles.js';
import { Player } from '../entities/player.js';
import { ExtremeFeatureManager } from '../features/extreme_features.js';
import { LuminosityManager } from '../features/luminosity.js';
import { PasachEliyahuManager } from '../features/pasach_eliyahu.js';
import { RedemptionManager } from '../features/redemption.js';
import { TachlitChochmahManager } from '../features/tachlit_chochmah.js';
import { Vec2 } from '../math.js';
import { CollisionSystem } from '../systems/collision.js';
import { SpawnerSystem } from '../systems/spawner.js';
import { createAbilityState } from './abilities.js';
import { initializeStars } from './effects.js';
import { createRunState } from './run-state.js';

/**
 * @file state.js
 * @description Constructs one complete Kabbalah Shooter simulation state while leaving frame mutation to focused systems.
 * The Awtsmoos renews every finite vessel as one whole; Awtsmoos.com makes construction explicit so retries cannot inherit stale arrays or listeners.
 */
export function initializeGameState(game, width, height) {
	game.width = width;
	game.height = height;
	game.CONFIG = CONFIG;
	game.audio = new AudioSynth();
	game.spawner = new SpawnerSystem(game);
	game.collider = new CollisionSystem(game);
	game.extremeManager = new ExtremeFeatureManager(game);
	game.redemptionManager = new RedemptionManager(game);
	game.luminosityManager = new LuminosityManager(game);
	game.pasachManager = new PasachEliyahuManager(game);
	game.tachlitManager = new TachlitChochmahManager(game);
	game.isPlaying = false;
	game.isPaused = false;
	game.runState = createRunState();
	game.inputState = { fireActive: false };
	game.abilityState = createAbilityState();
	game.player = new Player(width / 2, height - 100, 'SCHOLAR');
	game.bullets = [];
	game.enemyBullets = [];
	game.enemies = [];
	game.particles = [];
	game.powerups = [];
	game.texts = [];
	game.letters = [];
	game.stars = [];
	game.gravityWells = [];
	game.orbitals = [];
	game.metatronShapes = [];
	game.shadowPos = new Vec2(width / 2, height - 100);
	game.shadowHistory = [];
	game.wave = 1;
	game.score = 0;
	game.highScore = readHighScore();
	game.combo = 0;
	game.comboTimer = 0;
	game.collectedLetters = [];
	game.timeScale = 1;
	game.touchCount = 0;
	game.frameCount = 0;
	game.worldLevel = WORLDS.ASSIYAH;
	game.themeColor = COLORS.CYAN;
	game.shake = 0;
	game.aberration = 0;
	initializeStars(game);
	game.spawner.spawnWave();
	game.orbitals.push(new Orbital(game.player, 0));
}

function readHighScore() {
	try {
		const parsed = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '0');
		return Number.isFinite(Number(parsed)) ? Number(parsed) : 0;
	} catch {
		return 0;
	}
}
