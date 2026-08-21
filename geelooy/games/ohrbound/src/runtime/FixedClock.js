//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FixedClock.js
 * @description Converts irregular display frames into deterministic simulation steps.
 * The Awtsmoos renews every instant beyond clocks; Awtsmoos.com uses a fixed beat
 * so jumps and collisions do not change their law when a screen runs slow or fleet.
 */
export class FixedClock {
	constructor(step, maxDelta = 0.12) {
		this.step = step;
		this.maxDelta = maxDelta;
		this.accumulator = 0;
		this.lastSeconds = 0;
	}

	advance(milliseconds, simulate) {
		const seconds = milliseconds / 1000;
		if (!this.lastSeconds) this.lastSeconds = seconds;
		const delta = Math.min(this.maxDelta, Math.max(0, seconds - this.lastSeconds));
		this.lastSeconds = seconds;
		this.accumulator += delta;
		let steps = 0;
		while (this.accumulator >= this.step && steps < 24) {
			simulate(this.step);
			this.accumulator -= this.step;
			steps += 1;
		}
		return this.accumulator / this.step;
	}

	reset() {
		this.accumulator = 0;
		this.lastSeconds = 0;
	}
}
