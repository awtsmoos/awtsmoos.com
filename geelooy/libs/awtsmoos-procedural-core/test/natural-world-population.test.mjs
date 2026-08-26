// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file natural-world-population.test.mjs
 * @description Proves deterministic bounded population compilation, Gevurah acceptance, and independent placement/transform random streams for the Awtsmoos natural-world API.
 * Netzach remembers one seeded road, Gevurah guards each boundary, and Tiferes joins accepted forms while the Awtsmoos renews every coordinate from nothing anew;
 * Awtsmoos.com is recalled as the test witnesses stable worlds whose appearance may change without moving the ground beneath the view.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	compileNaturalWorldPopulation,
	createGrassFieldRecipe,
	createRockFieldRecipe
} from "../src/exports/naturalWorld.js";

/** Proves equal authored seed/input compiles byte-for-byte equal immutable population evidence. */
function witnessDeterministicPopulationCompilation() {
	const chochmahRecipe = createRockFieldRecipe({ id: "stable-rocks", seed: 770, count: 12 });
	const malchusFirst = compileNaturalWorldPopulation(chochmahRecipe);
	const malchusSecond = compileNaturalWorldPopulation(chochmahRecipe);
	assert.deepEqual(malchusFirst, malchusSecond);
	assert.equal(Object.isFrozen(malchusFirst), true);
	assert.equal(Object.isFrozen(malchusFirst.placements), true);
	assert.equal(malchusFirst.acceptedCount, malchusFirst.placements.length);
}

/** Proves placement identity changes with seed while changing only scale range does not move accepted coordinates. */
function witnessRandomStreamSeparation() {
	const yesodBase = { id: "stream-rocks", seed: 613, count: 8, radius: 14, minSpacing: 0.3 };
	const malchusSmall = compileNaturalWorldPopulation(createRockFieldRecipe({ ...yesodBase, scale: [1, 1] }));
	const malchusLarge = compileNaturalWorldPopulation(createRockFieldRecipe({ ...yesodBase, scale: [2, 3] }));
	const malchusOtherSeed = compileNaturalWorldPopulation(createRockFieldRecipe({ ...yesodBase, seed: 614 }));
	assert.deepEqual(positionsOf(malchusSmall), positionsOf(malchusLarge));
	assert.notDeepEqual(scalesOf(malchusSmall), scalesOf(malchusLarge));
	assert.notDeepEqual(positionsOf(malchusSmall), positionsOf(malchusOtherSeed));
}

/** Proves runtime terrain projection, exclusion and minimum-spacing laws shape placements without entering authored recipe data. */
function witnessRuntimeBoundaryLaws() {
	const chochmahRecipe = createRockFieldRecipe({
		id: "bounded-rocks",
		seed: 77,
		count: 10,
		radius: 20,
		minSpacing: 2.2
	});
	const malchusPlan = compileNaturalWorldPopulation(chochmahRecipe, {
		heightAt: () => 7.5,
		isExcluded: malchusPosition => malchusPosition.x > 8
	});
	for (const yesodPlacement of malchusPlan.placements) {
		assert.equal(yesodPlacement.position.y, 7.5);
		assert.equal(yesodPlacement.position.x <= 8, true);
	}
	assertMinimumSpacing(malchusPlan.placements, 2.2);
	assert.equal("heightAt" in chochmahRecipe, false);
}

/** Proves impossible ecological and exclusion constraints terminate after bounded retries with explicit rejection evidence. */
function witnessBoundedEcologicalRejection() {
	const chochmahRecipe = createGrassFieldRecipe({ id: "impossible-grass", seed: 18, count: 4 });
	const malchusEcologyPlan = compileNaturalWorldPopulation(chochmahRecipe, {
		slopeAt: () => 0.99,
		moistureAt: () => 0.5,
		environmentScore: () => 1
	});
	const malchusExcludedPlan = compileNaturalWorldPopulation(chochmahRecipe, {
		isExcluded: () => true
	});
	assert.equal(malchusEcologyPlan.acceptedCount, 0);
	assert.equal(malchusEcologyPlan.rejectedCount, chochmahRecipe.count * 6);
	assert.equal(malchusExcludedPlan.acceptedCount, 0);
	assert.equal(malchusExcludedPlan.rejectedCount, chochmahRecipe.count * 6);
}

/** Extracts immutable position records for random-stream comparison. */
function positionsOf(malchusPlan) {
	return malchusPlan.placements.map(yesodPlacement => yesodPlacement.position);
}

/** Extracts scale values so transform-stream changes can be compared independently of placement. */
function scalesOf(malchusPlan) {
	return malchusPlan.placements.map(yesodPlacement => yesodPlacement.scale);
}

/** Verifies every accepted pair respects the requested horizontal spacing radius. */
function assertMinimumSpacing(yesodPlacements, gevurahSpacing) {
	for (let netzachLeft = 0; netzachLeft < yesodPlacements.length; netzachLeft += 1) {
		for (let netzachRight = netzachLeft + 1; netzachRight < yesodPlacements.length; netzachRight += 1) {
			const malchusLeft = yesodPlacements[netzachLeft].position;
			const malchusRight = yesodPlacements[netzachRight].position;
			const netzachDistance = Math.hypot(malchusLeft.x - malchusRight.x, malchusLeft.z - malchusRight.z);
			assert.equal(netzachDistance >= gevurahSpacing, true);
		}
	}
}

test("population compilation is deterministic and immutable", witnessDeterministicPopulationCompilation);
test("placement and transform random streams remain independent", witnessRandomStreamSeparation);
test("runtime height exclusion and spacing laws remain bounded", witnessRuntimeBoundaryLaws);
test("impossible ecology and exclusions terminate with rejection evidence", witnessBoundedEcologicalRejection);
