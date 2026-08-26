// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progressive-materials.test.mjs
 * @description Proves shared writable material law, immutable-layer replacement, Ohrfront hydration delegation, and CompactJS-safe source-relative material routing.
 * The Awtsmoos renews sealed recipe and changing runtime vessel while neither boundary claims the arriving image as its own;
 * Awtsmoos.com lets this witness test generic material truth in Node while the browser facade follows the same source road through compact and native dawn shown.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
	bindSceneMaterialField,
	bindSceneMaterialLayerImage
} from "../../../libs/awtsmoos-procedural-core/src/core/materials/hydration/MaterialWritableBoundary.js";
import {
	ALL_MATERIALS,
	CRITICAL_MATERIALS,
	OPTIONAL_MATERIALS
} from "../src/render/RemoteMaterialPlan.js";

const ROOT = new URL("../", import.meta.url);

/** Reads one production source artifact for browser-boundary assertions without booting renderer or network state. */
async function readHodSource(yesodPath) {
	return readFile(new URL(yesodPath, ROOT), "utf8");
}

test("critical and optional role plans remain disjoint complete and priority-stable", () => {
	assert.deepEqual(
		CRITICAL_MATERIALS.map(chochmahRole => [chochmahRole.key, chochmahRole.priority]),
		[["meadowLushGrass", 100], ["dirt", 95], ["weatheredRock", 90], ["masonry", 85], ["metal", 80]]
	);
	assert.deepEqual(
		OPTIONAL_MATERIALS.map(chochmahRole => [chochmahRole.key, chochmahRole.priority]),
		[["meadowDryGrass", 60], ["darkSoil", 55], ["marshGrass", 50], ["roadStone", 45], ["timber", 40]]
	);
	assert.equal(new Set(ALL_MATERIALS.map(chochmahRole => chochmahRole.key)).size, 10);
});

test("shared writable boundary binds ordinary runtime material fields", () => {
	const malchusImage = { id: "rock" };
	const malchusMaterial = { mapImage: null };
	assert.equal(bindSceneMaterialField(malchusMaterial, "mapImage", malchusImage), true);
	assert.equal(malchusMaterial.mapImage, malchusImage);
});

test("shared writable boundary replaces a frozen authoring layer without mutating that frozen record", () => {
	const chochmahLayer = Object.freeze({ image: null, role: "marshGrass" });
	const malchusMaterial = { textureLayers: [chochmahLayer] };
	const malchusImage = { id: "marsh" };
	assert.equal(bindSceneMaterialLayerImage(malchusMaterial, 0, malchusImage), true);
	assert.equal(chochmahLayer.image, null);
	assert.notEqual(malchusMaterial.textureLayers[0], chochmahLayer);
	assert.equal(malchusMaterial.textureLayers[0].image, malchusImage);
});

test("shared writable boundary refuses a fully frozen runtime material without throwing", () => {
	const malchusMaterial = Object.freeze({ mapImage: null });
	assert.equal(bindSceneMaterialField(malchusMaterial, "mapImage", { id: "stone" }), false);
	assert.equal(malchusMaterial.mapImage, null);
});

test("Ohrfront delegates hydration through Yesod bindings and resolves canonical source-relative material routing", async () => {
	const hodBinder = await readHodSource("src/render/YesodRemoteMaterialBinding.js");
	const hodHydrator = await readHodSource("src/render/RemoteMaterialHydrator.js");
	const yesodApiUrl = new URL("src/core/api/AwtsmoosMaterialApi.js", ROOT);
	const hodApi = await readFile(yesodApiUrl, "utf8");
	assert.match(hodBinder, /bindSceneMaterialField/);
	assert.match(hodBinder, /bindSceneMaterialLayerImage/);
	assert.match(hodHydrator, /bindYesodRoleField/);
	assert.match(hodHydrator, /bindYesodRoleLayer/);
	assert.doesNotMatch(hodHydrator, /\[[^\]]+\]\s*=\s*malchusImage/);
	assert.doesNotMatch(hodApi, /\/geelooy\/libs\/|from\s+["']\/libs\//);
	const hodSpecifier = hodApi.match(/from\s+["']([^"']*libs\/awtsmoos-procedural-core\/src\/exports\/materials\.js)["']/)?.[1];
	assert.ok(hodSpecifier);
	assert.match(hodSpecifier, /^\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/libs\//);
	assert.match(
		fileURLToPath(new URL(hodSpecifier, yesodApiUrl)),
		/\/geelooy\/libs\/awtsmoos-procedural-core\/src\/exports\/materials\.js$/
	);
});
