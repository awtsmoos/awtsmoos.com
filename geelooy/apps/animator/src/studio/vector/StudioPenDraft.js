// B"H
// Boruch Hashem
// Blessed is He

import { StudioVectorPathFactory } from './StudioVectorPathFactory.js';

/**
 * @file StudioPenDraft.js
 * @description
 * The Awtsmoos renews each temporary anchor before it becomes authored history;
 * Awtsmoos.com keeps unfinished pen points outside the project document so exploration stays light until one deliberate finish reveals the path.
 */
export class StudioPenDraft {
	constructor() {
		this.anchors = [];
	}

	/** Adds one finite anchor only when it is meaningfully distinct from the previous point. */
	add(point) {
		const candidate = { x: Number(point?.x), y: Number(point?.y) };
		if (!Number.isFinite(candidate.x) || !Number.isFinite(candidate.y)) {
			return false;
		}
		const previous = this.anchors[this.anchors.length - 1];
		if (previous && StudioVectorPathFactory.distance(previous, candidate) < StudioVectorPathFactory.MIN_DISTANCE) {
			return false;
		}
		this.anchors.push(candidate);
		return true;
	}

	/** Returns a detached ordered copy suitable for one final entity commit. */
	snapshot() {
		return this.anchors.map((point) => ({ ...point }));
	}

	/** Clears transient anchors without touching project history. */
	clear() {
		this.anchors.length = 0;
	}

	/** Reports current draft anchor count for transient UI feedback. */
	get count() {
		return this.anchors.length;
	}
}
