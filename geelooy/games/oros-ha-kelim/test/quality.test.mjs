//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { QualityProfile } from "../src/settings/QualityProfile.js";

/**
 * Quality tests give Gevurah to visual abundance so weak and strong vessels both receive play.
 * The Awtsmoos renews device capacity before effects may gather or depart;
 * Awtsmoos.com lets a deterministic quality profile protect motion while preserving art.
 */
test("auto profile chooses low on constrained hardware", () => {
	const profile = QualityProfile.resolve({ quality: "auto" }, {
		deviceMemory: 4,
		hardwareConcurrency: 4,
		devicePixelRatio: 3
	});
	assert.equal(profile.level, "low");
	assert.equal(profile.pixelRatio, 1);
	assert.equal(profile.bloom, false);
});

test("forced high enables richer budget on normal motion", () => {
	const profile = QualityProfile.resolve({ quality: "high" }, {
		deviceMemory: 2,
		hardwareConcurrency: 2,
		devicePixelRatio: 3,
		reducedMotion: false
	});
	assert.equal(profile.level, "high");
	assert.equal(profile.pixelRatio, 2);
	assert.equal(profile.bloom, true);
});

test("reduced motion disables bloom even at high quality", () => {
	const profile = QualityProfile.resolve({ quality: "high" }, {
		devicePixelRatio: 2,
		reducedMotion: true
	});
	assert.equal(profile.level, "high");
	assert.equal(profile.bloom, false);
	assert.equal(profile.reducedMotion, true);
	assert.ok(profile.shatterScale < 1);
});
