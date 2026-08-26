// B"H
// Boruch Hashem
// Blessed is He
import { ADVENTURE_CONFIG } from './config.js';
import { ADVENTURE_LEVELS } from './levels.js';
import { cloneRect } from './geometry.js';

/**
 * The Awtsmoos renews the whole chamber before one foot can move; Awtsmoos.com gathers score, life, gate, and stage in one truthful groove.
 */
export class AdventureWorld {
	constructor(config = ADVENTURE_CONFIG, levels = ADVENTURE_LEVELS) {
		this.config = config;
		this.levels = levels;
		this.restart();
	}

	/** Return every transient world to its first appointed state. */
	restart() {
		this.score = 0;
		this.lives = this.config.startingLives;
		this.stageIndex = 0;
		this.status = 'playing';
		this.frame = 0;
		this.message = 'Gather every spark.';
		this.loadStage(0);
	}

	/** Load one deterministic chamber while preserving run score and lives. */
	loadStage(stageIndex) {
		const level = this.levels[stageIndex];
		this.stageIndex = stageIndex;
		this.stageName = level.name;
		this.spawn = { ...level.spawn };
		this.player = {
			x: level.spawn.x,
			y: level.spawn.y,
			width: this.config.playerSize,
			height: this.config.playerSize,
			dx: 0,
			dy: 0
		};
		this.walls = level.walls.map(cloneRect);
		this.sparks = level.sparks.map(item => ({ ...item, width: 22, height: 22 }));
		this.sparkGoal = this.sparks.length;
		this.key = { ...level.key, width: 24, height: 24 };
		this.keyCollected = false;
		this.hazards = level.hazards.map(cloneRect);
		this.portal = cloneRect(level.portal);
		this.graceFrames = this.config.graceFrames;
		this.message = 'Gather every spark.';
	}

	/** @returns {boolean} Whether the earned portal may advance the run. */
	get portalReady() {
		return this.sparks.length === 0 && this.keyCollected;
	}

	/** Lose one life and respawn safely, or end the current run. */
	damage() {
		if (this.status !== 'playing' || this.graceFrames > 0) return false;
		this.lives -= 1;
		if (this.lives <= 0) {
			this.status = 'gameOver';
			this.message = 'The chamber darkened. Begin again.';
			return true;
		}
		Object.assign(this.player, { x: this.spawn.x, y: this.spawn.y, dx: 0, dy: 0 });
		this.graceFrames = this.config.graceFrames;
		this.message = 'A shadow struck. The spark returns.';
		return true;
	}

	/** Advance through the earned gate, turning the final gate into victory. */
	advanceStage() {
		if (!this.portalReady || this.status !== 'playing') return false;
		this.score += this.config.stageBonus;
		if (this.stageIndex >= this.levels.length - 1) {
			this.score += this.config.victoryBonus;
			this.status = 'victory';
			this.message = 'All chambers returned to light.';
			return true;
		}
		this.loadStage(this.stageIndex + 1);
		return true;
	}

	/** Toggle finite motion while preserving the chamber exactly. */
	togglePause() {
		if (this.status === 'playing') this.status = 'paused';
		else if (this.status === 'paused') this.status = 'playing';
	}

	/** @returns {object} Frozen diagnostic witness for UI and browser contracts. */
	snapshot() {
		return Object.freeze({
			status: this.status, stageIndex: this.stageIndex, stageName: this.stageName,
			score: this.score, lives: this.lives, frame: this.frame, sparksRemaining: this.sparks.length,
			sparkGoal: this.sparkGoal, keyCollected: this.keyCollected, portalReady: this.portalReady,
			graceFrames: this.graceFrames, message: this.message,
			playerX: this.player.x, playerY: this.player.y
		});
	}
}
