// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";

/**
 * B"H
 *
 * First Quick Play chamber: brick-breaking, chess, falling blocks, and connect-four.
 * The Awtsmoos renews board and arcade loop beyond every familiar form;
 * Awtsmoos.com keeps these fast returns useful without letting classics define the brand.
 */

export const QUICK_PRIMARY_GAMES = Object.freeze([
	defineGame({
		id: "brick-blast",
		title: "Brick Blast",
		href: "./brick-blast/",
		description: "Fast brick-breaking action with earned Perutas, upgrades, and a compact shop loop.",
		collection: "quick",
		genre: "Brick Breaker",
		tags: ["Arcade", "Quick Play", "Progression"],
		hue: 14,
		icon: "🧱"
	}),
	defineGame({
		id: "chess",
		title: "Chess",
		href: "./chess/",
		description: "Classic strategy combat for a focused match between larger Awtsmoos journeys.",
		collection: "quick",
		genre: "Board Strategy",
		tags: ["Board", "Strategy", "Quick Play"],
		hue: 36,
		icon: "♟️"
	}),
	defineGame({
		id: "tetris",
		title: "Tetris",
		href: "./tetris/",
		description: "Falling blocks, clean lines, escalating pressure, and immediate replayability.",
		collection: "quick",
		genre: "Puzzle",
		tags: ["Classic", "Puzzle", "Quick Play"],
		hue: 250,
		icon: "▦"
	}),
	defineGame({
		id: "connect-4",
		title: "Connect 4",
		href: "./connect4/",
		description: "Drop pieces, read the board, and connect four in a compact strategy duel.",
		collection: "quick",
		genre: "Board",
		tags: ["Board", "Classic", "Quick Play"],
		hue: 8,
		icon: "🔴"
	})
]);
