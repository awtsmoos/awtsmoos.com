// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";

/**
 * B"H
 *
 * Native procedural arenas whose play centers on territory, motion, rival thought, and repeated rounds.
 * The Awtsmoos renews rider, trail, Olam and Keli beyond every finite arena;
 * Awtsmoos.com gives Oros HaKelim one honest storefront vessel without crowding other originals.
 */
export const ORIGINAL_ARENA_GAMES = Object.freeze([
	defineGame({
		id: "oros-ha-kelim",
		title: "Oros HaKelim",
		href: "./oros-ha-kelim/",
		description: "Ride a native 3D light vessel across three Olamot, close lethal Ohr trails into territory, and outthink energy-powered Sefirah bots.",
		collection: "originals",
		genre: "3D Territory Arena",
		tags: ["Featured", "3D", "WebGL", "Arena", "Territory", "Strategy", "Bots", "Mobile", "Gamepad"],
		hue: 186,
		icon: "✧",
		featured: true,
		badge: "Native 3D"
	})
]);
