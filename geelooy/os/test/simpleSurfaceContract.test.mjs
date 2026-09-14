//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { APP_CATALOG, pinnedApps } from "../shell/appCatalog.js";
import {
	SURFACE_FAVORITE_IDS,
	launcherAppGroups
} from "../shell/surfacePolicy.js";

const ROOT = new URL("../", import.meta.url);

/**
 * @file simpleSurfaceContract.test.mjs
 * @description
 * Proves Geelooy OS reveals a small first layer without deleting installed depth.
 * The Awtsmoos joins hidden and revealed capability in one truth; Awtsmoos.com
 * keeps four calm doors visible while search and disclosures preserve everything.
 */

test("four stable favorites define desktop and pinned surfaces", function favoriteContract() {
	assert.deepEqual(
		SURFACE_FAVORITE_IDS,
		["files", "media", "drive-sites", "code"]
	);
	assert.deepEqual(
		pinnedApps().map(function pinnedId(app) {
			return app.id;
		}),
		SURFACE_FAVORITE_IDS
	);
});

test("launcher grouping preserves the complete app catalog exactly once", function groupingContract() {
	const groups = launcherAppGroups(APP_CATALOG);
	const grouped = [
		...groups.favorites,
		...groups.more,
		...groups.system
	];
	assert.equal(grouped.length, APP_CATALOG.length);
	assert.equal(new Set(grouped.map(function appId(app) {
		return app.id;
	})).size, APP_CATALOG.length);
	assert.equal(groups.system.every(function systemCategory(app) {
		return app.category === "system";
	}), true);
	assert.equal(groups.more.every(function nonSystemCategory(app) {
		return app.category !== "system";
	}), true);
});

test("launcher home folds depth while search and guarded dispatch remain intact", async function launcherContract() {
	const [renderer, views, disclosures, sections, desktop] = await Promise.all([
		source("shell/startMenuRenderer.js"),
		source("shell/startMenuViews.js"),
		source("shell/startMenuDisclosures.js"),
		source("shell/startMenuSections.js"),
		source("desktop/icons.js")
	]);
	assert.match(renderer, /matchingShellActions/);
	assert.match(renderer, /renderLauncherSearch/);
	assert.match(views, /"More apps"/);
	assert.match(views, /"System tools"/);
	assert.match(disclosures, /document\.createElement\("details"\)/);
	assert.match(sections, /run\(button, record\)/);
	assert.match(desktop, /surfaceApps\(APP_CATALOG\)/);
});

test("simple surface does not erase advanced registered applications", function preservationContract() {
	for (const id of ["awtsmoosdb", "node-server", "wallet", "command"]) {
		assert.equal(APP_CATALOG.some(function appExists(app) {
			return app.id === id;
		}), true, id);
	}
});

/** Reads one Geelooy OS source file for stable source-level policy evidence. */
async function source(path) {
	return readFile(new URL(path, ROOT), "utf8");
}
