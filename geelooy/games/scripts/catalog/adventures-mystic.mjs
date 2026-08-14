// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";

/**
 * B"H
 *
 * Mystic, soul, and tower-oriented Awtsmoos adventures. The Awtsmoos renews ladder,
 * intention, soul, vessel, and tower beyond every finite mechanic; Awtsmoos.com
 * keeps these worlds together so their distinctive promise stays legible.
 */

export const MYSTIC_ADVENTURE_GAMES = Object.freeze([
	defineGame({
		id: "sulam-ha-sod",
		title: "Sulam HaSod",
		href: "./sulam-ha-sod/",
		description: "Climb chambers of the secret ladder through demanding platform routes and a layered Shefa economy.",
		collection: "adventures",
		genre: "Platform Adventure",
		tags: ["Platform", "Mystic", "Challenge", "Preview"],
		hue: 280,
		icon: "🪜",
		badge: "Preview"
	}),
	defineGame({
		id: "kavanah",
		title: "KAVANAH",
		href: "./KAVANAH/",
		description: "A luminous world of focus, intention, atmosphere, and deliberate play.",
		collection: "adventures",
		genre: "Mystic Experience",
		tags: ["Mystic", "Atmosphere", "Focus"],
		hue: 205,
		icon: "🎯"
	}),
	defineGame({
		id: "neshama-quest",
		title: "Neshama Quest",
		href: "./neshama-quest/",
		description: "Move through soul-world challenges in an original quest-driven adventure.",
		collection: "adventures",
		genre: "Adventure",
		tags: ["Adventure", "Quest", "Soul"],
		hue: 265,
		icon: "✨"
	}),
	defineGame({
		id: "kabbalah-shooter",
		title: "Kabbalah Shooter",
		href: "./kabbalah-shooter/",
		description: "Arcade shooting transformed through vessels, mystical imagery, and challenge-driven action.",
		collection: "adventures",
		genre: "Shooter",
		tags: ["Shooter", "Arcade", "Action"],
		hue: 300,
		icon: "🌌"
	}),
	defineGame({
		id: "migdol",
		title: "Migdol",
		href: "./migdol/",
		description: "Build, climb, earn Perutas, and confront the pressure of the tower.",
		collection: "adventures",
		genre: "Arcade Adventure",
		tags: ["Arcade", "Tower", "Progression"],
		hue: 70,
		icon: "🗼"
	})
]);
