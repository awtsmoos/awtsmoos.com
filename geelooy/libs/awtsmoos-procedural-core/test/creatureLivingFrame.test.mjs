// B"H
import test from "node:test";
import assert from "node:assert/strict";
import {
	compileGenomeToBriah,
	createAtzilusGenome
} from "../src/core/animalMesh/creature/index.js";
import {
	compileCreatureLivingArtifacts,
	evaluateCreatureLivingFrame
} from "../src/core/animalMesh/creature/realism/index.js";

function living() {
	const creature = compileGenomeToBriah(createAtzilusGenome({
		seed: 112358,
		axialProportions: { sectionCount: 8 },
		limbSets: [{ role: "locomotion.support", count: 4, segmentCount: 3 }]
	}));
	return compileCreatureLivingArtifacts(creature, {
		physiology: { activity: 0.65, stress: 0.18 }
	});
}

test("living frame is deterministic for explicit time and controls", () => {
	const source = living();
	const controls = { reflexAmplitude: 0.05, breathingEffort: 1.2, attention: 0.8 };
	const first = evaluateCreatureLivingFrame(source, 1.25, controls);
	const second = evaluateCreatureLivingFrame(source, 1.25, controls);
	assert.deepEqual(first, second);
	assert.equal(first.sourceCreatureId, source.sourceCreatureId);
	assert.equal(first.muscles.length, source.muscles.actuators.length);
	assert.equal(first.tendons.length, source.muscles.tendons.length);
	assert.equal(first.breathing.length, source.physiology.breathing.phaseOffsets.length);
});

test("muscle, respiratory, pulse, sensory, and secondary signals stay bounded", () => {
	const frame = evaluateCreatureLivingFrame(living(), 3.75, {
		roles: { "locomotion.support.segment": 0.9 },
		pupilOffset: 0.2
	});
	for (const muscle of frame.muscles) {
		assert.ok(muscle.activation >= 0 && muscle.activation <= 1);
		assert.ok(muscle.lengthScale > 0.7 && muscle.lengthScale <= 1);
		assert.ok(muscle.radiusScale >= 1);
		assert.ok(muscle.force >= 0);
	}
	for (const section of frame.breathing) {
		assert.ok(section.scale > 0.9 && section.scale < 1.1);
	}
	assert.ok(frame.pulse.scale > 0.9 && frame.pulse.scale < 1.1);
	assert.ok(frame.sensory.blink >= 0 && frame.sensory.blink <= 1);
	assert.ok(frame.sensory.pupilDilation >= 0 && frame.sensory.pupilDilation <= 1);
	assert.equal(frame.sensory.gazeDirection.length, 3);
	assert.ok(frame.secondaryMotion.every((item) => Number.isFinite(item.angle)));
});
