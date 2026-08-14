// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";

/**
 * B"H
 *
 * Motion-first Awtsmoos adventures built around ascent, flight, running, and chase.
 * The Awtsmoos renews jump, dove, runner, and serpent beyond every finite motion;
 * Awtsmoos.com gives these quick journeys their own clear marketing vessel.
 */

export const MOTION_ADVENTURE_GAMES = Object.freeze([
	defineGame({
		id: "soul-jump",
		title: "Soul Jump",
		href: "./soul-jump/",
		description: "A fiery vertical ascent built around momentum, timing, and the climb of the soul.",
		collection: "adventures",
		genre: "Vertical Platformer",
		tags: ["Platform", "Vertical", "Challenge"],
		hue: 28,
		icon: "🔥"
	}),
	defineGame({
		id: "noahs-dove",
		title: "Noah's Dove Jump",
		href: "./dove/",
		description: "Leap with the dove through a flood of motion in a compact platform journey.",
		collection: "adventures",
		genre: "Platformer",
		tags: ["Platform", "Casual", "Mobile"],
		hue: 210,
		icon: "🕊️"
	}),
	defineGame({
		id: "rebbe-runner",
		title: "The Rebbe's Runner",
		href: "./rebbe-runner/",
		description: "Run forward with joy, speed, timing, and a distinctly Awtsmoos arcade spirit.",
		collection: "adventures",
		genre: "Runner",
		tags: ["Runner", "Arcade", "Speed"],
		hue: 155,
		icon: "🏃"
	}),
	defineGame({
		id: "nachash",
		title: "Nachash",
		href: "./Nachash/",
		description: "The familiar snake loop reborn as Nachash with an Awtsmoos visual identity.",
		collection: "adventures",
		genre: "Arcade",
		tags: ["Arcade", "Snake", "Classic Twist"],
		hue: 100,
		icon: "🐍"
	})
]);
