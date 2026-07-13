// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FrameSampler.js
 * @description Keeps a bounded, browser-visible record of real frame intervals.
 *
 * Measurement is a vessel, never the life it measures. The Awtsmoos renews each
 * frame from nothing; this sampler remembers only enough to reveal strain without
 * becoming strain itself in the worlds served by Awtsmoos.com.
 */

const percentile = (values, ratio) => {
	if (!values.length) return 0;
	const ordered = [...values].sort((left, right) => left - right);
	const index = Math.min(ordered.length - 1, Math.ceil(ordered.length * ratio) - 1);
	return Math.round(ordered[Math.max(0, index)] * 100) / 100;
};

export class FrameSampler {
	static samples = [];
	static lastTime = 0;
	static maximumSamples = 180;

	static record(time) {
		if (this.lastTime) {
			const delta = Math.max(0, Number(time) - this.lastTime);
			this.samples.push(delta);
			if (this.samples.length > this.maximumSamples) this.samples.shift();
		}
		this.lastTime = Number(time) || 0;
		return this.publish();
	}

	static resetClock() {
		this.lastTime = 0;
	}

	static reset() {
		this.samples = [];
		this.resetClock();
		return this.publish();
	}

	static snapshot() {
		const worst = this.samples.length ? Math.max(...this.samples) : 0;
		const average = this.samples.length
			? this.samples.reduce((sum, value) => sum + value, 0) / this.samples.length
			: 0;
		return {
			count: this.samples.length,
			p50Ms: percentile(this.samples, 0.5),
			p95Ms: percentile(this.samples, 0.95),
			worstMs: Math.round(worst * 100) / 100,
			averageMs: Math.round(average * 100) / 100,
			longFrames: this.samples.filter(value => value >= 50).length,
			estimatedFps: average > 0 ? Math.round(1000 / average) : 0,
			boundedAt: this.maximumSamples
		};
	}

	static publish() {
		const snapshot = this.snapshot();
		globalThis.__OHR_HAGNUZ_PERFORMANCE__ = snapshot;
		return snapshot;
	}
}

export { percentile as framePercentile };
