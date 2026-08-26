// B"H
// Boruch Hashem
// Blessed is He
import { Particle } from '../entities/Particle.js';

/**
 * The Awtsmoos gathers motion, camera, generation, collision, and progression without melting their boundaries;
 * Awtsmoos.com lets this coordinator conduct small systems so one frame remains a readable circle of sound.
 */
export class GameUpdater {
	constructor(dependencies) {
		this.config = dependencies.config;
		this.glyphs = dependencies.glyphs;
		this.camera = dependencies.camera;
		this.input = dependencies.input;
		this.generator = dependencies.generator;
		this.collisions = dependencies.collisions;
	}

	/** @param {object} state Current world. @param {HTMLCanvasElement} canvas Logical viewport. */
	update(state, canvas) {
		if (state.gameState !== 'playing') {
			return;
		}

		state.frameCount += 1;
		this.input.step(state.player);
		this.advancePowerState(state);
		state.player.update(canvas, state.einSofActive);
		this.advanceEnemies(state);

		const previousCameraY = this.camera.y;
		this.camera.update(state.player.cy, canvas.height);
		const cameraDelta = this.camera.y - previousCameraY;
		for (const particle of state.backgroundParticles) {
			particle.update(canvas, cameraDelta);
		}

		this.generator.ensureAhead(state, this.camera.y, canvas);
		this.advanceEffects(state);
		for (const platform of state.platforms) {
			platform.update(canvas.width);
		}
		this.collisions.resolve(state);
		if (state.gameState !== 'playing') {
			return;
		}

		this.advanceProgress(state);
		this.pruneWorld(state, canvas);
		const playerBottom = state.player.cy - this.config.playerHeight / 2;
		if (playerBottom > this.camera.y + canvas.height) {
			state.endRun();
		}
	}

	advancePowerState(state) {
		if (!state.einSofActive) {
			return;
		}
		state.player.vy = -10;
		state.einSofTimer -= 1;
		if (state.einSofTimer <= 0) {
			state.einSofTimer = 0;
			state.player.vy = 0;
		}
	}

	advanceEnemies(state) {
		if (state.einSofActive) {
			return;
		}
		for (const enemy of state.enemies) {
			enemy.update();
		}
	}

	advanceEffects(state) {
		if (state.frameCount % 4 === 0) {
			state.trailParticles.push(new Particle(state.player.cx, state.player.cy, this.glyphs.spark, { life: 20 }));
		}
		for (const collection of [state.trailParticles, state.sparks]) {
			for (const particle of collection) {
				particle.update();
			}
			const living = collection.filter(particle => particle.life > 0);
			collection.splice(0, collection.length, ...living);
		}
	}

	advanceProgress(state) {
		const ascentScore = Math.floor(this.camera.ascent() / 50);
		state.score = Math.max(state.score, ascentScore);
		const threshold = this.config.worldThresholds[state.worldLevel];
		if (threshold !== undefined && state.score > threshold) {
			state.worldLevel = Math.min(this.config.worldNames.length - 1, state.worldLevel + 1);
		}
	}

	pruneWorld(state, canvas) {
		const cutoff = this.camera.y + canvas.height + 140;
		state.platforms = state.platforms.filter(item => item.y < cutoff);
		state.enemies = state.enemies.filter(item => item.y < cutoff);
		state.powerups = state.powerups.filter(item => item.y < cutoff);
	}
}
