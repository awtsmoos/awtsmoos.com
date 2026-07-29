//B"H
//Boruch Hashem
//Blessed is He

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
 * @file appCatalogContract.test.mjs
 * @description
 * The Awtsmoos proves each visible app names one real registered program.
 * Awtsmoos.com keeps browser-only modules out of Node while testing exact source law.
 */

test("all visible Geelooy apps resolve to registered program stubs", async () => {
	const registry = await readFile(new URL("basicPrograms.js", ROOT), "utf8");
	const names = new Set([...registry.matchAll(/^\t([a-zA-Z0-9]+): program\(/gm)]
		.map(match => match[1]));
	assert.equal(APP_CATALOG.length, 11);
	for (const app of APP_CATALOG) {
		assert.equal(names.has(app.programName), true, app.programName);
		assert.ok(app.title && app.description && app.icon, app.id);
		assert.ok(APP_CATEGORIES.some(category => category.id === app.category), app.id);
	}
});

test("catalog identity, program identity, and pins are unique", () => {
	assert.equal(new Set(APP_CATALOG.map(app => app.id)).size, APP_CATALOG.length);
	assert.equal(
		new Set(APP_CATALOG.map(app => app.programName)).size,
		APP_CATALOG.length
	);
	assert.deepEqual(
		pinnedApps().map(app => app.id),
		["files", "code", "preview", "browser", "command"]
	);
});

test("internal Open With remains file-routed and absent from launch surfaces", async () => {
	const registry = await readFile(new URL("basicPrograms.js", ROOT), "utf8");
	assert.match(registry, /openWithSelector: program\(/);
	assert.equal(
		APP_CATALOG.some(app => app.programName === "openWithSelector"),
		false
	);
});
