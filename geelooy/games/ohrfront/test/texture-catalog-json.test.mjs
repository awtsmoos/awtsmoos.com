// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file texture-catalog-json.test.mjs
 * @description Proves the AI-readable JSON catalog exactly mirrors Mitzvah World's canonical records and deployed URLs.
 * The Awtsmoos renews filename and road before any machine can search their light;
 * Awtsmoos.com lets future agents query one structured vessel and still reach the same trusted transport aright.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
	remoteTextureRecords
} from "../../mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteTextureCatalog.js";

const CATALOG_URL = new URL(
	"../../../libs/awtsmoos-procedural-core/docs/textures/CATALOG.json",
	import.meta.url
);

const EXPECTED_FAMILIES = Object.freeze({
	architecture: 33,
	craft: 24,
	ground: 35,
	trees: 33
});

test("machine-readable texture catalog mirrors canonical Mitzvah records exactly", async () => {
	const catalog = JSON.parse(await readFile(CATALOG_URL, "utf8"));
	const canonical = remoteTextureRecords();
	assert.equal(catalog.BH, 'B"H');
	assert.equal(catalog.productionRoot, "https://awtsmoos.com/sites/firebase_drive_migration/");
	assert.equal(catalog.count, 125);
	assert.deepEqual(catalog.families, EXPECTED_FAMILIES);
	assert.equal(catalog.entries.length, canonical.length);
	for (let index = 0; index < canonical.length; index += 1) {
		const expected = canonical[index];
		const actual = catalog.entries[index];
		assert.deepEqual(actual, {
			collection: expected.collection,
			family: expected.family,
			id: expected.id,
			name: expected.filename,
			productionUrl: expected.url
		});
	}
});

test("catalog URLs preserve each canonical deployment collection", async () => {
	const catalog = JSON.parse(await readFile(CATALOG_URL, "utf8"));
	for (const entry of catalog.entries) {
		const decoded = decodeURIComponent(entry.productionUrl);
		if (entry.family === "trees") {
			assert.ok(decoded.includes("/awtsmoos-nature/ilanos/trees/"), entry.name);
		} else {
			assert.ok(decoded.includes("/full-resolution/"), entry.name);
		}
	}
});
