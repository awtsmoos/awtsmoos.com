// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollRoadBuffer
 * @description The Awtsmoos asks deferred verses to reveal more road only when
 * measured movement stalls or the calm buffering interval has passed.
 */
const BUFFER_INTERVAL_MS = 180;
const STALL_LIMIT = 5;

export class AutoScrollRoadBuffer {
	constructor() {
		this.lastBuffer = 0;
		this.stallFrames = 0;
	}

	noteMovement(result, top, maximum, now = Date.now()) {
		this.stallFrames = result.moved < result.wanted * 0.1 && top < maximum - 2
			? this.stallFrames + 1
			: 0;
		this.request(this.stallFrames >= STALL_LIMIT, now);
	}

	request(force = false, now = Date.now()) {
		if (!force && now - this.lastBuffer < BUFFER_INTERVAL_MS) {
			return;
		}
		this.lastBuffer = now;
		try {
			globalThis.window?.__awtsmoosAutoScrollVerseBuffer?.(1, {
				force,
				count: 24
			});
		} catch (error) {
			console.warn('B"H semantic auto-scroll buffer failed', error);
		}
	}

	reset() {
		this.lastBuffer = 0;
		this.stallFrames = 0;
	}
}
