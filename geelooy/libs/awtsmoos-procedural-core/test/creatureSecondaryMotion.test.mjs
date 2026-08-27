// B"H
// Boruch Hashem
// Blessed is He
/** Creature secondary-motion evidence proves semantic life without Briah mutation. */

import assert from "node:assert/strict";
import test from "node:test";
import {
	CREATURE_OPERATION_NAMES,
	createCreatureKernel,
	evaluateCreatureSecondaryMotion
} from "../src/core/animalMesh/creature/index.js";

function bone(id, semanticRole) {
	return Object.freeze({
		id,
		sourceAnatomyId: `anatomy:${id}`,
		semanticRole,
		radius: 0.1,
		retargetingRole: semanticRole
	});
}

test("kernel exposes deterministic breathing as a derived creature operation", async () => {
	assert.ok(CREATURE_OPERATION_NAMES.includes(
		"creature.motion.secondary.evaluate"
	));
	const kernel = createCreatureKernel();
	const created = await kernel.invoke({
		operation: "creature.create",
		arguments: { seed: 3917, axialProportions: { sectionCount: 5 } }
	});
	const target = { artifactId: created.artifactId };
	const input = {
		operation: "creature.motion.secondary.evaluate",
		target,
		arguments: { time: 1.25, breathingAmplitude: 0.04 }
	};
	const first = await kernel.invoke(input);
	const second = await kernel.invoke(input);
	assert.deepEqual(first, second);
	assert.ok(first.controls.some(control => control.role === "breathing"));
	assert.equal(first.diagnostics.briahMutated, false);
	assert.equal(first.diagnostics.constraintsAuthoritativeInRig, true);
});

test("arbitrary semantic roles derive gaze, softness, propulsion, and contact", () => {
	const creature = Object.freeze({ id: "briah-secondary-test" });
	const rig = Object.freeze({
		id: "yetzirah-secondary-test",
		bones: Object.freeze([
			bone("spine", "axial.spine"),
			bone("eye", "sensory.eye.left"),
			bone("tail", "secondary.tail"),
			bone("wing", "propulsion.wing"),
			bone("foot", "locomotion.support.left.endpoint")
		]),
		controlGraph: Object.freeze({
			contactTargets: Object.freeze([
				Object.freeze({ id: "contact-foot", boneId: "foot" })
			])
		})
	});
	const input = {
		time: 0.75,
		contactLoad: 0.8,
		propulsionEffort: 0.9,
		softness: 0.2
	};
	const first = evaluateCreatureSecondaryMotion(creature, rig, input);
	const second = evaluateCreatureSecondaryMotion(creature, rig, input);
	assert.deepEqual(first, second);
	assert.deepEqual(new Set(first.controls.map(control => control.role)), new Set([
		"breathing",
		"micro-saccade",
		"inertial-follow-through",
		"propulsion-flex",
		"contact-compression"
	]));
	assert.ok(first.controls.every(control => control.sourceAnatomyId));
});
