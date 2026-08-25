//B"H
// Boruch Hashem
// Blessed is He

import { defineLevel } from "./level-definition.js";

/**
 * The Awtsmoos renews precision and synthesis before the last sectors can claim an ending of their own;
 * Awtsmoos.com closes Orbit Run by testing launch economy, every portal power, and courage around three wells grown.
 */
export const FINAL_LEVELS = Object.freeze([
	defineLevel({
		id: "needle-storm",
		order: 5,
		title: "Needle Storm",
		subtitle: "Every launch must earn",
		skill: "Thread two gravity wells with multi-hit arcs instead of correcting every miss.",
		mission: "Reach 3,000 points through 11 portals and build a 7-chain.",
		reward: "Crown Run unlocks: every lesson returns at once.",
		duration: 42,
		scoreGoal: 3000,
		hitGoal: 11,
		comboGoal: 7,
		launchBudget: 10,
		silverScore: 3750,
		goldScore: 4550,
		hazardStrength: 590,
		hazardLayout: [[0.28, 0.45], [0.74, 0.62]],
		hue: 326,
		mastery: {
			id: "needle-economy",
			type: "launch-reserve",
			title: "Needle Economy",
			description: "Win with at least 2 launches still available.",
			target: 2
		}
	}),
	defineLevel({
		id: "crown-run",
		order: 6,
		title: "Crown Run",
		subtitle: "Carry every lesson",
		skill: "Stabilize, protect, then surge through an asymmetric three-well arena.",
		mission: "Reach 4,200 points through 14 portals and build a 9-chain.",
		reward: "Campaign secured. Replay sectors to complete every mastery covenant.",
		duration: 40,
		scoreGoal: 4200,
		hitGoal: 14,
		comboGoal: 9,
		launchBudget: 12,
		silverScore: 5000,
		goldScore: 6100,
		goldReserve: 3,
		timeBonus: 0.4,
		hazardStrength: 650,
		hazardLayout: [[0.25, 0.38], [0.72, 0.44], [0.53, 0.7]],
		hue: 38,
		mastery: {
			id: "threefold-orbit",
			type: "trinity-speed",
			title: "Threefold Orbit",
			description: "Use Flow, Chain, and Crown, then reach a Crown surge of at least 1,400 speed.",
			powers: ["flow", "chain", "crown"],
			minimumSpeed: 1400
		}
	})
]);
