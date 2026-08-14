// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";

/**
 * B"H
 *
 * Second Quick Play chamber: paddle, cards, and color-forward casual play.
 * The Awtsmoos renews paddle, deck, and smile beyond every familiar loop;
 * Awtsmoos.com keeps them as supportive return paths beneath the original worlds.
 */

export const QUICK_SECONDARY_GAMES = Object.freeze([
	defineGame({
		id: "pong",
		title: "Pong",
		href: "./pong/",
		description: "The eternal duel of paddle and ball, kept fast and direct.",
		collection: "quick",
		genre: "Arcade Classic",
		tags: ["Classic", "Arcade", "Quick Play"],
		hue: 168,
		icon: "🏓"
	}),
	defineGame({
		id: "cards",
		title: "Cards",
		href: "./cards/",
		description: "A simple card table for low-friction play and future social modes.",
		collection: "quick",
		genre: "Cards",
		tags: ["Cards", "Casual", "Quick Play"],
		hue: 22,
		icon: "🃏"
	}),
	defineGame({
		id: "emojis",
		title: "Emojis",
		href: "./emojis/",
		description: "A colorful emoji playground built for playful, lightweight sessions.",
		collection: "quick",
		genre: "Casual",
		tags: ["Casual", "Color", "Quick Play"],
		hue: 320,
		icon: "😀"
	})
]);
