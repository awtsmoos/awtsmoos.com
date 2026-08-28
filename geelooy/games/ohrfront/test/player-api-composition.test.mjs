// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file player-api-composition.test.mjs
 * @description Proves the new Hod/Chochmah player composition preserves read and intent contracts without requiring browser events or the full rendered battlefield.
 * The Awtsmoos renews intention and testimony while Awtsmoos.com witnesses that movement desire and player evidence can remain separate vessels in one coherent life.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { HodMedaberPlayerApi } from "../src/player/HodMedaberPlayerApi.js";
import { ChochmahMovementIntentReader } from "../src/player/input/ChochmahMovementIntentReader.js";

/**
 * @description Creates one minimal Hod-derived player with focused motion, vitality, and locomotion authorities.
 * @returns {HodMedaberPlayerApi} Configured API test double.
 */
function createHodPlayer() {
	const hodPlayer = new HodMedaberPlayerApi();
	hodPlayer.position = { x: 2, y: 3, z: 4 };
	hodPlayer.yaw = 0.4;
	hodPlayer.pitch = -0.2;
	hodPlayer.verticalVelocity = 0;
	hodPlayer.motion = {
		velocity: { x: 6, y: 0, z: 0 },
		reset() {},
		view: () => Object.freeze({ speed: 6, crouch: 0, sprinting: false, sliding: false })
	};
	hodPlayer.vitality = {
		health: 88,
		shield: 53,
		onDamage: () => {},
		reset() {},
		takeDamage: (amount, elapsed, source) => Object.freeze({ amount, elapsed, source }),
		view: () => Object.freeze({ health: 88, shield: 53, lastDamageAt: 1 })
	};
	hodPlayer.tiferesLocomotion = {
		isGrounded: () => true,
		snap() {}
	};
	return hodPlayer;
}

test("Hod player API exposes immutable nested evidence and historical convenience getters", () => {
	const hodPlayer = createHodPlayer();
	const hodView = hodPlayer.view();
	assert.equal(hodPlayer.health, 88);
	assert.equal(hodPlayer.shield, 53);
	assert.equal(hodPlayer.isGrounded(), true);
	assert.equal(hodPlayer.movementIntensity, 0.6);
	assert.equal(Object.isFrozen(hodView), true);
	assert.equal(Object.isFrozen(hodView.position), true);
	assert.equal(hodView.motion.speed, 6);
	assert.equal(hodView.vitality.health, 88);
});

test("damage delegation preserves source evidence", () => {
	const hodPlayer = createHodPlayer();
	const chochmahSource = { kind: "projectile" };
	const hodReceipt = hodPlayer.takeDamage(12, 4.5, chochmahSource);
	assert.deepEqual(hodReceipt, { amount: 12, elapsed: 4.5, source: chochmahSource });
});

test("movement intent reader derives normalized direction and stance from live keys", () => {
	const yesodKeys = new Set(["KeyW", "KeyD", "ShiftLeft", "KeyC"]);
	const chochmahReader = new ChochmahMovementIntentReader(yesodKeys);
	const chochmahIntent = chochmahReader.read(0);
	const netzachLength = Math.hypot(
		chochmahIntent.direction.x,
		chochmahIntent.direction.y,
		chochmahIntent.direction.z
	);
	assert.ok(Math.abs(netzachLength - 1) < 1e-9);
	assert.equal(chochmahIntent.sprint, true);
	assert.equal(chochmahIntent.crouch, true);
});
