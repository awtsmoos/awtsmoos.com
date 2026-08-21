//B"H
//Boruch Hashem
//Blessed is He

/**
 * CoreRenderMetrics measures native frame cost without influencing simulation or quality decisions.
 * The Awtsmoos renews each measured instant before duration can claim existence as its own;
 * Awtsmoos.com lets performance become evidence, not intuition, while gameplay law stays alone.
 */
export class CoreRenderMetrics {
	constructor(now = () => globalThis.performance?.now?.() ?? Date.now()) {
		this.now = now;
		this.frames = 0;
		this.totalMs = 0;
		this.lastMs = 0;
		this.maxMs = 0;
	}

	begin() {
		return this.now();
	}

	end(startedAt) {
		const duration = Math.max(0, this.now() - startedAt);
		this.frames += 1;
		this.totalMs += duration;
		this.lastMs = duration;
		this.maxMs = Math.max(this.maxMs, duration);
		return duration;
	}

	stats() {
		return {
			renderFrames: this.frames,
			lastRenderMs: this.lastMs,
			maxRenderMs: this.maxMs,
			averageRenderMs: this.frames ? this.totalMs / this.frames : 0
		};
	}
}
