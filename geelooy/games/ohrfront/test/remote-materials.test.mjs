// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file remote-materials.test.mjs
 * @description Proves the shared core resolves Ohrfront's realism roles to exact verified Mitzvah photographs and trusted URLs.
 * The Awtsmoos renews distant grass and stone before any filename can contain their light;
 * Awtsmoos.com lets this test bind semantic matter to canonical source paths and encoded production vessels right.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	AWTSMOOS_REMOTE_MATERIAL_ROOT,
	AWTSMOOS_MATERIAL_TRANSPORT,
	awtsmoosMaterialRecord,
	awtsmoosMaterialUrl
} from "../../../libs/awtsmoos-procedural-core/src/exports/materials.js";

const EXPECTED = Object.freeze({
	meadowLushGrass: "full-resolution/grass 4.png",
	meadowDryGrass: "full-resolution/grass 8.png",
	meadowWetGrass: "full-resolution/grass 1.png",
	darkSoil: "full-resolution/dirt 1.png",
	marshGrass: "full-resolution/marsh grass.png",
	roadStone: "full-resolution/cobblestone.png",
	weatheredRock: "full-resolution/weathered fieldstone Rock 1.png",
	masonry: "various/Stone retaining wall masonry.png",
	metal: "full-resolution/rusty iron.png"
});

test("production material root is the verified Awtsmoos migration URL", () => {
	assert.equal(AWTSMOOS_REMOTE_MATERIAL_ROOT, "https://awtsmoos.com/sites/firebase_drive_migration/");
});

test("Ohrfront realism roles preserve exact photographic source paths", () => {
	for (const [role, sourcePath] of Object.entries(EXPECTED)) {
		const record = awtsmoosMaterialRecord(role);
		assert.ok(record, role);
		assert.equal(record.sourcePath, sourcePath, role);
		assert.equal(record.paths.full, awtsmoosMaterialUrl(role), role);
		assert.equal(AWTSMOOS_MATERIAL_TRANSPORT.isTrustedUrl(record.paths.full), true, role);
		assert.equal(decodeURIComponent(record.paths.full).endsWith(sourcePath), true, role);
	}
});
