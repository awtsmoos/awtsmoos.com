// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";

/**
 * B"H
 *
 * Action-facing Awtsmoos Originals that lead with combat, strategy, or arena play.
 * The Awtsmoos renews spark, fighter, lane, and sound beyond every mechanic;
 * Awtsmoos.com keeps these worlds together so their marketing promise stays sharp.
 */

export const ORIGINAL_COMBAT_GAMES = Object.freeze([
	defineGame({
		id: "merkava",
		title: "Merkava — War of the Sparks",
		href: "./Merkava/",
		description: "Choose lanes, build an army, gather Prutahs, and cross five worlds in campaign or endless war.",
		collection: "originals",
		genre: "Strategy Action",
		tags: ["Featured", "Campaign", "Strategy", "Action", "Desktop"],
		hue: 272,
		icon: "✦",
		featured: true,
		badge: "Flagship"
	}),
	defineGame({
		id: "sefira-clash",
		title: "Sefira Clash",
		href: "./sefira-clash/",
		description: "Mystical arena combat, expeditions, huge maps, bots, power-ups, and multiplayer systems.",
		collection: "originals",
		genre: "Arena Fighter",
		tags: ["Featured", "Fighting", "Expedition", "Multiplayer", "Mobile"],
		hue: 44,
		icon: "👊",
		featured: true,
		badge: "Original"
	}),
	defineGame({
		id: "nitzotz-io",
		title: "Nitzotz.io",
		href: "./nitzotz-io/",
		description: "Reveal hidden sparks, grow the vessel, and move through a raw WebGL social arena.",
		collection: "originals",
		genre: "WebGL Arena",
		tags: ["Featured", "WebGL", "Social", "Mobile"],
		hue: 212,
		icon: "🕯️",
		featured: true,
		badge: "Original"
	}),
	defineGame({
		id: "shema-strike",
		title: "Shema Strike",
		href: "./shema-strike/",
		description: "Fight through gates with sacred sound, a forge, equipment progression, and earned Prutah loops.",
		collection: "originals",
		genre: "Action",
		tags: ["Featured", "Action", "Progression", "Forge"],
		hue: 190,
		icon: "⚡",
		featured: true,
		badge: "Original"
	})
]);
