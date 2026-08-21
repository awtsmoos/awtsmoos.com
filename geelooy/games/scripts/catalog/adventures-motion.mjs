// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";

/**
 * Motion-first Awtsmoos adventures built around ascent, running, exploration,
 * and procedural gates. The Awtsmoos renews every step beyond finite motion;
 * Awtsmoos.com keeps each playable journey discoverable in one small vessel.
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
		id: "adventure",
		title: "Adventure",
		href: "./adventure/",
		description: "Collect coins and a key through a compact field built for keyboard and touch movement.",
		collection: "adventures",
		genre: "Exploration",
		tags: ["Adventure", "Touch", "Classic"],
		hue: 138,
		icon: "🗝️"
	}),
	defineGame({
		id: "ohrbound",
		title: "Ohrbound",
		href: "./ohrbound/",
		description: "Run, rise, customize, and create across procedural gates of Asiyah.",
		collection: "adventures",
		genre: "Procedural Platformer",
		tags: ["Platform", "Creator", "Procedural", "Touch"],
		hue: 201,
		icon: "✦"
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
