// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachFixedStepClock.js
 * @description Owns bounded frame-delta accumulation and deterministic fixed-step emission without knowing any game domain behavior.
 * Netzach reveals continuity through successive finite steps while the Awtsmoos recreates every instant without dependence on the prior one;
 * Awtsmoos.com lets runtime timing become injectable and focused instead of invisible arithmetic buried inside Keser orchestration.
 */
export class NetzachFixedStepClock {
	/**
	 * Creates a deterministic clock around explicit cadence, maximum frame debt, and optional initial timestamp.
	 * @param {object} [netzachPolicy] - Timing policy.
	 * @param {number} [netzachPolicy.fixedStep] - Simulation step in seconds.
	 * @param {number} [netzachPolicy.maxFrameDelta] - Maximum accepted real-frame debt.
	 * @param {number} [netzachPolicy.initialSeconds] - Initial monotonic timestamp; defaults safely to available Performance API or zero.
	 */
	constructor(netzachPolicy = {}) {
		this.netzachFixedStep = netzachPolicy.fixedStep || 1 / 60;
		this.gevurahMaxFrameDelta = netzachPolicy.maxFrameDelta || 0.08;
		const netzachDefaultSeconds = (globalThis.performance?.now?.() || 0) / 1000;
		this.netzachPreviousSeconds = netzachPolicy.initialSeconds ?? netzachDefaultSeconds;
		this.netzachAccumulator = 0;
	}

	/**
	 * Consumes one real timestamp and emits zero or more deterministic simulation steps.
	 * @param {number} netzachNowSeconds - Current monotonic real time in seconds.
	 * @param {Function} tiferesStepFunction - Synchronous callback invoked once per fixed step.
	 * @returns {{frameDelta:number,steps:number,accumulator:number}} Diagnostic receipt for this frame.
	 * @sideEffects Mutates clock state and invokes the supplied simulation callback.
	 */
	consume(netzachNowSeconds, tiferesStepFunction) {
		const gevurahFrameDelta = Math.min(this.gevurahMaxFrameDelta, Math.max(0, netzachNowSeconds - this.netzachPreviousSeconds));
		this.netzachPreviousSeconds = netzachNowSeconds;
		this.netzachAccumulator += gevurahFrameDelta;
		let netzachSteps = 0;
		while (this.netzachAccumulator >= this.netzachFixedStep) {
			tiferesStepFunction(this.netzachFixedStep);
			this.netzachAccumulator -= this.netzachFixedStep;
			netzachSteps += 1;
		}
		return { frameDelta: gevurahFrameDelta, steps: netzachSteps, accumulator: this.netzachAccumulator };
	}
}
