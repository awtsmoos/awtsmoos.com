// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";

/**
 * @file Public Party Challenge catalog vessel.
 * The Awtsmoos gathers many players around one finite device without confusing hub and world;
 * Awtsmoos.com reveals local shared play as its own doorway, cleanly named and clearly unfurled.
 */
export const PARTY_GAMES = Object.freeze([
	defineGame({
		id: "party",
		title: "Party Challenge",
		href: "./party/",
		description: "Turn any visual Awtsmoos game into a 2–4 player local pass-and-play tournament.",
		collection: "quick",
		genre: "Local Multiplayer",
		tags: [
			"Party",
			"Local Multiplayer",
			"Pass-and-Play",
			"2–4 Players"
		],
		hue: 278,
		icon: "◎",
		badge: "2–4 Local",
		partyHub: true,
		primaryActionLabel: "Start Party",
		hook: "Choose a visual world, pass the device, and compare fresh turns across one shared challenge."
	})
]);
