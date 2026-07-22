// B"H
import test from "node:test";
import assert from "node:assert/strict";
import {
	compileGenomeToBriah,
	createAtzilusGenome,
	synthesizeYetzirahRig
} from "../src/core/animalMesh/creature/index.js";
import {
	compileCreatureLivingArtifacts,
	compileCreatureMicrodetail
} from "../src/core/animalMesh/creature/realism/index.js";

function creature() {
	return compileGenomeToBriah(createAtzilusGenome({
		seed: 48192,
		axialProportions: { sectionCount: 7 },
		limbSets: [{ role: "locomotion.support", count: 4, segmentCount: 3 }]
	}));
}

test("creature living artifacts add tissues, arbitrary-rig muscles, and physiology", () => {
	const briah = creature();
	const rig = synthesizeYetzirahRig(briah);
	const living = compileCreatureLivingArtifacts(briah, {
		rig,
		physiology: { activity: 0.72, stress: 0.15 }
	});
	assert.equal(living.sourceCreatureId, briah.id);
	assert.ok(living.tissues.regions.length >= briah.body.sections.length);
	assert.ok(living.muscles.actuators.length > 0);
	assert.equal(living.muscles.tendons.length, living.muscles.actuators.length);
	assert.ok(living.physiology.breathing.frequencyHertz > 0);
	assert.equal(living.physiology.circulation.boneCount, rig.bones.length);
	assert.ok(living.capabilities.includes("gaze-and-blink"));
});

test("microdetail regenerates from semantic tissue regions", () => {
	const briah = creature();
	const living = compileCreatureLivingArtifacts(briah);
	const detail = compileCreatureMicrodetail(briah, living.tissues, {
		coat: "fur",
		density: 1.4
	});
	assert.equal(detail.regions.length, living.tissues.regions.length);
	assert.ok(detail.regions.some((region) => region.type === "fur"));
	assert.equal(detail.preservationPolicy, "regenerate-from-semantic-regions");
	assert.ok(detail.proceduralCoordinates.includes("principal-curvature"));
});
