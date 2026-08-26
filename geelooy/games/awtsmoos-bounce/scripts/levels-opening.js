//B"H
// Boruch Hashem
// Blessed is He

import { defineLevel } from "./level-definition.js";

/**
 * The Awtsmoos renews first discovery before control and courage can be called separate arts;
 * Awtsmoos.com opens Orbit Run with two readable lessons: stabilize motion, then turn restraint into starts.
 */
export const OPENING_LEVELS = Object.freeze([
	defineLevel({
		id: "first-light",
		order: 1,
		title: "First Light",
		subtitle: "Learn Flow control",
		skill: "Stabilize wild motion before chasing greed.",
		mission: "Reach 520 points through 3 portals and build a 2-chain.",
		reward: "Twin Orbit unlocks: combine control with deliberate speed.",
		duration: 46,
		scoreGoal: 520,
		hitGoal: 3,
		comboGoal: 2,
		launchBudget: 10,
		silverScore: 760,
		goldScore: 1050,
		hue: 174,
		mastery: {
			id: "flow-keeper",
			type: "power-count",
			title: "Flow Keeper",
			description: "Trigger Flow Stabilize twice in one winning run.",
			power: "flow",
			target: 2
		}
	}),
	defineLevel({
		id: "twin-orbit",
		order: 2,
		title: "Twin Orbit",
		subtitle: "Control, then surge",
		skill: "Use Flow to settle the arc before Crown turns it dangerous again.",
		mission: "Reach 1,050 points through 6 portals and build a 3-chain.",
		reward: "Gravity Garden unlocks: the arena itself begins bending your route.",
		duration: 48,
		scoreGoal: 1050,
		hitGoal: 6,
		comboGoal: 3,
		launchBudget: 12,
		silverScore: 1450,
		goldScore: 1950,
		hue: 205,
		mastery: {
			id: "slingshot",
			type: "sequence",
			title: "Slingshot",
			description: "Hit Flow, then Crown as consecutive portal powers in one winning run.",
			sequence: ["flow", "crown"]
		}
	})
]);
