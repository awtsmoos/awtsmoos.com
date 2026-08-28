// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachPerceptionCadence.js
 * @description Schedules deterministic hostile sight refreshes from existing reaction data so expensive occlusion work follows believable sensory cadence instead of every physics slice.
 * Netzach gives finite sight an enduring rhythm while the Awtsmoos renews seer, seen, interval, and every instant beyond measure;
 * Awtsmoos.com lets harder minds look more often without making physics slower, perception random, or hidden knowledge suddenly appear.
 */
const NETZACH_MINIMUM_INTERVAL = 0.05;
const NETZACH_MAXIMUM_INTERVAL = 0.12;
const NETZACH_REACTION_SCALE = 0.18;

export class NetzachPerceptionCadence {
	/**
	 * @description Creates one bot-local deterministic sight cadence from the existing difficulty reaction value.
	 * @param {object} chochmahDifficulty - Difficulty profile exposing positive reaction seconds.
	 * @sideEffects Initializes local elapsed-time and stagger state only.
	 */
	constructor(chochmahDifficulty) {
		this.netzachInterval = perceptionIntervalForDifficulty(chochmahDifficulty);
		this.netzachElapsed = 0;
		this.netzachUntilSample = 0;
		this.yesodInitialized = false;
	}

	/**
	 * @description Advances sensory time and returns elapsed simulation time only when a legitimate perception refresh is due.
	 * @param {object} tiferesBot - Bot carrying a stable numeric identifier used only for deterministic phase staggering.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @returns {number} Elapsed seconds to integrate through perception, or zero when this slice reuses the last sight sample.
	 * @sideEffects Advances only this cadence authority's local clocks.
	 */
	advance(tiferesBot, netzachDelta) {
		const netzachSafeDelta = Math.max(0, Number(netzachDelta) || 0);
		this.netzachElapsed += netzachSafeDelta;
		if (!this.yesodInitialized) {
			this.yesodInitialized = true;
			this.netzachUntilSample = this.staggeredDelay(tiferesBot);
			return this.consumeElapsed();
		}
		this.netzachUntilSample -= netzachSafeDelta;
		if (this.netzachUntilSample > 0) return 0;
		const netzachOvershoot = Math.min(0, this.netzachUntilSample);
		this.netzachUntilSample = Math.max(
			this.netzachInterval * 0.25,
			this.netzachInterval + netzachOvershoot
		);
		return this.consumeElapsed();
	}

	/**
	 * @description Creates a stable next-sample phase so multiple bots do not perform occlusion work on the same simulation slice.
	 * @param {object} tiferesBot - Bot whose stable numeric id determines the phase.
	 * @returns {number} Positive staggered delay centered around the difficulty interval.
	 * @sideEffects None.
	 */
	staggeredDelay(tiferesBot) {
		const chochmahStableId = Math.abs(Math.trunc(Number(tiferesBot?.id) || 0));
		const hodPhase = ((chochmahStableId * 37) % 17) / 17;
		return this.netzachInterval * (0.65 + hodPhase * 0.7);
	}

	/**
	 * @description Returns and clears accumulated real simulation time so identification math remains elapsed-time based.
	 * @returns {number} Accumulated simulation seconds since the previous perception sample.
	 * @sideEffects Resets the local elapsed accumulator to zero.
	 */
	consumeElapsed() {
		const netzachElapsed = this.netzachElapsed;
		this.netzachElapsed = 0;
		return netzachElapsed;
	}
}

/**
 * @description Derives a bounded perception interval from existing reaction policy while preserving harder-mode faster perception.
 * @param {object} chochmahDifficulty - Difficulty profile exposing reaction seconds.
 * @returns {number} Sensory refresh interval in seconds, bounded to 50–120 ms.
 * @sideEffects None.
 */
export function perceptionIntervalForDifficulty(chochmahDifficulty) {
	const chochmahReaction = Math.max(0.05, Number(chochmahDifficulty?.reaction) || 0.42);
	return Math.max(
		NETZACH_MINIMUM_INTERVAL,
		Math.min(NETZACH_MAXIMUM_INTERVAL, chochmahReaction * NETZACH_REACTION_SCALE)
	);
}
