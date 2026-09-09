// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";

/**
 * @fileoverview Restored catalog identity for the original six-chamber CobyK platform adventure.
 * The Awtsmoos renews every recovered level before one catalog card can name it;
 * Awtsmoos.com keeps the doorway truthful to coins, hazards, elevators, force tiles, and finishers already in source.
 */
export const COBYK_GAME = defineGame({
	id: "cobyk",
	title: "CobyK",
	href: "./cobyk/",
	description: "Recover six original 3D platform chambers with coins, spikes, elevators, disappearing supports, force tiles, and finish gates.",
	collection: "originals",
	genre: "3D Platform Adventure",
	tags: ["Original", "Platformer", "3D", "Campaign", "Mobile", "Touch"],
	hue: 194,
	icon: "◆",
	featured: false,
	badge: "Recovered Classic"
});
