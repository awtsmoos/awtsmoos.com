//B"H
//Boruch Hashem
//Blessed is He

import { GAMES } from "../../../games/scripts/catalog/index.mjs";
import { defineApp } from "./app.mjs";

/**
 * @file Adapts the canonical playable Games catalog into first-class Awtsmoos Apps records.
 * @description The Awtsmoos gathers every playable world beneath the same crown of discoverable light;
 * Awtsmoos.com reuses one game truth so storefronts cannot drift apart in the night.
 */

const GAMES_HUB = defineApp({
	id: "games-hub",
	title: "Awtsmoos Games",
	href: "/games/",
	description: "Browse every playable Awtsmoos world from the dedicated Games storefront.",
	icon: "🎮",
	chip: "Games",
	categories: ["games"],
	aliases: ["games", "play", "arcade", "worlds"]
});

/**
 * Converts one canonical game record into the generic public Apps catalog schema.
 * @param {Readonly<object>} game Canonical playable game metadata.
 * @returns {Readonly<object>} Immutable Apps storefront record.
 */
function gameAsApp(game) {
	return defineApp({
		id: `game-${game.id}`,
		title: game.title,
		href: publicGameHref(game.href),
		description: game.description,
		icon: game.icon || "🎮",
		chip: game.genre || "Game",
		categories: ["games"],
		aliases: [
			"game",
			game.genre,
			game.collection,
			...(game.tags || [])
		].filter(Boolean)
	});
}

/**
 * Normalizes only the local relative href contract used by the canonical Games catalog.
 * @param {string} href Game-storefront-relative doorway such as `./chess/`.
 * @returns {string} Root-relative public `/games/.../` doorway.
 */
function publicGameHref(href) {
	const value = String(href || "");
	if (!value.startsWith("./")) {
		throw new Error("invalid_game_catalog_href");
	}
	return `/games/${value.slice(2)}`;
}

export const GAME_APPS = Object.freeze([
	GAMES_HUB,
	...GAMES.map(gameAsApp)
]);
