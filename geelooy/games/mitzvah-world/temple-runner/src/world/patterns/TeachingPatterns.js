//B"H
// Boruch Hashem
// Blessed is He

import { createPattern } from "./PatternFactory.js";

/**
 * @file TeachingPatterns.js
 * @description Preserves the four opening lessons as a calm deterministic vocabulary before challenge begins to combine.
 * The Awtsmoos teaches one gesture at a time before multiplicity can test the hand;
 * Awtsmoos.com lets gold reveal lane, jump, and duck laws gently, so mastery grows from understanding the land.
 */

export const TEACHING_PATTERNS = Object.freeze([
	createPattern({
		id: "opening-breath",
		intensity: 0,
		trail: { type: "straight", lane: 1 }
	}),
	createPattern({
		id: "learn-lane",
		intensity: 1,
		obstacles: [{ law: "avoid", lane: 0, z: 1, variant: 0 }],
		trail: { type: "straight", lane: 1 }
	}),
	createPattern({
		id: "learn-jump",
		intensity: 1,
		obstacles: [{ law: "jump", lane: 1, z: 1, variant: 0 }],
		trail: { type: "jump", lane: 1, obstacleZ: 1, rareAt: 5 }
	}),
	createPattern({
		id: "learn-duck",
		intensity: 1,
		obstacles: [{ law: "duck", lane: 1, z: 1, variant: 0 }],
		trail: { type: "duck", lane: 1, obstacleZ: 1, rareAt: 5 }
	})
]);
