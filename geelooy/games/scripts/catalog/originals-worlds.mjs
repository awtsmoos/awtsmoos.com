// B"H
// Boruch Hashem
// Blessed is He

import { defineGame } from "./game.mjs";

/**
 * B"H
 *
 * Story, learning, and living-world Awtsmoos Originals. The Awtsmoos renews city,
 * journey, hidden light, scribe, and mitzvah world beyond every finite campaign;
 * Awtsmoos.com groups these worlds so long-form discovery has a clear vessel.
 */

export const ORIGINAL_WORLD_GAMES = Object.freeze([
	defineGame({
		id: "seven-mitzvos",
		title: "Seven Mitzvos",
		href: "./seven-mitzvos/",
		description: "Seven distinct games plus a preserved scenario world and Covenant City builder.",
		collection: "originals",
		genre: "Strategy Learning",
		tags: ["Featured", "Seven Games", "Strategy", "Learning", "Family", "Mobile"],
		hue: 38,
		icon: "⚖️",
		featured: true,
		badge: "Seven Worlds"
	}),
	defineGame({
		id: "city-of-light",
		title: "City of Light",
		href: "./city-of-light/",
		description: "A 24-chapter pilgrimage with missions, abilities, saves, weather, wildlife, and generated terrain.",
		collection: "originals",
		genre: "Story Adventure",
		tags: ["Featured", "Campaign", "Generated", "Story", "Mobile"],
		hue: 48,
		icon: "◇",
		featured: true,
		badge: "24 Chapters"
	}),
	defineGame({
		id: "ohr-hagnuz",
		title: "Ohr HaGnuz",
		href: "./ohr-hagnuz/",
		description: "A hidden-light RPG journey with campaign systems, shared travel, portals, and glowing mystery.",
		collection: "originals",
		genre: "RPG",
		tags: ["Featured", "RPG", "Campaign", "Journey"],
		hue: 52,
		icon: "💡",
		featured: true,
		badge: "RPG"
	}),
	defineGame({
		id: "scribe-journey",
		title: "The Scribe's Journey",
		href: "./scribe-journey/",
		description: "Letters, ink, combat, quests, saves, and a campaign road shaped around the life of a scribe.",
		collection: "originals",
		genre: "Story RPG",
		tags: ["Featured", "Story", "RPG", "Campaign"],
		hue: 28,
		icon: "✍️",
		featured: true,
		badge: "Story World"
	}),
	defineGame({
		id: "mitzvah-world",
		title: "Mitzvah World",
		href: "./mitzvahWorld/",
		description: "A wandering 3D mitzvah world with local RPG systems, community foundations, and an expanding simulation engine.",
		collection: "originals",
		genre: "World RPG",
		tags: ["Featured", "3D", "World", "RPG", "Community"],
		hue: 132,
		icon: "🌍",
		featured: true,
		badge: "Living World"
	})
]);
