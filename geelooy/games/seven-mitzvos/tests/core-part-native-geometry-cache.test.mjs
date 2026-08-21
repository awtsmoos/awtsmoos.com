//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews geometric form before any finite renderer binds it to a scene;
 * Awtsmoos.com proves Seven caches native-ready typed data directly, so repeated form stays portable, stable, and clean.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { advancedProfile } from "../js/procedural/advanced-profile-factory.js";
import { CorePartGeometryCache } from "../js/procedural/core-part-geometry-cache.js";

/** Build one canonical advanced cube profile used throughout the native-cache proof. */
function cubeProfile() {
	return advancedProfile({ primitive: "cube" });
}

test("core part cache returns native-ready typed geometry data", () => {
	const cache = new CorePartGeometryCache();
	const renderData = cache.renderData(cubeProfile());
	assert.ok(renderData.positions instanceof Float32Array);
	assert.ok(renderData.normals instanceof Float32Array);
	assert.ok(renderData.colors instanceof Float32Array);
	assert.ok(renderData.indices instanceof Uint16Array);
	assert.ok(renderData.positions.length > 0);
	assert.equal(renderData.positions.length, renderData.normals.length);
	assert.equal(cache.view().geometries, 1);
});

test("equal profiles share one immutable cache identity", () => {
	const cache = new CorePartGeometryCache();
	const first = cache.renderData(cubeProfile());
	const second = cache.renderData(cubeProfile());
	assert.equal(second, first);
	assert.equal(cache.view().geometries, 1);
});

test("different procedural profiles receive distinct cache entries", () => {
	const cache = new CorePartGeometryCache();
	const cube = cache.renderData(cubeProfile());
	const column = cache.renderData(
		advancedProfile({ primitive: "cylinder" })
	);
	assert.notEqual(column, cube);
	assert.ok(column.positions instanceof Float32Array);
	assert.equal(cache.view().geometries, 2);
});
