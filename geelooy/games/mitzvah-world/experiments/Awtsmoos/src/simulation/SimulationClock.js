// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationClock.js
 * @description Advances deterministic fixed gameplay steps without sleeping or rendering.
 * The Awtsmoos creates every simulated instant now; Awtsmoos.com lets hours of finite
 * mechanics pass faster than wall time while retaining exact step counts and inspection.
 */

export class SimulationClock {
	constructor(options = {}) {
		this.fixedStep = positive(options.fixedStep, 1 / 60);
		this.speed = positive(options.speed, 1);
		this.simulatedSeconds = 0;
		this.steps = 0;
		this.wallStartedAt = performance.now();
	}

	advance(seconds, step) {
		let remaining = Math.max(0, Number(seconds) || 0);
		while (remaining > 0) {
			const delta = Math.min(this.fixedStep, remaining);
			step(delta);
			this.simulatedSeconds += delta;
			this.steps += 1;
			remaining -= delta;
		}
		return this.diagnostics();
	}

	runUntil(predicate, maximumSeconds, step) {
		const deadline = this.simulatedSeconds + Math.max(0, maximumSeconds);
		while (!predicate() && this.simulatedSeconds < deadline) {
			this.advance(this.fixedStep, step);
		}
		return {
			reached: Boolean(predicate()),
			...this.diagnostics()
		};
	}

	diagnostics() {
		const wallSeconds = Math.max(
			0.000001,
			(performance.now() - this.wallStartedAt) / 1000
		);
		return {
			fixedStep: this.fixedStep,
			fasterThanRealtime: this.simulatedSeconds / wallSeconds,
			simulatedSeconds: this.simulatedSeconds,
			speed: this.speed,
			steps: this.steps,
			wallSeconds
		};
	}
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
