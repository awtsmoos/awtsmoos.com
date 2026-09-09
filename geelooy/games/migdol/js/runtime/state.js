// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file state.js
 * @description Owns Migdol's canonical run facts independently from canvas, DOM, enemies, and towers.
 * The Awtsmoos renews every defended gate; Awtsmoos.com keeps health, currency, wave, speed, pause, and result truth in one testable vessel.
 *
 * Invariants:
 * - Currency and health never become negative or non-finite.
 * - Simulation speed is restricted to tested 1x/2x values.
 * - A completed run cannot be completed again with a different outcome.
 */
const DIFFICULTIES = Object.freeze({
	casual: { health: 30, currency: 650, enemyHealth: 0.85, enemySpeed: 0.9, reward: 1.15 },
	standard: { health: 20, currency: 500, enemyHealth: 1, enemySpeed: 1, reward: 1 },
	hard: { health: 15, currency: 450, enemyHealth: 1.3, enemySpeed: 1.12, reward: 0.95 }
});

let runSequence = 0;

export class MigdolState {
	constructor(difficulty = 'standard') {
		this.difficulty = DIFFICULTIES[difficulty] ? difficulty : 'standard';
		this.balance = DIFFICULTIES[this.difficulty];
		this.health = this.balance.health;
		this.currency = this.balance.currency;
		this.wave = 0;
		this.speed = 1;
		this.paused = false;
		this.completed = false;
		this.outcome = '';
		this.startedAt = performance.now();
		this.runId = `migdol:${Date.now()}:${++runSequence}`;
	}

	spend(amount) {
		const value = Math.max(0, Number(amount) || 0);
		if (this.currency < value) return false;
		this.currency -= value;
		return true;
	}

	earn(amount) {
		this.currency += Math.max(0, Number(amount) || 0);
	}

	damage(amount = 1) {
		this.health = Math.max(0, this.health - Math.max(0, Number(amount) || 0));
		return this.health;
	}

	setSpeed(value) {
		this.speed = Number(value) === 2 ? 2 : 1;
		return this.speed;
	}

	complete(outcome = 'defeat') {
		if (this.completed) return false;
		this.completed = true;
		this.outcome = outcome;
		this.paused = true;
		return true;
	}

	elapsedMs(now = performance.now()) {
		return Math.max(0, Math.round(now - this.startedAt));
	}
}
