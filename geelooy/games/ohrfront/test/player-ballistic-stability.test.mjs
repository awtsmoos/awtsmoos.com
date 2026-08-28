// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file player-ballistic-stability.test.mjs
 * @description Proves player dispersion now responds deterministically to posture, movement, air state, recoil bloom, and recovery instead of remaining profile-only.
 * The Awtsmoos renews stillness and motion while Awtsmoos.com witnesses that precision is earned through embodied settlement, never arbitrary failure or hidden dice.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { TiferesBallisticStability } from "../src/combat/weapons/TiferesBallisticStability.js";

/**
 * @description Creates one tiny player posture witness accepted by the stability authority.
 * @param {object} [chochmahOptions] - Optional movement, crouch, sprint, slide, and grounded evidence.
 * @returns {object} Plain player posture test double.
 */
function createTiferesPlayer(chochmahOptions = {}) {
	return {
		movementIntensity: chochmahOptions.movement ?? 0,
		motion: {
			crouch: chochmahOptions.crouch ?? 0,
			isSprinting: chochmahOptions.sprint ?? false,
			isSliding: chochmahOptions.slide ?? false
		},
		isGrounded: () => chochmahOptions.grounded ?? true
	};
}

test("movement sprint slide and air progressively disturb settled precision", () => {
	const tiferesStability = new TiferesBallisticStability();
	const chochmahSettled = tiferesStability.spreadMultiplier(createTiferesPlayer());
	const gevurahMoving = tiferesStability.spreadMultiplier(createTiferesPlayer({ movement: 1 }));
	const gevurahSprint = tiferesStability.spreadMultiplier(createTiferesPlayer({ movement: 1, sprint: true }));
	const gevurahSlide = tiferesStability.spreadMultiplier(createTiferesPlayer({ movement: 1, slide: true }));
	const gevurahAir = tiferesStability.spreadMultiplier(createTiferesPlayer({ movement: 1, grounded: false }));
	assert.ok(gevurahMoving > chochmahSettled);
	assert.ok(gevurahSprint > gevurahMoving);
	assert.ok(gevurahSlide > gevurahMoving);
	assert.ok(gevurahAir > gevurahMoving);
});

test("crouch improves otherwise equivalent settled posture", () => {
	const tiferesStability = new TiferesBallisticStability();
	const chochmahStanding = tiferesStability.spreadMultiplier(createTiferesPlayer());
	const hodCrouched = tiferesStability.spreadMultiplier(createTiferesPlayer({ crouch: 1 }));
	assert.ok(hodCrouched < chochmahStanding);
});

test("successful shots create recoverable bounded bloom evidence", () => {
	const tiferesStability = new TiferesBallisticStability();
	const tiferesPlayer = createTiferesPlayer();
	const chochmahBefore = tiferesStability.view(tiferesPlayer);
	tiferesStability.commitShot({ recoil: 1, shotCount: 3 });
	const gevurahAfterShot = tiferesStability.view(tiferesPlayer);
	assert.ok(gevurahAfterShot.bloom > chochmahBefore.bloom);
	assert.ok(gevurahAfterShot.spreadMultiplier > chochmahBefore.spreadMultiplier);
	assert.equal(Object.isFrozen(gevurahAfterShot), true);
	tiferesStability.update(1, tiferesPlayer);
	const netzachRecovered = tiferesStability.view(tiferesPlayer);
	assert.ok(netzachRecovered.bloom < gevurahAfterShot.bloom);
	for (let index = 0; index < 40; index += 1) tiferesStability.commitShot({ recoil: 1, shotCount: 3 });
	assert.ok(tiferesStability.view(tiferesPlayer).spreadMultiplier <= 3.4);
});
