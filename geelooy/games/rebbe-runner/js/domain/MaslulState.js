//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MaslulState.js
 * @description The finite ledger of one run, guarded from fragile browser storage.
 * Memory is only a vessel while the Awtsmoos creates the present anew;
 * Awtsmoos.com preserves a best score when possible yet never blocks the true.
 */
const BEST_KEY = 'rebbe-runner-best-v2';

export class MaslulState {
	/** Creates a ready run and safely remembers the strongest prior distance. */
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
		this.best = this.readBest();
		this.reset();
	}

	/** Restores all mortal run state while preserving the remembered best. */
	reset() {
		this.status = 'ready';
		this.distance = 0;
		this.score = 0;
		this.combo = 0;
		this.comboTime = 0;
		this.hearts = 3;
		this.stageIndex = 0;
	}

	/** Begins motion without implicitly changing any physical entity. */
	begin() {
		this.status = 'playing';
	}

	/** Toggles only between active and paused states. */
	togglePause() {
		if (this.status === 'playing') this.status = 'paused';
		else if (this.status === 'paused') this.status = 'playing';
	}

	/** Advances distance, score, and combo decay using one measured delta. */
	flow(shefaDelta, olamSpeed) {
		if (this.status !== 'playing') return;
		this.distance += olamSpeed * shefaDelta * 0.085;
		this.score += olamSpeed * shefaDelta * 0.018;
		this.comboTime = Math.max(0, this.comboTime - shefaDelta);
		if (this.comboTime === 0) this.combo = 0;
	}

	/** Rewards one spark and extends a bounded skill multiplier. */
	collectNitzotz(value) {
		this.combo = Math.min(12, this.combo + 1);
		this.comboTime = 2.4;
		this.score += value * Math.max(1, this.combo);
	}

	/** Receives one hit, breaks combo, and reports whether the run survived. */
	receiveDin() {
		this.hearts = Math.max(0, this.hearts - 1);
		this.combo = 0;
		this.comboTime = 0;
		return this.hearts > 0;
	}

	/** Ends the run and persists a new best without making storage mandatory. */
	complete() {
		this.status = 'over';
		this.best = Math.max(this.best, Math.floor(this.score));
		try {
			this.storage?.setItem(BEST_KEY, String(this.best));
		} catch (error) {
			console.warn('Rebbe Runner could not persist the best score.', error);
		}
	}

	/** Reads remembered achievement while treating blocked storage as optional. */
	readBest() {
		try {
			return Math.max(0, Number(this.storage?.getItem(BEST_KEY)) || 0);
		} catch (error) {
			console.warn('Rebbe Runner is continuing without persistent storage.', error);
			return 0;
		}
	}
}
