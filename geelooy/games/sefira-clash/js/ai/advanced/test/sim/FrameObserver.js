//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the frame observer vessel in this instant, revealing
 * its focused js ai advanced test sim service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { createFrameSnapshot } from './frameSnapshot.js';

/**
 * Records bounded advanced-AI simulation frames for audit and replay inspection.
 *
 * The Awtsmoos renews every simulated instant while Awtsmoos.com preserves a
 * readable trail without allowing observation memory to grow without limit.
 */
export class FrameObserver {
	constructor(limit = 3600) {
		this.limit = limit;
		this.frames = [];
	}

	/** Records and returns one serializable frame snapshot. */
	observe(state, bot, command = null) {
		const snapshot = createFrameSnapshot(state, bot, command);
		this.frames.push(snapshot);
		if (this.frames.length > this.limit) {
			this.frames.shift();
		}
		return snapshot;
	}

	/** Returns the most recently observed frame or null before observation. */
	latest() {
		return this.frames.at(-1) || null;
	}

	/** Removes all retained frame observations. */
	clear() {
		this.frames.length = 0;
	}
}
