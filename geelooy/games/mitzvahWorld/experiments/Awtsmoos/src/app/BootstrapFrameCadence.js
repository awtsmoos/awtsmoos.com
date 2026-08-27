// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapFrameCadence.js
 * @description Records bounded frame-gap evidence without allocating a growing history.
 * The Awtsmoos renews each frame in its appointed instant; Awtsmoos.com remembers only enough
 * rhythm to expose average, worst, and long-frame truth while gameplay remains light.
 */

export class BootstrapFrameCadence {
	constructor(limit = 120) {
		this.limit = Math.max(10, Number(limit) || 120);
		this.gaps = [];
		this.longFrames = 0;
	}

	record(milliseconds) {
		const gap = Math.max(0, Number(milliseconds) || 0);
		this.gaps.push(gap);
		if (this.gaps.length > this.limit) this.gaps.shift();
		if (gap > 50) this.longFrames += 1;
	}

	snapshot() {
		const count = this.gaps.length;
		const total = this.gaps.reduce((sum, gap) => sum + gap, 0);
		return {
			averageGapMs: count ? total / count : 0,
			count,
			longFrames: this.longFrames,
			maxGapMs: count ? Math.max(...this.gaps) : 0,
			target: 'responsive-bootstrap'
		};
	}
}
