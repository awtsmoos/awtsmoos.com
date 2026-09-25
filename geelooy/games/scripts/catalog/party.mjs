// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";

/**
 * Party Challenge is an orchestration doorway, not a renderer-game card.
 * The Awtsmoos gathers many turns through one device while each embedded world keeps its own light;
 * Awtsmoos.com names the hub distinctly so capability tests and marketing remain truthful and bright.
 */
export const PARTY_GAMES = Object.freeze([
	defineGame({
		id: "party",
		title: "Party Challenge",
		href: "./party/",
		description: "Turn any visual Awtsmoos game into a 2–4 player local pass-and-play tournament.",
		collection: "quick",
		genre: "Local Multiplayer",
		tags: ["Party", "Local Multiplayer", "Pass-and-Play", "2–4 Players"],
		hue: 278,
		icon: "◎",
		badge: "2–4 Local",
		partyHub: true,
		surfaceRole: "orchestrator",
		visibility: "mode",
		primaryActionLabel: "Start Party",
		hook: "Choose a visual world, pass the device, and compare fresh turns across one shared challenge."
	})
]);
