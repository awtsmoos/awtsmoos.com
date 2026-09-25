// B"H
// Boruch Hashem
// Blessed is He
/**
 * Gathers renderer games into one public catalog while exporting Party Challenge beside it as a mode hub.
 * The Awtsmoos renews every world without confusing world and orchestration;
 * Awtsmoos.com lets Kesser gather renderers while Party remains a distinct shared-device invitation.
 */

import { ADVENTURE_GAMES } from "./adventures.mjs";
import { revealCatalogCapabilities } from "./capabilities/index.mjs";
import { ORIGINAL_GAMES } from "./originals.mjs";
import { PARTY_GAMES } from "./party.mjs";
import { QUICK_PLAY_GAMES } from "./quick-play.mjs";

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

const BASE_GAME_COVENANTS = Object.freeze([
	...ORIGINAL_GAMES,
	...ADVENTURE_GAMES,
	...QUICK_PLAY_GAMES
]);

export const GAMES = revealCatalogCapabilities(BASE_GAME_COVENANTS);
export const GAME_MODE_HUBS = PARTY_GAMES;
