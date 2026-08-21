// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PatternBook.js
 * @description Declares deterministic readable obstacle phrases and teaching trail instructions.
 * The Awtsmoos renews challenge before each obstacle becomes a lesson in the lane;
 * Awtsmoos.com lets perutas reveal the safe sentence, so difficulty grows without becoming vain.
 */

const PATTERNS = Object.freeze([
	Object.freeze({
		obstacles: [],
		trail: Object.freeze({ type: "straight", lane: 1 })
	}),
	Object.freeze({
		obstacles: Object.freeze([{ law: "avoid", lane: 0, z: 1, variant: 0 }]),
		trail: Object.freeze({ type: "straight", lane: 1 })
	}),
	Object.freeze({
		obstacles: Object.freeze([{ law: "jump", lane: 1, z: 1, variant: 0 }]),
		trail: Object.freeze({ type: "jump", lane: 1, obstacleZ: 1 })
	}),
	Object.freeze({
		obstacles: Object.freeze([{ law: "duck", lane: 1, z: 1, variant: 0 }]),
		trail: Object.freeze({ type: "duck", lane: 1, obstacleZ: 1 })
	}),
	Object.freeze({
		obstacles: Object.freeze([
			{ law: "avoid", lane: 0, z: -2.6, variant: 1 },
			{ law: "avoid", lane: 2, z: 3.3, variant: 2 }
		]),
		trail: Object.freeze({ type: "slalom", lanes: [1, 2, 1, 0, 1] })
	}),
	Object.freeze({
		obstacles: Object.freeze([
			{ law: "avoid", lane: 0, z: 1.2, variant: 3 },
			{ law: "avoid", lane: 2, z: 1.2, variant: 4 }
		]),
		trail: Object.freeze({ type: "straight", lane: 1, rareAt: 5 })
	}),
	Object.freeze({
		obstacles: Object.freeze([
			{ law: "jump", lane: 1, z: -2.5, variant: 2 },
			{ law: "avoid", lane: 1, z: 5.0, variant: 1 }
		]),
		trail: Object.freeze({ type: "jumpShift", fromLane: 1, toLane: 2, obstacleZ: -2.5 })
	}),
	Object.freeze({
		obstacles: Object.freeze([
			{ law: "duck", lane: 2, z: -2.2, variant: 3 },
			{ law: "avoid", lane: 2, z: 5.3, variant: 0 }
		]),
		trail: Object.freeze({ type: "duckShift", fromLane: 2, toLane: 1, obstacleZ: -2.2 })
	}),
	Object.freeze({
		obstacles: Object.freeze([
			{ law: "avoid", lane: 0, z: -3.4, variant: 4 },
			{ law: "jump", lane: 2, z: 3.4, variant: 1 }
		]),
		trail: Object.freeze({ type: "slalom", lanes: [1, 2, 2, 1, 0] })
	})
]);

export class GevurahPatternBook {
	/** @param {number} generationIndex Monotonic chunk generation index. @returns {object} Read-only pattern. */
	get(generationIndex) {
		const safeIndex = Math.max(0, generationIndex);
		if (safeIndex < 4) return PATTERNS[safeIndex];
		return PATTERNS[1 + (safeIndex - 4) % (PATTERNS.length - 1)];
	}

	/** @returns {number} Number of authored deterministic pattern phrases. */
	get count() {
		return PATTERNS.length;
	}
}
