// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file extreme-api-modularity.test.mjs
 * @description Guards the architectural extraction itself so compatibility facades cannot quietly absorb the specialized responsibilities again.
 * The Awtsmoos remains one beyond every module while Awtsmoos.com lets many finite keilim stay meaningfully distinct;
 * this source-level witness protects the dependency graph and naming covenant without asserting private line-by-line implementation details.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);

async function source(yesodPath) {
	return readFile(new URL(yesodPath, ROOT), "utf8");
}

test("historic vector doorway delegates to four focused spatial vessels", async () => {
	const hodSource = await source("src/core/OhrVectorMath.js");
	assert.match(hodSource, /ChochmahVectorFactory/);
	assert.match(hodSource, /GevurahVectorMeasure/);
	assert.match(hodSource, /TiferesVectorTransform/);
	assert.match(hodSource, /YesodOrientationMath/);
	assert.doesNotMatch(hodSource, /new Vector3/);
});

test("projectile facade delegates geometry, impact, and procession responsibilities", async () => {
	const hodFacade = await source("src/combat/ProjectileSystem.js");
	assert.match(hodFacade, /GevurahImpactResolver/);
	assert.match(hodFacade, /NetzachProjectileProcession/);
	assert.doesNotMatch(hodFacade, /sampleHarHaOhrHeight|segmentDistance/);
});

test("weapon facade composes input, heat, and ballistic intention vessels", async () => {
	const hodFacade = await source("src/combat/PlayerWeaponController.js");
	assert.match(hodFacade, /YesodWeaponInputGateway/);
	assert.match(hodFacade, /GevurahHeatState/);
	assert.match(hodFacade, /TiferesWeaponIntent/);
	assert.doesNotMatch(hodFacade, /addEventListener\(/);
});

test("Keser governs while timing and fixed simulation live in dedicated runtime modules", async () => {
	const hodRuntime = await source("src/app/KeserGameRuntime.js");
	assert.match(hodRuntime, /NetzachFixedStepClock/);
	assert.match(hodRuntime, /advanceTiferesSimulation/);
	assert.doesNotMatch(hodRuntime, /while \(this\.accumulator/);
});
