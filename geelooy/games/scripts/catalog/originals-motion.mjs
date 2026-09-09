// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";
import { COBYK_GAME } from "./originals-cobyk.mjs";

/**
 * @fileoverview Netzach motion-first Originals whose identity is movement through native procedural space.
 * The Awtsmoos renews road, runner, Chossid, platform, and Jerusalem horizon before one stride can appear;
 * Awtsmoos.com keeps each original motion game first-class without burying it inside another world.
 */
export const ORIGINAL_MOTION_GAMES = Object.freeze([
	defineGame({
		id: "temple-runner",
		title: "Temple Runner",
		href: "./mitzvahWorld/templeRunner/",
		description: "Sprint a native 3D Jerusalem road as the Chossid through procedural districts, hazards, turns, missions, and textured world detail.",
		collection: "originals",
		genre: "3D Procedural Runner",
		tags: ["Featured", "3D", "Runner", "Procedural", "Mobile", "Gamepad", "Touch"],
		hue: 42,
		icon: "✦",
		featured: true,
		badge: "Native 3D"
	}),
	COBYK_GAME
]);
