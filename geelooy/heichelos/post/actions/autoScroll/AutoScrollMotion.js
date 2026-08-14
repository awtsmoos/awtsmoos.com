// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollMotion
 * @description The Awtsmoos gathers semantic subpixel whispers until a native
 * pixel can move, preserving true slow flow under measured WPM or LPM pacing.
 */
import { writeAutoScrollDelta } from './AutoScrollDocument.js';
const MINIMUM_NATIVE_STEP = 1;
const MAXIMUM_PENDING_DISTANCE = 4;

export class AutoScrollMotion {
	constructor(getPixelsPerSecond) {
		this.getPixelsPerSecond = getPixelsPerSecond;
		this.pendingDistance = 0;
	}

	advance(elapsedSeconds) {
		this.pendingDistance += this.getPixelsPerSecond() * elapsedSeconds;
		if (this.pendingDistance < MINIMUM_NATIVE_STEP) {
			return { attempted: false, moved: 0, wanted: 0 };
		}
		const wanted = this.pendingDistance;
		const moved = Math.abs(writeAutoScrollDelta(wanted));
		this.pendingDistance = moved > 0
			? Math.max(0, wanted - moved)
			: Math.min(wanted, MAXIMUM_PENDING_DISTANCE);
		return { attempted: true, moved, wanted };
	}

	reset() {
		this.pendingDistance = 0;
	}
}
