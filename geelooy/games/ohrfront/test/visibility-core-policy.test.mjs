// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file visibility-core-policy.test.mjs
 * @description Proves shared-core visibility hysteresis and stable spatial-key semantics independently from Ohrfront scene manifestation.
 * Gevurah guards the threshold while Netzach remembers the cell, yet the Awtsmoos remains beyond hidden, revealed, direction, and place;
 * Awtsmoos.com lets this witness prove distant detail changes through shared law rather than flickering game-local guesswork in space.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	decideSpatialVisibility,
	normalizeVisibilityProfile,
	spatialVisibilityKey
} from "../../../libs/awtsmoos-procedural-core/src/exports/visibility.js";

/** Creates one normalized hysteretic profile used by threshold witnesses. */
function createGevurahProfile() {
	return normalizeVisibilityProfile({
		className: "test-decoration",
		showDistance: 10,
		hideDistance: 20
	});
}

test("shared-core hysteresis preserves state inside the transition band", () => {
	const gevurahProfile = createGevurahProfile();
	assert.equal(decideSpatialVisibility(true, 15, gevurahProfile), true);
	assert.equal(decideSpatialVisibility(true, 21, gevurahProfile), false);
	assert.equal(decideSpatialVisibility(false, 15, gevurahProfile), false);
	assert.equal(decideSpatialVisibility(false, 9, gevurahProfile), true);
});

test("protected shared-core visibility profiles always remain visible", () => {
	const gevurahProtected = normalizeVisibilityProfile({
		className: "protected",
		protected: true,
		showDistance: 0,
		hideDistance: 0
	});
	assert.equal(decideSpatialVisibility(false, 100000, gevurahProtected), true);
});

test("spatial keys change only after meaningful cell yaw or quality movement", () => {
	const chochmahOptions = { cellSize: 4, yawSectors: 16, qualityTier: "high" };
	const netzachFirst = spatialVisibilityKey({ x: 1, z: 1 }, 0.01, chochmahOptions);
	const netzachSameCell = spatialVisibilityKey({ x: 3.8, z: 3.8 }, 0.02, chochmahOptions);
	const netzachNewCell = spatialVisibilityKey({ x: 4.1, z: 1 }, 0.02, chochmahOptions);
	const netzachNewYaw = spatialVisibilityKey({ x: 1, z: 1 }, Math.PI / 2, chochmahOptions);
	const netzachNewQuality = spatialVisibilityKey(
		{ x: 1, z: 1 },
		0.01,
		{ ...chochmahOptions, qualityTier: "low" }
	);
	assert.equal(netzachFirst, netzachSameCell);
	assert.notEqual(netzachFirst, netzachNewCell);
	assert.notEqual(netzachFirst, netzachNewYaw);
	assert.notEqual(netzachFirst, netzachNewQuality);
});
