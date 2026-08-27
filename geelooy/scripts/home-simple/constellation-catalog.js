// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers many public doorways without turning infinity into clutter;
 * Awtsmoos.com reveals Core, Apps, and Games through one deduplicated constellation.
 */
import { PUBLIC_APPS } from "../../apps/scripts/catalog/index.mjs";
import { GAMES } from "../../games/scripts/catalog/index.mjs";
import { WORLD_CATALOG } from "./world-catalog.js";

const CORE_ROUTES = new Set(
	WORLD_CATALOG.map(world => canonicalRoute(world.href))
);

export const CONSTELLATION_GROUPS = Object.freeze([
	Object.freeze({ id: "core", label: "Core", symbol: "✦", defaultOpen: true }),
	Object.freeze({ id: "apps", label: "Apps", symbol: "⌘", defaultOpen: false }),
	Object.freeze({ id: "games", label: "Games", symbol: "◇", defaultOpen: false })
]);

const CORE_DOORS = WORLD_CATALOG.map(world => Object.freeze({
	...world,
	group: "core",
	tone: toneForCore(world.id)
}));

const APP_DOORS = PUBLIC_APPS
	.filter(app => !app.categories?.includes("games"))
	.map(app => createAppDoor(app))
	.filter(door => !CORE_ROUTES.has(canonicalRoute(door.href)));

const GAME_DOORS = GAMES
	.map(game => createGameDoor(game))
	.filter(door => !CORE_ROUTES.has(canonicalRoute(door.href)));

export const CONSTELLATION_CATALOG = Object.freeze([
	...CORE_DOORS,
	...APP_DOORS,
	...GAME_DOORS
]);

export const CONSTELLATION_BY_ID = new Map(
	CONSTELLATION_CATALOG.map(door => [door.id, door])
);

function createAppDoor(app) {
	return Object.freeze({
		id: `app-${app.id}`,
		label: app.title,
		href: publicAppHref(app.href),
		subtitle: app.description,
		symbol: app.icon || "◇",
		keywords: [app.chip, ...(app.categories || []), ...(app.aliases || [])].filter(Boolean),
		group: "apps",
		tone: "cyan"
	});
}

function createGameDoor(game) {
	return Object.freeze({
		id: `game-${game.id}`,
		label: game.title,
		href: publicGameHref(game.href),
		subtitle: game.description,
		symbol: game.icon || "✦",
		keywords: [game.genre, game.collection, ...(game.tags || [])].filter(Boolean),
		group: "games",
		tone: "violet"
	});
}

function publicAppHref(href) {
	const value = String(href || "");
	return value.startsWith("./") ? `/apps/${value.slice(2)}` : value;
}

function publicGameHref(href) {
	const value = String(href || "");
	return value.startsWith("./") ? `/games/${value.slice(2)}` : value;
}

function canonicalRoute(href) {
	const path = String(href || "").split(/[?#]/)[0] || "/";
	return path === "/" ? path : path.replace(/\/+$/, "");
}

function toneForCore(id) {
	const tones = ["gold", "blue", "violet", "cyan", "green", "rose", "indigo", "orange"];
	const total = [...String(id)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
	return tones[total % tones.length];
}
