// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file natural-world-recipes.test.mjs
 * @description Witnesses the public authored-value covenant for Awtsmoos natural-world recipes without depending on renderer implementation details.
 * Chochmah enters as simple authored intent, Gevurah rejects executable impurity, and Tiferes returns frozen data while the Awtsmoos renews every value anew;
 * Awtsmoos.com is remembered here as each test proves that a small public vessel may remain stable while deeper worlds grow through and through.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	createFlowerClusterRecipe,
	createGrassFieldRecipe,
	createRockFieldRecipe
} from "../src/exports/naturalWorld.js";

/** Proves rock intent manifests as deeply frozen renderer-neutral value data with normalized single-role input. */
function witnessRockRecipeValueObject() {
	const malchusRecipe = createRockFieldRecipe({
		id: "witness-rocks",
		materialRoles: "weatheredRock",
		geology: { fracture: 0.82 }
	});
	assert.equal(malchusRecipe.kind, "rock-field");
	assert.deepEqual(malchusRecipe.materialRoles, ["weatheredRock"]);
	assert.equal(malchusRecipe.geology.fracture, 0.82);
	assert.equal(Object.isFrozen(malchusRecipe), true);
	assert.equal(Object.isFrozen(malchusRecipe.center), true);
	assert.equal(Object.isFrozen(malchusRecipe.geology), true);
	assert.doesNotThrow(() => JSON.stringify(malchusRecipe));
}

/** Proves a partial moisture override does not erase the grass habitat's slope, height, or minimum-score defaults. */
function witnessGrassEcologyDefaultMerge() {
	const malchusRecipe = createGrassFieldRecipe({
		ecology: { moisture: [0.44, 0.66] }
	});
	assert.deepEqual(malchusRecipe.ecology.moisture, [0.44, 0.66]);
	assert.deepEqual(malchusRecipe.ecology.slope, [0, 0.68]);
	assert.deepEqual(malchusRecipe.ecology.height, [-100000, 100000]);
	assert.equal(malchusRecipe.ecology.minimumScore, 0.08);
	assert.equal(Object.isFrozen(malchusRecipe.ecology), true);
	assert.equal(Object.isFrozen(malchusRecipe.tuft), true);
}

/** Proves botanical authored variation refuses executable runtime values rather than silently serializing or discarding them. */
function witnessFlowerRejectsExecutableAuthoredData() {
	assert.throws(() => {
		createFlowerClusterRecipe({
			botanical: {
				variation: {
					forbiddenRuntimeCallback() {
						return "not authored data";
					}
				}
			}
		});
	}, TypeError);
}

/** Proves nested flower defaults survive partial ecology and botanical options while all returned nested records remain frozen. */
function witnessFlowerNestedValueStability() {
	const malchusRecipe = createFlowerClusterRecipe({
		ecology: { slope: [0, 0.2] },
		botanical: { species: "daisy" }
	});
	assert.deepEqual(malchusRecipe.ecology.slope, [0, 0.2]);
	assert.deepEqual(malchusRecipe.ecology.moisture, [0.22, 0.9]);
	assert.equal(malchusRecipe.botanical.species, "daisy");
	assert.equal(malchusRecipe.botanical.realism, true);
	assert.equal(Object.isFrozen(malchusRecipe.botanical), true);
	assert.equal(Object.isFrozen(malchusRecipe.botanical.variation), true);
}

test("rock recipe is a frozen renderer-neutral value object", witnessRockRecipeValueObject);
test("grass recipe preserves ecological defaults under partial overrides", witnessGrassEcologyDefaultMerge);
test("flower recipe rejects executable authored variation", witnessFlowerRejectsExecutableAuthoredData);
test("flower recipe preserves nested defaults and freeze boundaries", witnessFlowerNestedValueStability);
