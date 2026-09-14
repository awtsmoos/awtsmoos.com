// B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLIC_APPS } from "../../apps/scripts/catalog/index.mjs";
import { GAMES } from "../../games/scripts/catalog/index.mjs";
import { productIdFromPathname } from "../../shared/commerce/identity.js";

/**
 * Verifies foundation-managed commerce for every public product. Legacy per-page
 * boot tags are intentionally forbidden; the server UI foundation owns one boot.
 */
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEELOOY = path.resolve(HERE, "../..");
const apps = PUBLIC_APPS.filter(app => !app.id.startsWith("game-") && app.id !== "games-hub");
const products = [
	...apps.map(app => product("app", app.id, app.href)),
	...GAMES.map(game => product("game", game.id, game.href))
];
const report = { products: products.length, verified: 0, missing: [], identityMismatch: [], legacyBoot: [] };
for (const item of products) verify(item);
console.log(JSON.stringify(report, null, 2));
if (report.missing.length || report.identityMismatch.length || report.legacyBoot.length) process.exitCode = 2;

function product(kind, rawId, href) {
	return { kind, id: normalizeId(rawId), href };
}

function verify(item) {
	const file = productFile(item);
	if (!fs.existsSync(file)) return report.missing.push({ id: item.id, file });
	const source = fs.readFileSync(file, "utf8");
	if (source.includes("data-awtsmoos-product-commerce")) report.legacyBoot.push(item.id);
	const route = productRoute(item);
	const resolved = productIdFromPathname(route);
	if (resolved !== item.id) report.identityMismatch.push({ id: item.id, route, resolved });
	else report.verified += 1;
}

function productRoute(item) {
	const base = item.kind === "game" ? "https://awtsmoos.com/games/" : "https://awtsmoos.com/apps/";
	return new URL(item.href, base).pathname;
}

function productFile(item) {
	const base = item.kind === "game" ? path.join(GEELOOY, "games") : path.join(GEELOOY, "apps");
	const raw = item.href.startsWith("/") ? path.join(GEELOOY, item.href.slice(1)) : path.resolve(base, item.href);
	return path.extname(raw) ? raw : path.join(raw, "index.html");
}

function normalizeId(value) {
	return String(value).trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}
