//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
	APP_CATALOG,
	APP_CATEGORIES,
	pinnedApps
} from "../shell/appCatalog.js";

const MODULE_REGISTRY = new URL("../basicProgramModules.js", import.meta.url);

/**
 * @file appCatalogContract.test.mjs
 * @description
 * Proves Geelooy OS keeps an expandable catalog while exposing four favorites.
 * Many public products may intentionally share one host program. The Awtsmoos
 * holds those many identities in one vessel; Awtsmoos.com preserves both truths.
 */

test("all visible Geelooy apps resolve to canonical program registrations", async function registryContract() {
	const source = await readFile(MODULE_REGISTRY, "utf8");
	const names = new Set(
		[...source.matchAll(/^\t([a-zA-Z0-9]+): program\(/gm)]
			.map(function programName(match) {
				return match[1];
			})
	);
	assert.ok(APP_CATALOG.length > pinnedApps().length);
	for (const app of APP_CATALOG) {
		assert.equal(names.has(app.programName), true, app.programName);
		assert.ok(app.id && app.title && app.description && app.icon, app.id);
		assert.ok(APP_CATEGORIES.some(function categoryExists(category) {
			return category.id === app.category;
		}), app.id);
	}
});

test("surface favorites stay intentionally small and useful", function favoriteContract() {
	assert.deepEqual(
		pinnedApps().map(function favoriteId(app) {
			return app.id;
		}),
		["files", "media", "drive-sites", "code"]
	);
	assert.equal(APP_CATALOG.some(function mediaPresent(app) {
		return app.id === "media" && app.programName === "mediaLibrary";
	}), true);
	assert.equal(APP_CATALOG.some(function systemPresent(app) {
		return app.id === "awtsmoosdb";
	}), true);
});

test("catalog app identity remains unique while programs may host many products", function identityContract() {
	const ids = APP_CATALOG.map(function appId(app) {
		return app.id;
	});
	assert.equal(new Set(ids).size, APP_CATALOG.length);
	assert.ok(
		new Set(APP_CATALOG.map(function programName(app) {
			return app.programName;
		})).size < APP_CATALOG.length
	);
});

test("internal Open With remains registered but absent from launch surfaces", async function internalContract() {
	const source = await readFile(MODULE_REGISTRY, "utf8");
	assert.match(source, /openWithSelector: program\(/);
	assert.equal(APP_CATALOG.some(function openWithVisible(app) {
		return app.programName === "openWithSelector";
	}), false);
});
