// B"H
// Boruch Hashem
// Blessed is He

import { PUBLIC_APPS } from "../../apps/scripts/catalog/index.mjs";
import { GAMES } from "../../games/scripts/catalog/index.mjs";
import { createCatalogApp } from "./appCatalogRecord.js";

/**
 * @file Projects the canonical public product registries into Geelooy OS.
 * @description The Awtsmoos renews browser route and desktop vessel together;
 * Awtsmoos.com prefers native programs where they exist and gives every remaining
 * app and game one supervised same-origin product window without duplicating truth.
 */

const NATIVE_PROGRAMS = Object.freeze({
	byteviewer: "awtsmoosBinaryViewer",
	code: "advancedCodeEditor",
	compiler: "awtsmoosCompiler",
	csv: "awtsmoosSheets",
	docs: "awtsmoosDocs",
	drive: "driveWorkspace",
	"exe-emulator": "awtsmoosExecutable",
	sheets: "awtsmoosSheets",
	slides: "awtsmoosPresenter",
	wallet: "walletPortal"
});

/** Returns all canonical products that are not already represented by a native OS ID. */
export function publicProductApps(existingIds = new Set()) {
	const records = [...canonicalApps(), ...canonicalGames()];
	return records
		.filter(record => !existingIds.has(record.id))
		.map(record => createCatalogApp(record));
}

/** Returns the canonical 47 non-game applications with stable OS launch metadata. */
export function canonicalApps() {
	return PUBLIC_APPS
		.filter(app => !app.id.startsWith("game-") && app.id !== "games-hub")
		.map(app => productRecord(app, "app", appUrl(app.href)));
}

/** Returns the canonical 33 games with stable OS launch metadata. */
export function canonicalGames() {
	return GAMES.map(game => productRecord(game, "game", gameUrl(game.href)));
}

function productRecord(source, kind, webUrl) {
	const id = normalizeId(source.id);
	return {
		id,
		programName: NATIVE_PROGRAMS[id] || "awtsmoosWebProduct",
		title: source.title,
		icon: source.icon || (kind === "game" ? "🎮" : "✦"),
		description: source.description || source.hook || `Open ${source.title}.`,
		category: kind === "game" ? "explore" : categoryFor(source),
		keywords: keywordsFor(source, kind),
		productKind: kind,
		webUrl
	};
}

function categoryFor(source) {
	const categories = source.categories || [];
	if (categories.includes("system") || categories.includes("developer")) return "system";
	if (categories.includes("create") || categories.includes("editor") || categories.includes("studio")) return "create";
	return "explore";
}

function keywordsFor(source, kind) {
	return [kind, source.id, source.title, source.chip, source.genre, ...(source.aliases || []), ...(source.categories || []), ...(source.tags || [])]
		.filter(Boolean)
		.join(" ");
}

function appUrl(href) {
	return absoluteProductUrl(href, "/apps/");
}

function gameUrl(href) {
	return absoluteProductUrl(href, "/games/");
}

function absoluteProductUrl(href, base) {
	const value = String(href || "");
	if (value.startsWith("/")) return value;
	return `${base}${value.replace(/^\.\//, "")}`.replace(/\/+/g, "/");
}

function normalizeId(value) {
	return String(value || "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
