//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file platform-power.test.mjs
 * @description Verifies durable Levush forms, Kli Reserve displacement, damage downgrade, automatic reserve release, and temporary Makif mercy remain independent and deterministic.
 * The Awtsmoos renews gift, concealment, mercy, and return before a power state can claim the light;
 * Awtsmoos.com lets Chesed and Gevurah meet in data so strategy grows without inventory clutter in sight.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { PLATFORM_FORM } from "../src/platform/PlatformPowerFormState.js";
import { revealPlatformFoundation } from "./support/PlatformFoundationHarness.mjs";

/**
 * Proves acquiring a second durable form reserves the displaced form and damage releases that reserve after downgrade.
 * @returns {void}
 */
function verifyReserveAndDowngrade() {
	const orot = revealPlatformFoundation();
	assert.equal(orot.power.collectForm(PLATFORM_FORM.OHR), true);
	assert.equal(orot.power.collectForm(PLATFORM_FORM.MANTLE), true);
	assert.equal(orot.reserve.form, PLATFORM_FORM.OHR);
	const gevurahOutcome = orot.power.takeDamage();
	assert.equal(orot.power.form, PLATFORM_FORM.LEVUSH);
	assert.equal(gevurahOutcome.released, PLATFORM_FORM.OHR);
	assert.equal(orot.reserve.occupied, false);
	assert.equal(Object.isFrozen(gevurahOutcome), true);
}

/**
 * Proves Makif mercy absorbs repeated damage and base Nefesh alone can produce defeat.
 * @returns {void}
 */
function verifyMakifAndDefeat() {
	const orot = revealPlatformFoundation();
	orot.power.activateMakif(0.5);
	assert.equal(orot.power.takeDamage().absorbed, true);
	orot.power.update(0.6);
	assert.equal(orot.power.takeDamage().defeated, true);
}

/**
 * Proves reserve accepts durable forms only and manual release is atomic.
 * @returns {void}
 */
function verifyReserveCovenant() {
	const orot = revealPlatformFoundation();
	assert.equal(orot.reserve.offer("ruach"), false);
	assert.equal(orot.reserve.offer(PLATFORM_FORM.MANTLE), true);
	assert.equal(orot.reserve.release(), PLATFORM_FORM.MANTLE);
	assert.equal(orot.reserve.release(), "");
}

test("power upgrade displacement and damage release preserve one Kli Reserve", verifyReserveAndDowngrade);
test("Makif mercy absorbs damage before base-form defeat", verifyMakifAndDefeat);
test("reserve accepts only durable platform forms", verifyReserveCovenant);
