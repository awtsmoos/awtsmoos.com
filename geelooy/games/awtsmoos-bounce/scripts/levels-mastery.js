//B"H
// Boruch Hashem
// Blessed is He

import { defineLevel } from "./level-definition.js";

/**
 * The Awtsmoos renews gravity and protection before difficulty can masquerade as wisdom alone;
 * Awtsmoos.com makes the middle campaign teach curved intention and a Ward that matters when the floor has grown.
 */
export const MASTERY_LEVELS = Object.freeze([
	defineLevel({
		id: "gravity-garden",
		order: 3,
		title: "Gravity Garden",
		subtitle: "Bend around the well",
		skill: "Aim for where gravity will carry the orbit, not where the portal waits now.",
		mission: "Reach 1,550 points through 7 portals and build a 4-chain.",
		reward: "Chain Covenant unlocks: protection becomes an active tactical resource.",
		duration: 46,
		scoreGoal: 1550,
		hitGoal: 7,
		comboGoal: 4,
		launchBudget: 12,
		silverScore: 2050,
		goldScore: 2650,
		hazardStrength: 470,
		hazardLayout: [[0.52, 0.43]],
		hue: 252,
		mastery: {
			id: "clean-curve",
			type: "clean-floor",
			title: "Clean Curve",
			description: "Win without losing a live combo to an unwarded floor impact."
		}
	}),
	defineLevel({
		id: "chain-covenant",
		order: 4,
		title: "Chain Covenant",
		subtitle: "Spend the Ward wisely",
		skill: "Arm Chain Ward before a dangerous low orbit, then let protection preserve your greed.",
		mission: "Reach 2,200 points through 9 portals and build a 6-chain.",
		reward: "Needle Storm unlocks: efficiency matters as much as survival.",
		duration: 44,
		scoreGoal: 2200,
		hitGoal: 9,
		comboGoal: 6,
		launchBudget: 11,
		silverScore: 2850,
		goldScore: 3550,
		hazardStrength: 540,
		hazardLayout: [[0.5, 0.69]],
		hue: 292,
		mastery: {
			id: "ward-witness",
			type: "ward-save",
			title: "Ward Witness",
			description: "Have Chain Ward absorb at least one real combo-breaking floor contact.",
			target: 1
		}
	})
]);
