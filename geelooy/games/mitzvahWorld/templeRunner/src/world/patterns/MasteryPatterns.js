//B"H
// Boruch Hashem
// Blessed is He

import { createPattern } from "./PatternFactory.js";

/**
 * @file MasteryPatterns.js
 * @description Authors late-run choices where a safe escape remains open but golden trails invite richer skilled execution.
 * The Awtsmoos hides no unfair wall inside Gevurah; challenge is a choice the trained hand can see;
 * Awtsmoos.com lets mastery earn brighter Mammon while every phrase preserves a truthful path to flee.
 */

export const MASTERY_PATTERNS = Object.freeze([
	createPattern({
		id: "mastery-jump-choice",
		intensity: 3,
		obstacles: [
			{ law: "avoid", lane: 0, z: 0.8, variant: 4 },
			{ law: "jump", lane: 1, z: 0.8, variant: 1 }
		],
		trail: { type: "jump", lane: 1, obstacleZ: 0.8, rareAt: 5 }
	}),
	createPattern({
		id: "mastery-duck-choice",
		intensity: 3,
		obstacles: [
			{ law: "duck", lane: 1, z: 0.8, variant: 3 },
			{ law: "avoid", lane: 2, z: 0.8, variant: 2 }
		],
		trail: { type: "duck", lane: 1, obstacleZ: 0.8, rareAt: 5 }
	}),
	createPattern({
		id: "mastery-action-ladder",
		intensity: 4,
		obstacles: [
			{ law: "jump", lane: 0, z: -3.2, variant: 2 },
			{ law: "duck", lane: 2, z: 3.2, variant: 3 }
		],
		trail: {
			type: "sequence",
			lanes: [0, 0, 1, 2, 2],
			actions: ["normal", "jump", "normal", "duck", "normal"],
			rareAt: 7
		}
	}),
	createPattern({
		id: "mastery-center-vault",
		intensity: 4,
		obstacles: [
			{ law: "avoid", lane: 0, z: -2.7, variant: 3 },
			{ law: "avoid", lane: 2, z: -2.7, variant: 4 },
			{ law: "jump", lane: 1, z: 3.5, variant: 1 }
		],
		trail: {
			type: "sequence",
			lanes: [1, 1, 1, 1, 1],
			actions: ["normal", "normal", "normal", "jump", "normal"],
			rareAt: 7
		}
	}),
	createPattern({
		id: "mastery-cross-weave",
		intensity: 3,
		obstacles: [
			{ law: "avoid", lane: 0, z: -3.4, variant: 4 },
			{ law: "jump", lane: 2, z: 3.4, variant: 1 }
		],
		trail: { type: "slalom", lanes: [1, 2, 2, 1, 0] }
	}),
	createPattern({
		id: "mastery-duck-return",
		intensity: 4,
		obstacles: [
			{ law: "duck", lane: 2, z: -3.1, variant: 2 },
			{ law: "avoid", lane: 1, z: 3.7, variant: 4 }
		],
		trail: {
			type: "sequence",
			lanes: [2, 2, 1, 0, 0],
			actions: ["normal", "duck", "normal", "normal", "normal"],
			rareAt: 3
		}
	})
]);
