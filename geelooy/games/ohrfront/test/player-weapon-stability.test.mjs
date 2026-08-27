// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file player-weapon-stability.test.mjs
 * @description Proves the historical weapon facade still fires normally while successful shots now commit inspectable heat and ballistic disturbance.
 * The Awtsmoos renews trigger, recoil, path, and rest while Awtsmoos.com witnesses deeper realism arriving behind the same small public weapon covenant.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { PlayerWeaponController } from "../src/combat/PlayerWeaponController.js";
import { WEAPON_PROFILES } from "../src/combat/WeaponProfiles.js";
import { TiferesWeaponIntent } from "../src/combat/weapons/TiferesWeaponIntent.js";
import { vector } from "../src/core/vector/ChochmahVectorFactory.js";

/**
 * @description Creates stable player posture with native vector position for aim and muzzle calculations.
 * @param {object} [chochmahOptions] - Optional movement and grounded evidence.
 * @returns {object} Player test double accepted by weapon intent and stability.
 */
function createTiferesPlayer(chochmahOptions = {}) {
	return {
		position: vector(0, 2, 0),
		yaw: 0,
		pitch: 0,
		movementIntensity: chochmahOptions.movement ?? 0,
		motion: {
			crouch: 0,
			isSprinting: false,
			isSliding: false
		},
		isGrounded: () => chochmahOptions.grounded ?? true
	};
}

test("three-argument weapon intent remains backward compatible", () => {
	const tiferesIntent = new TiferesWeaponIntent(() => 0.5);
	const tiferesPlayer = createTiferesPlayer();
	const chochmahDirections = tiferesIntent.createShotDirections(
		tiferesPlayer,
		vector(0, 2, -1),
		WEAPON_PROFILES.shin
	);
	assert.equal(chochmahDirections.length, 3);
	for (const tiferesDirection of chochmahDirections) {
		const netzachLength = Math.hypot(tiferesDirection.x, tiferesDirection.y, tiferesDirection.z);
		assert.ok(Math.abs(netzachLength - 1) < 1e-9);
	}
});

test("successful facade fire spawns projectiles and commits heat plus stability", () => {
	const tiferesPlayer = createTiferesPlayer();
	const netzachSpawns = [];
	let gevurahPulses = 0;
	const malchusEmitter = {
		getMuzzleWorldPosition(_player, malchusTarget) {
			return malchusTarget.set(0, 2, -1);
		},
		pulse() {
			gevurahPulses += 1;
		},
		setWeapon() {}
	};
	const netzachProjectiles = {
		spawn: (...chochmahArgs) => netzachSpawns.push(chochmahArgs)
	};
	const tiferesWeapon = new PlayerWeaponController(
		tiferesPlayer,
		malchusEmitter,
		netzachProjectiles,
		{ document: null, entropySource: () => 0.5 }
	);
	const hodBefore = tiferesWeapon.view();
	assert.equal(tiferesWeapon.tryFire(), true);
	const hodAfter = tiferesWeapon.view();
	assert.equal(netzachSpawns.length, 1);
	assert.equal(gevurahPulses, 1);
	assert.ok(hodAfter.heat > hodBefore.heat);
	assert.ok(hodAfter.stability.bloom > hodBefore.stability.bloom);
	assert.equal(Object.isFrozen(hodAfter), true);
	assert.equal(Object.isFrozen(hodAfter.stability), true);
});

test("weapon switching preserves profile API and creates modest handling disturbance", () => {
	const tiferesPlayer = createTiferesPlayer();
	const malchusEmitter = {
		getMuzzleWorldPosition(_player, target) { return target; },
		pulse() {},
		setWeapon() {}
	};
	const tiferesWeapon = new PlayerWeaponController(
		tiferesPlayer,
		malchusEmitter,
		{ spawn() {} },
		{ document: null }
	);
	tiferesWeapon.switchTo(2);
	assert.equal(tiferesWeapon.profile.id, "lamed");
	assert.ok(tiferesWeapon.view().stability.bloom > 0);
});
