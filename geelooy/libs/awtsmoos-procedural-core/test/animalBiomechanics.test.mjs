// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that anatomical measure enters the existing creature
 * vessel without displacing its genome, phenotype, motion, or compiler.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	createAnimalMorphologyProfile,
	createAnimalPhenotype
} from "../src/core/animalMesh/index.js";
import { deriveAnimalBiomechanics } from "../src/core/animalMesh/morphology/biomechanics/deriveAnimalBiomechanics.js";

function assertFiniteNumbers(value) {
	if (typeof value === "number") {
		assert.equal(Number.isFinite(value), true);
		return;
	}
	if (value && typeof value === "object") {
		Object.values(value).forEach(assertFiniteNumbers);
	}
}

test("animal biomechanics are deterministic, normalized, and immutable", () => {
	const profile = createAnimalMorphologyProfile({ archetypeId: "quadruped", seed: 901 });
	const first = deriveAnimalBiomechanics(profile);
	const second = deriveAnimalBiomechanics(profile);
	assert.deepEqual(first, second);
	assert.equal(Object.isFrozen(first), true);
	const total = first.mass_distribution.segments.reduce((sum, segment) => sum + segment.fraction, 0);
	assert.ok(Math.abs(total - 1) < 1e-12);
	assertFiniteNumbers(first);
	assert.ok(first.axial.minimum_bend_radius > 0);
});

test("the established phenotype receives one additive biomechanics vessel", () => {
	const phenotype = createAnimalPhenotype({ archetypeId: "quadruped", seed: 902 });
	assert.equal(phenotype.schema, "awtsmoos.animal-phenotype");
	assert.equal(phenotype.biomechanics.schema, "awtsmoos.animal.biomechanics");
	assert.ok(phenotype.recipe);
	assert.ok(phenotype.locomotion);
	assert.ok(phenotype.morphology_report);
});

test("incomplete profiles produce bounded diagnostics instead of NaN", () => {
	const result = deriveAnimalBiomechanics({ genome: { traits: {} } });
	assertFiniteNumbers(result);
	assert.equal(result.diagnostics[0].code, "NO_AXIAL_SEGMENTS");
	assert.deepEqual(result.mass_distribution.segments, []);
});
