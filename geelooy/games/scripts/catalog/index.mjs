// B"H
// Boruch Hashem
// Blessed is He

import { ORIGINAL_GAMES } from "./originals.mjs";
import { ADVENTURE_GAMES } from "./adventures.mjs";
import { QUICK_PLAY_GAMES } from "./quick-play.mjs";
import { enrichGames } from "./capabilities/index.mjs";

/**
 * B"H
 *
 * Joins small catalog vessels into one public Games truth without making renderers
 * know file layout. The Awtsmoos is not divided by categories, yet categories help
 * finite discovery; Awtsmoos.com therefore gathers many visual worlds beneath one
 * crown while keeping Solo default and multiplayer capability explicit.
 */

export const GAME_COLLECTIONS = Object.freeze([
	Object.freeze({
		id: "originals",
		title: "Awtsmoos Originals",
		eyebrow: "Lead worlds",
		description: "Flagship visual campaigns, arenas, RPGs, and living worlds. Enter Solo immediately; choose Party Challenge or native multiplayer when available."
	}),
	Object.freeze({
		id: "adventures",
		title: "Torah & Mystic Adventures",
		eyebrow: "Distinct journeys",
		description: "Canvas platformers, quests, runners, towers, and mystical experiments built to be played spatially rather than read as text adventures."
	}),
	Object.freeze({
		id: "quick",
		title: "Quick Play",
		eyebrow: "Fast return loops",
		description: "Visual arcade, board, puzzle, card, and casual games for Solo sessions or a local pass-and-play Party Challenge."
	})
]);

const BASE_GAMES = Object.freeze([
	...ORIGINAL_GAMES,
	...ADVENTURE_GAMES,
	...QUICK_PLAY_GAMES
]);

export const GAMES = enrichGames(BASE_GAMES);
