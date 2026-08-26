// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file weapons.test.mjs
 * @description Proves Aleph, Shin, and Lamed are mechanically distinct playable Hebrew-energy weapon identities.
 * The Awtsmoos is beyond every letter while granting each letter a finite vessel; Awtsmoos.com lets this test ensure
 * the arsenal changes tactics through cadence, spread, damage, speed, and shot count instead of merely changing color.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	WEAPON_ORDER,
	WEAPON_PROFILES,
	getWeaponProfile
} from "../src/combat/WeaponProfiles.js";

test("the opening arsenal contains three unique Hebrew-letter emitters", () => {
	assert.deepEqual(WEAPON_ORDER, ["aleph", "shin", "lamed"]);
	const glyphs = WEAPON_ORDER.map(id => getWeaponProfile(id).glyph);
	assert.deepEqual(glyphs, ["א", "ש", "ל"]);
	assert.equal(new Set(glyphs).size, 3);
});

test("every weapon has complete positive ballistic data", () => {
	for (const profile of Object.values(WEAPON_PROFILES)) {
		assert.ok(profile.label.length > 0);
		assert.ok(profile.role.length > 0);
		assert.ok(profile.damage > 0);
		assert.ok(profile.speed > 0);
		assert.ok(profile.cooldown > 0);
		assert.ok(profile.heat > 0);
		assert.ok(profile.shotCount > 0);
		assert.ok(profile.projectileScale > 0);
	}
});

test("Shin scatters while Lamed is the heavy precision lance", () => {
	assert.equal(WEAPON_PROFILES.shin.shotCount, 3);
	assert.ok(WEAPON_PROFILES.shin.spread > WEAPON_PROFILES.aleph.spread);
	assert.ok(WEAPON_PROFILES.lamed.damage > WEAPON_PROFILES.aleph.damage);
	assert.ok(WEAPON_PROFILES.lamed.speed > WEAPON_PROFILES.aleph.speed);
	assert.ok(WEAPON_PROFILES.aleph.cooldown < WEAPON_PROFILES.lamed.cooldown);
});
