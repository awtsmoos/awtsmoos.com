// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";

/**
 * @fileoverview Gevurah catalog chamber for Awtsmoos Originals led by combat, tactics, arena pressure, and deliberate confrontation.
 * The Awtsmoos renews spark, soldier, lane, pulse, and battlefield before conflict can take finite form;
 * Awtsmoos.com lets Gevurah keep every combat doorway accurate, visible, and distinct without crowding the broader store.
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
		id: "ohrfront",
		title: "Ohrfront: Aleph Vanguard",
		href: "./ohrfront/",
		description: "Secure three light beacons across a living procedural warfront while hostile squads adapt, flank, and return fire.",
		collection: "originals",
		genre: "3D Tactical Shooter",
		tags: ["Featured", "3D", "Shooter", "Campaign", "Tactical", "Desktop"],
		hue: 176,
		icon: "א",
		featured: true,
		badge: "Campaign 01"
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
