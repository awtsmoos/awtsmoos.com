// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file biologicalCompilerCoverage.test.mjs
 * @description Proves reusable biological definitions reach existing specialist compilers without narrow morphology hijacking generic categories.
 * The Awtsmoos renews tongue, hoof, scale, gill, hand, foot, snout, nose, nare, ears, dewlap, udder, snood, barbel, and fluke without multiplying the Source;
 * Awtsmoos.com verifies each explicit vessel finds its lawful compiler while broad names remain free for legacy and future forms to pursue their course.
 */

import assert from "node:assert/strict";
import {
	createBinahHumanEarDefinition,
	createBinahHumanFootDefinition,
	createBinahHumanHandDefinition,
	createBinahHumanNoseDefinition,
	createChesedTurkeySnoodDefinition,
	createDaasFeaturePlacement,
	createGevurahClovenHoofDefinition,
	createGevurahDewlapDefinition,
	createGevurahRuminantEarDefinition,
	createGevurahUdderDefinition,
	createHodBellyPlateDefinition,
	createHodScaleFieldDefinition,
	createMalchusSnoutDefinition,
	createMalchusTongueDefinition,
	createNetzachBarbelDefinition,
	createNetzachFlukeDefinition,
	createNetzachGillDefinition,
	createNetzachLateralLineDefinition,
	createNetzachNareDefinition
} from "../src/index.js";
import {
	canCompileBiologicalPart,
	compileBiologicalPartGeometry
} from "../src/core/animalMesh/creature/compile/biological/compileBiologicalPartGeometry.js";

const resolved = Object.freeze({
	frame: Object.freeze({
		binormal: Object.freeze([1, 0, 0]),
		normal: Object.freeze([0, 0, 1]),
		tangent: Object.freeze([0, 1, 0])
	}),
	position: Object.freeze([0.17, 0.23, -0.11])
});

const definitions = [
	createNetzachGillDefinition("operculum"),
	createNetzachFlukeDefinition(),
	createNetzachLateralLineDefinition(),
	createMalchusSnoutDefinition("bovine"),
	createBinahHumanNoseDefinition(),
	createNetzachNareDefinition(),
	createGevurahClovenHoofDefinition(),
	createBinahHumanHandDefinition("left"),
	createBinahHumanFootDefinition("right"),
	createBinahHumanEarDefinition("left"),
	createGevurahRuminantEarDefinition("bovine"),
	createGevurahDewlapDefinition(),
	createGevurahUdderDefinition(),
	createChesedTurkeySnoodDefinition(),
	createNetzachBarbelDefinition(),
	createHodScaleFieldDefinition("ctenoid", { count: 10 }),
	createHodBellyPlateDefinition({ count: 7 }),
	createMalchusTongueDefinition("snake")
];

for (const definition of definitions) {
	const part = createDaasFeaturePlacement(definition, {
		id: `proof.${definition.id}`,
		target: "proof-surface"
	});
	assert.equal(canCompileBiologicalPart(part), true, definition.id);
	assertGeometry(compileBiologicalPartGeometry(part, resolved), definition.id);
}

const recipeOnlyFoot = createDaasFeaturePlacement(
	createBinahHumanFootDefinition("left"),
	{ id: "recipe-only-foot" }
);
recipeOnlyFoot.semanticCategory = "custom-proof";
assert.equal(canCompileBiologicalPart(recipeOnlyFoot), true);
assertGeometry(compileBiologicalPartGeometry(recipeOnlyFoot, resolved), "recipe-only-foot");

for (const category of ["foot", "hand", "hoof", "nose", "sensory-field", "ear", "soft-tissue", "mammary", "barbel", "antenna"]) {
	const genericPart = {
		semanticCategory: category,
		parameters: {}
	};
	assert.equal(canCompileBiologicalPart(genericPart), false, `${category} remains generic`);
	assert.equal(compileBiologicalPartGeometry(genericPart, resolved), null);
}

function assertGeometry(geometry, label) {
	assert.ok(geometry, `${label} geometry exists`);
	assert.ok(geometry.positions.length >= 9, `${label} positions`);
	assert.ok(geometry.indices.length >= 3, `${label} indices`);
	assert.equal(geometry.positions.length % 3, 0, `${label} position stride`);
	assert.ok(geometry.positions.every(Number.isFinite), `${label} finite positions`);
	assert.ok(geometry.normals.every(Number.isFinite), `${label} finite normals`);
	const vertexCount = geometry.positions.length / 3;
	assert.ok(geometry.indices.every(index => index >= 0 && index < vertexCount), `${label} valid indices`);
}

console.log('B"H | biologicalCompilerCoverage.test.mjs passed');
