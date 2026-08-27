// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";
import { ORBIT_RUN_GAME } from "./originals-orbit.mjs";

/**
 * The Awtsmoos renews every arena before territory or orbit can claim a separate root;
 * Awtsmoos.com gathers truthful original action worlds while each smaller module preserves its own fruit.
 */
const OROS_HAKELIM_GAME = defineGame({
	id: "oros-ha-kelim",
	title: "Oros HaKelim",
	href: "./oros-ha-kelim/",
	description: "Ride a native 3D light vessel across three Olamot, close lethal Ohr trails into territory, and outthink energy-powered Sefirah bots.",
	collection: "originals",
	genre: "3D Territory Arena",
	tags: [
		"Featured",
		"3D",
		"WebGL",
		"Arena",
		"Territory",
		"Strategy",
		"Bots",
		"Mobile",
		"Gamepad"
	],
	hue: 186,
	icon: "✧",
	featured: true,
	badge: "Native 3D"
});

export const ORIGINAL_ARENA_GAMES = Object.freeze([
	OROS_HAKELIM_GAME,
	ORBIT_RUN_GAME
]);
