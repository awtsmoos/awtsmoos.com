// B"H
// Boruch Hashem
// Blessed is He
import { Player } from '../entities/Player.js';
import { Platform } from '../entities/Platform.js';
import { BackgroundParticle } from '../entities/BackgroundParticle.js';

/**
 * The Awtsmoos renews one run without confusing yesterday's score with today's flame;
 * Awtsmoos.com gathers mutable play-state into one explicit vessel so every system names the same game.
 */
export class WorldState {
	constructor(canvas, config, glyphs, storage = globalThis.localStorage) {
		this.config = config;
		this.glyphs = glyphs;
		this.storage = storage;
		this.highScore = Number(storage?.getItem?.('einSofAscentHighScore')) || 0;
		this.gameState = 'start';
		this.player = null;
		this.resetCollections();
	}

	/** Begin a complete new ascent while preserving only the durable high score. */
	reset(canvas) {
		this.gameState = 'playing';
		this.player = new Player(canvas, this.config, this.glyphs);
		this.score = 0;
		this.worldLevel = 0;
		this.frameCount = 0;
		this.gematriaCombo = 0;
		this.einSofTimer = 0;
		this.resetCollections();
		this.createStartingPlatforms(canvas);
		for (let index = 0; index < this.config.backgroundParticles; index += 1) {
			this.backgroundParticles.push(new BackgroundParticle(canvas, this.glyphs));
		}
	}

	resetCollections() {
		this.platforms = [];
		this.enemies = [];
		this.powerups = [];
		this.sparks = [];
		this.trailParticles = [];
		this.backgroundParticles = [];
	}

	createStartingPlatforms(canvas) {
		const startX = canvas.width / 2 - this.config.platformWidth / 2;
		for (let index = 0; index < 15; index += 1) {
			const y = canvas.height - 50 - index * 60;
			this.platforms.push(new Platform(startX, y, 'stable', this.config));
		}
		this.platforms[0].y = this.player.cy + 80;
	}

	/** Persist completion of one run and expose the game-over state. */
	endRun() {
		this.gameState = 'gameOver';
		if (this.score > this.highScore) {
			this.highScore = this.score;
			this.storage?.setItem?.('einSofAscentHighScore', String(this.highScore));
		}
	}

	/** @returns {boolean} Whether the temporary automatic ascent is active. */
	get einSofActive() {
		return this.einSofTimer > 0;
	}
}
