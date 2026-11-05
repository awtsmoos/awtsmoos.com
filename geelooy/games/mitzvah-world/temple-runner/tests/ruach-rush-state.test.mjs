//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ruach-rush-state.test.mjs
 * @description Proves earned Ruach Rush composes with ordinary road powers through canonical getters while preserving honest independent timers and reset law.
 * The Awtsmoos renews mastered wind and collected gift without confusing the source of either light;
 * Awtsmoos.com lets Rush empower existing magnet and doubled reward, then fade while true road gifts remain in sight.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { POWERUP_CONFIG } from "../src/config.js";
import { ChesedPowerUpState } from "../src/game/PowerUpState.js";

/**
 * @description Proves Rush alone activates effective magnet/double behavior without fabricating road timers, pickup identity, or shield.
 * @returns {void}
 */
function verifyEarnedRushEffects() {
	const powers = new ChesedPowerUpState();
	powers.activateRush();
	const snapshot = powers.snapshot();
	assert.equal(snapshot.rush, POWERUP_CONFIG.ruachRushSeconds);
	assert.equal(snapshot.magnet, 0);
	assert.equal(snapshot.double, 0);
	assert.equal(snapshot.shield, 0);
	assert.equal(snapshot.lastCollected, "");
	assert.equal(powers.rushActive, true);
	assert.equal(powers.magnetActive, true);
	assert.equal(powers.doubleActive, true);
	assert.equal(powers.shieldActive, false);
}

/**
 * @description Proves ordinary road timers remain independently truthful when activated during Rush and continue after mastery wind expires.
 * @returns {void}
 */
function verifyRoadPowerIndependence() {
	const powers = new ChesedPowerUpState();
	powers.activateRush();
	powers.update(2);
	powers.activate("magnet");
	powers.activate("double");
	powers.update(4.1);
	const snapshot = powers.snapshot();
	assert.equal(snapshot.rush, 0);
	assert.ok(snapshot.magnet > 3.8);
	assert.ok(snapshot.double > 3.8);
	assert.equal(powers.rushActive, false);
	assert.equal(powers.magnetActive, true);
	assert.equal(powers.doubleActive, true);
	assert.equal(snapshot.lastCollected, "double");
}

/**
 * @description Proves a fresh-run reset removes both earned Rush and ordinary collected powers through one stable composite API.
 * @returns {void}
 */
function verifyCompositeReset() {
	const powers = new ChesedPowerUpState();
	powers.activateRush();
	powers.activate("shield");
	powers.reset();
	assert.deepEqual(powers.snapshot(), {
		magnet: 0,
		double: 0,
		shield: 0,
		lastCollected: "",
		rush: 0
	});
	assert.equal(powers.magnetActive, false);
	assert.equal(powers.doubleActive, false);
	assert.equal(powers.shieldActive, false);
}

test("Ruach Rush reuses magnet and double behavior without fake road power state", verifyEarnedRushEffects);
test("road power timers survive independently after Ruach Rush expires", verifyRoadPowerIndependence);
test("composite power reset clears Rush and collected road gifts", verifyCompositeReset);
