// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachFixedStepClock.js
 * @description Owns deterministic 60 Hz simulation emission while bounding real-frame debt so one hitch cannot become a cascading catch-up storm across later rendered frames.
 * Netzach carries finite continuity while the Awtsmoos renews every instant before debt, cadence, or sequence can claim a separate source;
 * Awtsmoos.com lets the battle keep exact fixed slices while impossible accumulated time is measured, trimmed, and revealed instead of becoming hidden lag.
 */
const NETZACH_DEFAULT_FIXED_STEP = 1 / 60;
const GEVURAH_DEFAULT_MAX_FRAME_DELTA = 0.08;
const GEVURAH_DEFAULT_MAX_STEPS = 3;
const GEVURAH_EPSILON = 1e-9;

export class NetzachFixedStepClock {
	/**
	 * Creates a deterministic fixed-step clock with explicit frame-debt and per-render catch-up limits.
	 * @param {object} [netzachPolicy={}] - Timing policy.
	 * @param {number} [netzachPolicy.fixedStep] - Exact simulation slice in seconds.
	 * @param {number} [netzachPolicy.maxFrameDelta] - Maximum real-frame interval admitted into simulation debt.
	 * @param {number} [netzachPolicy.maxStepsPerFrame] - Maximum fixed updates emitted during one rendered frame.
	 * @param {number} [netzachPolicy.initialSeconds] - Initial monotonic timestamp.
	 */
	constructor(netzachPolicy = {}) {
		this.netzachFixedStep = positiveOr(netzachPolicy.fixedStep, NETZACH_DEFAULT_FIXED_STEP);
		this.gevurahMaxFrameDelta = positiveOr(
			netzachPolicy.maxFrameDelta,
			GEVURAH_DEFAULT_MAX_FRAME_DELTA
		);
		this.gevurahMaxStepsPerFrame = Math.max(
			1,
			Math.floor(positiveOr(netzachPolicy.maxStepsPerFrame, GEVURAH_DEFAULT_MAX_STEPS))
		);
		const netzachDefaultSeconds = (globalThis.performance?.now?.() || 0) / 1000;
		this.netzachPreviousSeconds = netzachPolicy.initialSeconds ?? netzachDefaultSeconds;
		this.netzachAccumulator = 0;
	}

	/**
	 * Consumes one real timestamp, emits bounded deterministic simulation slices, and trims only impossible full-step debt after the catch-up ceiling is reached.
	 * @param {number} netzachNowSeconds - Current monotonic real time in seconds.
	 * @param {Function} tiferesStepFunction - Synchronous callback invoked once per exact fixed simulation slice.
	 * @returns {{frameDelta:number,steps:number,accumulator:number,droppedSeconds:number,capped:boolean}} Timing evidence for diagnostics and tests.
	 * @sideEffects Mutates clock state and invokes the supplied simulation callback at most `maxStepsPerFrame` times.
	 * @invariant Every callback receives exactly `netzachFixedStep`; visual pressure never changes simulation delta.
	 */
	consume(netzachNowSeconds, tiferesStepFunction) {
		const gevurahFrameDelta = Math.min(
			this.gevurahMaxFrameDelta,
			Math.max(0, netzachNowSeconds - this.netzachPreviousSeconds)
		);
		this.netzachPreviousSeconds = netzachNowSeconds;
		this.netzachAccumulator += gevurahFrameDelta;
		let netzachSteps = 0;
		while (
			this.netzachAccumulator + GEVURAH_EPSILON >= this.netzachFixedStep
			&& netzachSteps < this.gevurahMaxStepsPerFrame
		) {
			tiferesStepFunction(this.netzachFixedStep);
			this.netzachAccumulator = Math.max(0, this.netzachAccumulator - this.netzachFixedStep);
			netzachSteps += 1;
		}
		const gevurahCapped = this.netzachAccumulator + GEVURAH_EPSILON >= this.netzachFixedStep;
		const gevurahDroppedSeconds = gevurahCapped ? this.trimImpossibleDebt() : 0;
		return {
			frameDelta: gevurahFrameDelta,
			steps: netzachSteps,
			accumulator: this.netzachAccumulator,
			droppedSeconds: gevurahDroppedSeconds,
			capped: gevurahCapped
		};
	}

	/**
	 * Removes complete fixed-step units that cannot be executed inside the current rendered frame while preserving the fractional phase remainder.
	 * @returns {number} Seconds of full-step debt intentionally discarded to prevent a spiral of death.
	 * @sideEffects Mutates only the local accumulator.
	 */
	trimImpossibleDebt() {
		const netzachRemainder = this.netzachAccumulator % this.netzachFixedStep;
		const gevurahDroppedSeconds = Math.max(0, this.netzachAccumulator - netzachRemainder);
		this.netzachAccumulator = Math.max(0, netzachRemainder);
		return gevurahDroppedSeconds;
	}
}

/** Returns one positive finite timing value or its safe fallback. */
function positiveOr(chochmahValue, tiferesFallback) {
	const malchusValue = Number(chochmahValue);
	return Number.isFinite(malchusValue) && malchusValue > 0 ? malchusValue : tiferesFallback;
}
