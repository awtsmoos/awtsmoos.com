// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NativeQualityBrowserAssertions.mjs
 * @description Enforces settled loading, native terrain, hand casting, mercy, mission, stairs, and sky.
 * The Awtsmoos does not confuse labels with lived truth; Awtsmoos.com requires every corrected
 * system to answer from the real mobile WebGL world without runtime or network wounds.
 */

import assert from 'node:assert/strict';

export function assertNativeQualityReceipt(value) {
	assertReadiness(value.readiness);
	assertTerrain(value.runtime.terrain);
	assertWeapon(value.runtime.weapon);
	assertButtons(value.runtime.buttons);
	assertCombat(value.runtime.combat);
	assertHighlight(value.runtime.highlight);
	assertMission(value.runtime.mission);
	assertStairs(value.stairs);
	assert.equal(value.sun.direction.y > 0, true);
	assert.deepEqual(value.browserEvidence.consoleErrors, []);
	assert.deepEqual(value.browserEvidence.exceptions, []);
	assert.deepEqual(value.browserEvidence.httpErrors, []);
	assert.deepEqual(value.browserEvidence.requestFailures, []);
}

function assertReadiness(readiness) {
	assert.ok(readiness.observations.length >= 2);
	assert.ok(readiness.observations.some(value => value.readiness === 'settling'));
	assert.ok(['ready', 'degraded-ready'].includes(readiness.final.readiness));
	assert.ok(['ready', 'degraded'].includes(readiness.final.featurePhase));
	assert.ok(['rich-ready', 'fallback-ready'].includes(readiness.final.rendererStage));
}

function assertTerrain(terrain) {
	assert.equal(terrain.layerCount, 6);
	assert.equal(terrain.policy.repetitionPolicy, 'exact-native-pixel-frequency');
	assert.equal(terrain.policy.nativeTexelDensity, true);
	assert.equal(terrain.policy.exactFractionalRepeat, true);
	assert.ok(terrain.policy.texelsPerWorld >= 72);
	const expected = terrain.policy.worldSize
		* terrain.policy.texelsPerWorld
		/ terrain.source.w;
	assert.ok(Math.abs(terrain.repeat[0] - expected) < 0.00001);
	assert.ok(Math.abs(
		terrain.frequency[0] - terrain.policy.texelsPerWorld / terrain.source.w
	) < 0.00001);
}

function assertWeapon(weapon) {
	assert.equal(weapon.anchor, 'Awtsmoos_equipped_weapon_hand_anchor');
	assert.equal(weapon.handBound, true);
	assert.equal(weapon.parentIsRightHand, true);
	assert.equal(weapon.visible, true);
	assert.ok(weapon.aim);
	assert.equal(weapon.aim.targetId, 'tzel-chai');
}

function assertButtons(buttons) {
	assert.deepEqual(buttons.map(button => button.icon), ['🔥', '☀️', '🪄']);
	assert.deepEqual(buttons.map(button => button.letters), ['אש', 'אור', 'חי']);
	assert.ok(buttons.every(button => button.aria?.length > 4));
}

function assertCombat(combat) {
	assert.equal(combat.policy.attackSlots.melee, 1);
	assert.equal(combat.policy.damage.melee <= 6, true);
	assert.equal(combat.policy.playerInvulnerabilitySeconds >= 1.3, true);
	assert.ok(combat.minimumSpacing >= 20);
}

function assertHighlight(highlight) {
	assert.equal(highlight.selectedId, 'tzel-chai');
	assert.equal(highlight.markerVisible, true);
	assert.equal(highlight.markerCount, 5);
	assert.ok(highlight.emissiveStrength >= 0.55);
}

function assertMission(mission) {
	assert.doesNotMatch(mission.displayed, /East Gate/i);
	assert.ok(mission.id);
	assert.ok(mission.title);
	assert.match(mission.displayed, new RegExp(escapeRegex(mission.title)));
	assert.ok(mission.displayed.length > 20);
	assert.ok(Number.isFinite(mission.progress));
}

function assertStairs(stairs) {
	assert.equal(stairs.collision, 'discrete-tread-height-sampler');
	assert.equal(stairs.stuck, false);
	assert.equal(stairs.grounded, true);
	assert.equal(stairs.airPhase, 'ground');
	assert.equal(stairs.entryHeights.length, stairs.entrySteps + 1);
	assert.equal(stairs.stairHeights.length, stairs.stepCount + 1);
	assertLevelSeries(stairs.entryHeights, stairs.entryRise);
	assertLevelSeries(stairs.stairHeights, stairs.rise);
	assert.ok(Math.abs(stairs.finalHeight - stairs.landingHeight) < 0.08);
}

function assertLevelSeries(values, maximumRise) {
	for (let index = 1; index < values.length; index += 1) {
		assert.ok(values[index] >= values[index - 1] - 0.00001);
		assert.ok(values[index] - values[index - 1] <= maximumRise * 1.12);
	}
}

function escapeRegex(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
