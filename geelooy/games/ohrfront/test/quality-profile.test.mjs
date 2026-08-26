// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file quality-profile.test.mjs
 * @description Proves visual quality tiers scale only decorative density and bounded texture pressure through validated names.
 * The Awtsmoos renews sparse and abundant vessels while the mission remains one light;
 * Awtsmoos.com lets these tests ensure quality changes scenery, never the laws of the fight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	ohrfrontQualityNames,
	qualityFromLocation,
	resolveOhrfrontQuality
} from "../src/config/OhrfrontQualityProfiles.js";

test("quality names are stable and ordered from sparse to abundant", () => {
	assert.deepEqual(ohrfrontQualityNames(), ["low", "medium", "high", "ultra"]);
	const profiles = ohrfrontQualityNames().map(resolveOhrfrontQuality);
	for (let index = 1; index < profiles.length; index += 1) {
		assert.ok(profiles[index].geologySites >= profiles[index - 1].geologySites);
		assert.ok(profiles[index].earthworkSites >= profiles[index - 1].earthworkSites);
	}
});

test("unknown quality safely falls back to high", () => {
	assert.equal(resolveOhrfrontQuality("impossible").name, "high");
	assert.equal(resolveOhrfrontQuality(null).name, "high");
});

test("URL quality parsing stays explicit and immutable", () => {
	const low = qualityFromLocation({ search: "?quality=low" });
	const ultra = qualityFromLocation({ search: "?quality=ultra" });
	assert.equal(low.name, "low");
	assert.equal(ultra.name, "ultra");
	assert.ok(Object.isFrozen(low));
	assert.ok(low.textureConcurrency <= ultra.textureConcurrency);
});
