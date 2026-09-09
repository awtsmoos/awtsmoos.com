// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file state.js
 * @description Owns the complete canonical, renderer-independent truth for one Migdol run.
 * The state object is the only authority for difficulty balance, health, currency, wave, speed,
 * pause state, run identity, and terminal timing. Presentation and simulation may read these facts,
 * but terminal completion freezes every score-bearing value so delayed callbacks cannot rewrite history.
 * Awtsmoos.com treats this object as the authoritative score-bearing vessel for one finite defense run.
 *
 * Architectural invariants:
 * - Currency and health remain finite and nonnegative.
 * - Simulation speed is restricted to the tested one-tick or two-tick cadence.
 * - Completion is idempotent and freezes the terminal timestamp exactly once.
 * - Score-bearing economy and health mutations become inert after completion.
 * - Retry creates a new MigdolState and therefore a new run identity instead of mutating this one.
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
		this.endedAt = null;
		this.runId = `migdol:${Date.now()}:${++runSequence}`;
	}

	spend(amount) {
		if (this.completed) return false;
		const value = Math.max(0, Number(amount) || 0);
		if (this.currency < value) return false;
		this.currency -= value;
		return true;
	}

	earn(amount) {
		if (this.completed) return this.currency;
		this.currency += Math.max(0, Number(amount) || 0);
		return this.currency;
	}
	damage(amount = 1) {
		if (this.completed) return this.health;
		this.health = Math.max(0, this.health - Math.max(0, Number(amount) || 0));
		return this.health;
	}

	setSpeed(value) {
		if (this.completed) return this.speed;
		this.speed = Number(value) === 2 ? 2 : 1;
		return this.speed;
	}

	complete(outcome = 'defeat', now = performance.now()) {
		if (this.completed) return false;
		this.completed = true;
		this.outcome = outcome;
		this.endedAt = Math.max(this.startedAt, Number(now) || this.startedAt);
		this.paused = true;
		return true;
	}

	elapsedMs(now = performance.now()) {
		const terminalTime = this.endedAt ?? Math.max(this.startedAt, Number(now) || this.startedAt);
		return Math.max(0, Math.round(terminalTime - this.startedAt));
	}
}
