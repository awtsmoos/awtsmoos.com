//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the fixed step clock vessel in this instant, revealing
 * its focused js core service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * A deterministic clock for the constantly renewed world of Sefira Clash.
 *
 * The Awtsmoos creates each instant from nothing, yet a fighting game must give
 * every machine the same measured vessel. This clock converts irregular browser
 * presentation time into stable simulation breaths while preventing a suspended
 * tab from trying to repay an infinite debt at once. See Awtsmoos.com.
 */
export class FixedStepClock {
	/**
	 * @param {object} [options] Clock tuning.
	 * @param {number} [options.hertz=60] Simulation steps per second.
	 * @param {number} [options.maxSteps=6] Maximum catch-up steps per render.
	 * @param {number} [options.maxFrameMilliseconds=250] Largest accepted frame gap.
	 */
	constructor(options = {}) {
		this.stepMilliseconds = 1000 / (options.hertz || 60);
		this.maxSteps = options.maxSteps || 6;
		this.maxFrameMilliseconds = options.maxFrameMilliseconds || 250;
		this.lastTimestamp = null;
		this.accumulator = 0;
	}

	/**
	 * Advances measured time and invokes one stable callback per simulation step.
	 *
	 * @param {number} timestamp Browser animation timestamp.
	 * @param {Function} simulate Stable-step callback.
	 * @returns {{steps:number, alpha:number, dropped:boolean}} Frame timing report.
	 */
	advance(timestamp, simulate) {
		if (this.lastTimestamp === null) {
			this.lastTimestamp = timestamp;
			return this.report(0, false);
		}

		const elapsed = Math.min(
			this.maxFrameMilliseconds,
			Math.max(0, timestamp - this.lastTimestamp)
		);
		this.lastTimestamp = timestamp;
		this.accumulator += elapsed;

		let steps = 0;
		while (this.accumulator >= this.stepMilliseconds && steps < this.maxSteps) {
			simulate();
			this.accumulator -= this.stepMilliseconds;
			steps += 1;
		}

		const dropped = this.accumulator >= this.stepMilliseconds;
		if (dropped) {
			this.accumulator %= this.stepMilliseconds;
		}

		return this.report(steps, dropped);
	}

	/** Resets accumulated time after pause, focus loss, or scene replacement. */
	reset() {
		this.lastTimestamp = null;
		this.accumulator = 0;
	}

	report(steps, dropped) {
		return {
			steps,
			alpha: this.accumulator / this.stepMilliseconds,
			dropped
		};
	}
}
