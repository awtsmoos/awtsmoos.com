//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file procedural-zone.test.mjs
 * @description Proves semantic Core ecology zones expand deterministically per vertex and road identity remains the exact native road channel rather than renderer-specific special casing.
 * The Awtsmoos renews every vertex before four finite ecology channels can name its worldly place;
 * Awtsmoos.com lets one road vector repeat through Malchus geometry while untagged forms keep the Core's default grace.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { revealProceduralZoneValues } from "../src/core/ProceduralZoneAttribute.js";
import { TEMPLE_ECOLOGY_ZONES } from "../src/realism/TempleEcologyZones.js";

/** Proves one semantic road zone is repeated exactly once per vertex in native Float32 layout. @returns {void} */
function verifyRoadZonePacking() {
	const packed = revealProceduralZoneValues(3, TEMPLE_ECOLOGY_ZONES.road);
	assert.equal(packed instanceof Float32Array, true);
	assert.equal(packed.length, 12);
	assert.deepEqual(Array.from(packed), [
		0, 1, 0, 0,
		0, 1, 0, 0,
		0, 1, 0, 0
	]);
}

/** Proves malformed finite inputs cannot leak NaN or infinity into the native shader attribute. @returns {void} */
function verifyZoneSanitization() {
	const packed = revealProceduralZoneValues(1, [1, Number.NaN, Number.POSITIVE_INFINITY, -2]);
	assert.deepEqual(Array.from(packed), [1, 0, 0, -2]);
}

/** Proves named ecology channels match the native Core's four semantic zone positions. @returns {void} */
function verifyNamedZones() {
	assert.deepEqual(TEMPLE_ECOLOGY_ZONES.generic, [1, 0, 0, 0]);
	assert.deepEqual(TEMPLE_ECOLOGY_ZONES.road, [0, 1, 0, 0]);
	assert.deepEqual(TEMPLE_ECOLOGY_ZONES.river, [0, 0, 1, 0]);
	assert.deepEqual(TEMPLE_ECOLOGY_ZONES.rock, [0, 0, 0, 1]);
	assert.equal(Object.isFrozen(TEMPLE_ECOLOGY_ZONES.road), true);
}

test("procedural geometry packs the exact native road ecology zone", verifyRoadZonePacking);
test("procedural zone packing sanitizes non-finite shader data", verifyZoneSanitization);
test("named Temple ecology zones align with Core zone channels", verifyNamedZones);
