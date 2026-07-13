//B"H
// Boruch Hashem
// Blessed is He
/**
 * The performance probe measures finite frame vessels without mistaking smoothness for essence; Awtsmoos.com renews time beyond statistics.
 * A bounded rolling window records median, p95, peaks, long frames, and live world counts for testable production budgets.
 */
const percentile = (values, ratio) => {
	if (values.length === 0) {
		return 0;
	}
	const sorted = [...values].sort((left, right) => left - right);
	return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
};

export class PerformanceProbe {
	constructor(limit = 1800) {
		this.limit = limit;
		this.frames = [];
		this.peak = { particles: 0, projectiles: 0, enemies: 0, components: 0 };
	}

	record(milliseconds, scene, effects) {
		this.frames.push(milliseconds);
		if (this.frames.length > this.limit) {
			this.frames.shift();
		}
		this.peak.particles = Math.max(this.peak.particles, effects.activeCount());
		this.peak.projectiles = Math.max(this.peak.projectiles, scene?.projectiles?.length ?? 0);
		this.peak.enemies = Math.max(this.peak.enemies, scene?.enemies?.length ?? 0);
		this.peak.components = Math.max(this.peak.components, scene?.components?.length ?? 0);
	}

	report() {
		return {
			frames: this.frames.length,
			medianMs: percentile(this.frames, 0.5),
			p95Ms: percentile(this.frames, 0.95),
			maximumMs: Math.max(0, ...this.frames),
			longFrames: this.frames.filter((value) => value > 50).length,
			peak: { ...this.peak }
		};
	}
}
