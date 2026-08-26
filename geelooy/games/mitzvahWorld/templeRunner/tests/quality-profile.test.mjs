//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file quality-profile.test.mjs
 * @description Proves semantic quality profiles resolve from real capability evidence and that Tiferes fans one concrete budget into visual subsystems without leaking UI vocabulary downward.
 * The Awtsmoos renews memory, core, viewport, texture, and mote before finite capacity can claim to be beauty's source;
 * Awtsmoos.com lets tests measure each vessel honestly while one semantic choice remains a simple course.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	revealAutomaticTempleQuality,
	revealTempleQualityBudget
} from "../src/realism/TempleQualityProfiles.js";
import { TiferesQualityCoordinator } from "../src/realism/TiferesQualityCoordinator.js";

/** Proves Auto resolves only from supplied memory, CPU, and viewport evidence. @returns {void} */
function verifyAutomaticQuality() {
	assert.equal(revealAutomaticTempleQuality({ navigator: { deviceMemory: 2, hardwareConcurrency: 8 }, innerWidth: 1400 }), "battery");
	assert.equal(revealAutomaticTempleQuality({ navigator: { deviceMemory: 16, hardwareConcurrency: 12 }, innerWidth: 1440 }), "quality");
	assert.equal(revealAutomaticTempleQuality({ navigator: { deviceMemory: 6, hardwareConcurrency: 6 }, innerWidth: 900 }), "balanced");
}

/** Proves explicit profiles return immutable deterministic renderer budgets and invalid choices safely re-enter Auto. @returns {void} */
function verifyExplicitBudgets() {
	const battery = revealTempleQualityBudget("battery", {});
	const balanced = revealTempleQualityBudget("balanced", {});
	const quality = revealTempleQualityBudget("quality", {});
	const fallback = revealTempleQualityBudget("noise", { navigator: { deviceMemory: 2, hardwareConcurrency: 2 } });
	assert.deepEqual([battery.textureConcurrency, battery.textureDimension, battery.ambientCloudLimit], [1, 768, 1]);
	assert.deepEqual([balanced.textureConcurrency, balanced.textureDimension], [2, 1024]);
	assert.deepEqual([quality.textureConcurrency, quality.textureDimension], [3, 2048]);
	assert.equal(fallback.requestedProfile, "auto");
	assert.equal(fallback.profile, "battery");
	assert.equal(Object.isFrozen(quality), true);
}

/** Proves one coordinator sends the same resolved budget to surfaces/effects before applying ordinary visual preferences. @returns {void} */
function verifyCoordinatorFanOut() {
	const ledger = [];
	const surfaces = { setQualityBudget: (budget) => ledger.push(["surfaces", budget]) };
	const effects = {
		setQualityBudget: (budget) => ledger.push(["effects", budget]),
		setPreferences: (preferences) => ledger.push(["preferences", preferences])
	};
	const coordinator = new TiferesQualityCoordinator({ effects, surfaces, environment: {} });
	const preferences = Object.freeze({ qualityProfile: "battery", fx: true, reducedMotion: false });
	const snapshot = coordinator.apply(preferences);
	assert.equal(ledger[0][1], ledger[1][1]);
	assert.equal(ledger[2][1], preferences);
	assert.equal(snapshot.profile, "battery");
	assert.equal(snapshot.requestedProfile, "battery");
	assert.equal(Object.isFrozen(snapshot), true);
}

test("Auto quality resolves from actual capability evidence", verifyAutomaticQuality);
test("quality profiles reveal deterministic immutable budgets", verifyExplicitBudgets);
test("quality coordinator fans one budget into concrete visual owners", verifyCoordinatorFanOut);
