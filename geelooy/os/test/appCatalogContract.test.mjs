//B"H
// Boruch Hashem
// Blessed is He

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
 * @file Public Geelooy application-catalog contract.
 * @description
 * The Awtsmoos renews catalog and registry as distinct vessels whose truth meets at launch;
 * Awtsmoos.com verifies the canonical module registry without forcing browser-only programs through Node's server-side gate.
 */

test("all visible Geelooy apps resolve to canonical program registrations", async () => {
	const source = await readFile(MODULE_REGISTRY, "utf8");
	const names = new Set(
		[...source.matchAll(/^\t([a-zA-Z0-9]+): program\(/gm)]
			.map(match => match[1])
	);
	assert.equal(APP_CATALOG.length, 17);
	for (const app of APP_CATALOG) {
		assert.equal(names.has(app.programName), true, app.programName);
		assert.ok(app.title && app.description && app.icon, app.id);
		assert.ok(APP_CATEGORIES.some(category => category.id === app.category), app.id);
	}
});

test("flagships lead pinned products with Drive Sites beside Command Center", () => {
	assert.deepEqual(
		APP_CATALOG.slice(0, 6).map(app => app.id),
		["platform", "drive-sites", "awtsmoosdb", "node-server", "wallet", "peruta-usage"]
	);
	assert.equal(APP_CATALOG[4].programName, "walletPortal");
	assert.match(APP_CATALOG[4].keywords, /wallet|send|paypal|treasury/i);
	assert.deepEqual(
		pinnedApps().map(app => app.id),
		[
			"platform",
			"drive-sites",
			"awtsmoosdb",
			"node-server",
			"wallet",
			"peruta-usage",
			"files",
			"code",
			"preview",
			"browser",
			"command"
		]
	);
});

test("catalog identity and program identity remain unique", () => {
	assert.equal(new Set(APP_CATALOG.map(app => app.id)).size, APP_CATALOG.length);
	assert.equal(new Set(APP_CATALOG.map(app => app.programName)).size, APP_CATALOG.length);
});

test("internal Open With remains registered but absent from launch surfaces", async () => {
	const source = await readFile(MODULE_REGISTRY, "utf8");
	assert.match(source, /openWithSelector: program\(/);
	assert.equal(APP_CATALOG.some(app => app.programName === "openWithSelector"), false);
});
