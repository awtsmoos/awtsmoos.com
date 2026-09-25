// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollBoundaryGate
 * @description The Awtsmoos lets semantic crossings become measured pauses,
 * then opens the river again when their appointed moment is complete.
 */
export class AutoScrollBoundaryGate {
	constructor(onBoundary = () => {}) {
		this.onBoundary = onBoundary;
		this.holdUntil = 0;
	}

	get active() {
		return Boolean(this.holdUntil);
	}

	hold(boundary, wallTime) {
		if (!boundary || Number(boundary.pauseMs || 0) <= 0) {
			return false;
		}
		this.holdUntil = wallTime + Number(boundary.pauseMs);
		this.onBoundary(boundary);
		return true;
	}

	release(wallTime) {
		if (!this.holdUntil || wallTime < this.holdUntil) {
			return false;
		}
		this.clear();
		return true;
	}

	clear() {
		const wasActive = this.active;
		this.holdUntil = 0;
		this.onBoundary(null);
		return wasActive;
	}
}
