// B"H
// Boruch Hashem
// Blessed is He
/** Tissue evidence proves stable regions, activation, volume, wetness, and pressure coupling. */
import assert from "node:assert/strict";
import test from "node:test";
import {
	compileGenomeToBriah,
	createAtzilusGenome,
	synthesizeYetzirahRig
} from "../src/core/animalMesh/creature/index.js";
import { createCreatureEnvironmentCoupling } from "../src/core/animalMesh/creature/realism/createCreatureEnvironmentCoupling.js";
import { createCreatureMuscleProfile } from "../src/core/animalMesh/creature/realism/createCreatureMuscleProfile.js";
import { createCreatureSoftTissueState } from "../src/core/animalMesh/creature/realism/createCreatureSoftTissueState.js";
import { createCreatureTissueProfile } from "../src/core/animalMesh/creature/realism/createCreatureTissueProfile.js";
import { stepCreatureSoftTissue } from "../src/core/animalMesh/creature/realism/stepCreatureSoftTissue.js";

test("soft tissue responds deterministically to muscle activation and environment", () => {
	const creature = compileGenomeToBriah(createAtzilusGenome({ seed: 81 }));
	const rig = synthesizeYetzirahRig(creature);
	const tissue = createCreatureTissueProfile(creature);
	const muscles = createCreatureMuscleProfile(creature, rig);
	const state = createCreatureSoftTissueState(creature, tissue, muscles);
	const regionId = state.regions[0].regionId;
	const input = {
		deltaTime: 0.05,
		activations: { [regionId]: 1 },
		muscleBulgeDirection: [0, 0.1, 0],
		pressure: 1.2
	};
	const first = stepCreatureSoftTissue(state, input);
	const second = stepCreatureSoftTissue(state, input);
	assert.deepEqual(first, second);
	assert.equal(first.state.regions[0].activation, 1);
	assert.ok(first.state.regions[0].volumeScale > 1);
	assert.ok(first.report.maximumDisplacement > 0);
	const coupling = createCreatureEnvironmentCoupling(first.state, {
		waterLevel: 0.5,
		flow: [1, 0, 0]
	});
	assert.ok(coupling.regions.some(region => region.submerged));
	assert.ok(coupling.regions.some(region => region.wetness === 1));
});
