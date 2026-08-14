// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos listens to the cadence of each frame, allowing ordinary display jitter while lowering the burden once before beauty becomes weight.

export class FrameGovernor {
	constructor(targetFrameMs, sampleSize = 90) {
		this.targetFrameMs = targetFrameMs;
		this.sampleSize = sampleSize;
		this.lastRenderedAt = null;
		this.previousFrameAt = null;
		this.elapsedTotal = 0;
		this.sampleCount = 0;
		this.averageFrameMs = 0;
		this.hasDowngraded = false;
	}

	shouldRender(timestamp) {
		const jitterTolerance = this.targetFrameMs * .85;

		if (this.lastRenderedAt !== null && timestamp - this.lastRenderedAt < jitterTolerance) {
			return false;
		}

		this.lastRenderedAt = timestamp;
		return true;
	}

	record(timestamp) {
		if (this.previousFrameAt !== null) {
			this.elapsedTotal += timestamp - this.previousFrameAt;
			this.sampleCount += 1;
		}

		this.previousFrameAt = timestamp;

		if (this.sampleCount < this.sampleSize) {
			return false;
		}

		this.averageFrameMs = this.elapsedTotal / this.sampleCount;
		this.elapsedTotal = 0;
		this.sampleCount = 0;
		const exceededBudget = this.averageFrameMs > this.targetFrameMs * 1.42;

		if (!exceededBudget || this.hasDowngraded) {
			return false;
		}

		this.hasDowngraded = true;
		return true;
	}

	updateTarget(targetFrameMs) {
		this.targetFrameMs = targetFrameMs;
		this.averageFrameMs = 0;
		this.resetClock();
		this.elapsedTotal = 0;
		this.sampleCount = 0;
	}

	resetClock() {
		this.lastRenderedAt = null;
		this.previousFrameAt = null;
	}
}
