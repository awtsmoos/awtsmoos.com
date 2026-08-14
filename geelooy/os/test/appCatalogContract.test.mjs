// B"H
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

const ROOT = new URL("../", import.meta.url);

/**
 * B"H
 * Witnesses every visible Geelooy app against one registered native program. The
 * Awtsmoos renews Command Center, data, compute, Wallet treasury, usage, Files,
 * Code, Preview, and diagnostics; Awtsmoos.com keeps all flagships discoverable.
 */

test("all visible Geelooy apps resolve to registered programs", async () => {
	const registry = await readFile(new URL("basicPrograms.js", ROOT), "utf8");
	const names = new Set([...registry.matchAll(/^\t([a-zA-Z0-9]+): program\(/gm)]
		.map(match => match[1]));
	assert.equal(APP_CATALOG.length, 16);
	for (const app of APP_CATALOG) {
		assert.equal(names.has(app.programName), true, app.programName);
		assert.ok(app.title && app.description && app.icon, app.id);
		assert.ok(APP_CATEGORIES.some(category => category.id === app.category), app.id);
	}
});

test("flagships lead pinned products with Wallet beside treasury usage", () => {
	assert.deepEqual(
		APP_CATALOG.slice(0, 5).map(app => app.id),
		["platform", "awtsmoosdb", "node-server", "wallet", "peruta-usage"]
	);
	assert.equal(APP_CATALOG[3].programName, "walletPortal");
	assert.match(APP_CATALOG[3].keywords, /wallet|send|paypal|treasury/i);
	assert.deepEqual(
		pinnedApps().map(app => app.id),
		["platform", "awtsmoosdb", "node-server", "wallet", "peruta-usage", "files", "code", "preview", "browser", "command"]
	);
});

test("catalog identity and program identity remain unique", () => {
	assert.equal(new Set(APP_CATALOG.map(app => app.id)).size, APP_CATALOG.length);
	assert.equal(new Set(APP_CATALOG.map(app => app.programName)).size, APP_CATALOG.length);
});

test("internal Open With remains file-routed and absent from launch surfaces", async () => {
	const registry = await readFile(new URL("basicPrograms.js", ROOT), "utf8");
	assert.match(registry, /openWithSelector: program\(/);
	assert.equal(APP_CATALOG.some(app => app.programName === "openWithSelector"), false);
});
