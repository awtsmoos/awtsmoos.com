//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productRouteCoverage.test.mjs
 * @description
 * Keeps public catalog, commerce identity, on-disk products, and server foundation
 * synchronized without brittle historical cardinalities. The product universe may
 * grow, but no catalog route may resolve to a different Wallet identity or vanish.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { PUBLIC_APPS } from "../../../apps/scripts/catalog/index.mjs";
import { GAMES } from "../../../games/scripts/catalog/index.mjs";
import { productIdFromPathname } from "../identity.js";

const require = createRequire(import.meta.url);
const { SUPPORTER_PRODUCTS } = require("../../../api/wallet/core/commerce/supporterCatalog.js");
const { revealHtmlUiFoundation } = require("../../../../ayzarim/awtsmoosDynamicServer/static/HtmlUiFoundation.js");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEELOOY = path.resolve(HERE, "../../..");
const apps = PUBLIC_APPS.filter(app => !app.id.startsWith("game-") && app.id !== "games-hub");
const catalog = [...apps.map(app => record("app", app.id, app.href)), ...GAMES.map(game => record("game", game.id, game.href))];

test("all public product routes resolve canonical commerce identity", () => {
	assert.ok(catalog.length >= 69);
	for (const item of catalog) {
		assert.equal(productIdFromPathname(item.route), item.id, item.route);
		assert.equal(fs.existsSync(item.file), true, item.file);
	}
});

test("supporter registry and public product catalog stay converged", () => {
	const catalogIds = [...new Set(catalog.map(item => item.id))].sort();
	const supporterIds = [...new Set(SUPPORTER_PRODUCTS.map(item => item.id))].sort();
	assert.deepEqual(supporterIds, catalogIds);
});

test("catalog products receive foundation without direct commerce boot", () => {
	for (const item of catalog) {
		const source = fs.readFileSync(item.file, "utf8");
		assert.equal(source.includes("data-awtsmoos-product-commerce"), false);
		const served = revealHtmlUiFoundation(source, { rootDir: GEELOOY, filePath: item.file });
		assert.equal(served.includes('data-awtsmoos-ui-foundation="script"'), true);
	}
});

/** @param {string} kind App or game. @param {string} rawId Catalog id. @param {string} href Public href. @returns {object} Verified route record. */
function record(kind, rawId, href) {
	const base = kind === "game" ? "https://awtsmoos.com/games/" : "https://awtsmoos.com/apps/";
	const route = new URL(href, base).pathname;
	const productRoot = kind === "game" ? "games" : "apps";
	const raw = href.startsWith("/") ? path.join(GEELOOY, href.slice(1)) : path.resolve(GEELOOY, productRoot, href);
	return { id: normalize(rawId), route, file: path.extname(raw) ? raw : path.join(raw, "index.html") };
}

/** @param {unknown} value Identifier-like value. @returns {string} Canonical product id. */
function normalize(value) {
	return String(value).trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}
