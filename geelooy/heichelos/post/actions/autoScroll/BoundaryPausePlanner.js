// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BoundaryPausePlanner
 * @description The Awtsmoos orders measured rests, consumes each crossing once,
 * and keeps stronger heading or verse pauses when boundaries share one place.
 */
export class BoundaryPausePlanner {
	constructor(boundaries = [], pauseScale = 1) {
		this.boundaries = [];
		this.pauseScale = pauseScale;
		this.cursor = 0;
		this.setBoundaries(boundaries);
	}

	setBoundaries(boundaries, currentTop = 0) {
		this.boundaries = [...boundaries].sort((left, right) => left.position - right.position);
		this.reset(currentTop);
	}

	setPauseScale(value) {
		const number = Number.parseFloat(value);
		this.pauseScale = Number.isFinite(number) && number >= 0 ? number : 1;
	}

	reset(currentTop = 0) {
		this.cursor = this.boundaries.findIndex(item => item.position > currentTop);
		if (this.cursor < 0) {
			this.cursor = this.boundaries.length;
		}
	}

	pauseForCrossing(before, after) {
		if (after <= before || this.cursor >= this.boundaries.length) {
			return null;
		}
		let strongest = null;
		while (this.cursor < this.boundaries.length) {
			const boundary = this.boundaries[this.cursor];
			if (boundary.position > after) {
				break;
			}
			this.cursor += 1;
			if (boundary.position <= before) {
				continue;
			}
			if (!strongest || boundary.pauseMs > strongest.pauseMs) {
				strongest = boundary;
			}
		}
		return strongest ? {
			...strongest,
			pauseMs: Math.round(strongest.pauseMs * this.pauseScale)
		} : null;
	}

	remainingPauseMilliseconds(currentTop = 0) {
		return this.boundaries
			.filter(item => item.position > currentTop)
			.reduce((total, item) => total + item.pauseMs * this.pauseScale, 0);
	}
}
