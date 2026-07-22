// B"H
// Boruch Hashem
// Blessed is He
/** Cross-system evidence proves one deterministic realism path without Blender runtime. */

import assert from "node:assert/strict";
import * as core from "../src/index.js";
import { createBlenderNodeExecutionPlan } from "../src/adapters/blender/index.js";
import { createBlenderBuiltinSchemaPack } from "../src/core/proceduralObject/nodeSystem/index.js";
import {
	listBotanicalSpecies,
	getBotanicalSpecies,
	planBotanicalFlowerOrgans
} from "../src/exports/vegetation.js";
import { evaluateCreatureSecondaryMotion } from "../src/core/animalMesh/creature/index.js";

const liquidState = core.createParticleGridLiquidState({
	id: "extreme-water",
	grid: {
		width: 8,
		height: 8,
		depth: 8,
		origin: [-1, -1, -1],
		cellSize: 0.25
	},
	particleSystem: {
		id: "extreme-water-particles",
		capacity: 2,
		particles: [{
			id: "extreme-water-source",
			position: [0, 0.3, 0],
			velocity: [3, 5, 0],
			mass: 1,
			size: 0.1,
			age: 0,
			lifetime: 5,
			attributes: {}
		}]
	}
});
const liquid = core.stepParticleGridLiquid3d(liquidState, {
	deltaTime: 0.03,
	quality: "high",
	secondaryParticles: {
		spraySpeed: 0.1,
		bubbleRiseSpeed: 0.01,
		maximumEvents: 8
	}
});
assert.ok(liquid.report.substeps >= 1);
assert.ok(liquid.secondaryParticleEvents.length > 0);

const secondarySystem = core.createParticleSystem({
	id: "extreme-secondary",
	seed: 12,
	capacity: 32,
	particles: []
});
const emitted = core.emitScheduledParticles(
	secondarySystem,
	{
		id: "extreme-liquid-events",
		type: "event",
		eventMultiplier: 2
	},
	{ events: liquid.secondaryParticleEvents },
	{ speed: 2, spread: 0.2, lifetime: 1.5, size: 0.03 }
);
assert.ok(emitted.report.emittedCount > 0);
const advanced = core.stepParticleSystemDetailed(emitted.system, {
	deltaTime: 0.04,
	quality: "high",
	forces: [
		{ type: "gravity" },
		{ type: "turbulence", seed: 81, frequency: 2, strength: 0.4 }
	]
});
assert.ok(Number.isFinite(advanced.report.kineticEnergyAfter));

const species = getBotanicalSpecies(listBotanicalSpecies()[0]);
const organs = planBotanicalFlowerOrgans({
	species,
	quality: "high",
	spread: 1
});
assert.ok(organs.counts.petals >= 3 && organs.counts.stamens >= 4);

const pack = createBlenderBuiltinSchemaPack();
const type = nativeType => pack.nodeSchemaPack.definitions.find(definition => (
	definition.metadata.nativeType === nativeType
))?.type;
const nodePlan = createBlenderNodeExecutionPlan({
	name: "extreme-water-material",
	kind: "material",
	nodes: [
		{ id: "noise", type: type("ShaderNodeTexNoise") },
		{ id: "principled", type: type("ShaderNodeBsdfPrincipled") },
		{ id: "output", type: type("ShaderNodeOutputMaterial") }
	],
	links: [
		{
			id: "noise-color",
			from: { nodeId: "noise", socketId: "color" },
			to: { nodeId: "principled", socketId: "base-color" }
		},
		{
			id: "surface",
			from: { nodeId: "principled", socketId: "bsdf" },
			to: { nodeId: "output", socketId: "surface" }
		}
	]
}, { schemaPack: pack });
assert.equal(nodePlan.executable, true);

const creatureMotion = evaluateCreatureSecondaryMotion(
	{ id: "extreme-creature" },
	{
		id: "extreme-rig",
		bones: [{
			id: "extreme-spine",
			sourceAnatomyId: "extreme-axis",
			semanticRole: "axial.spine",
			radius: 0.2
		}],
		controlGraph: { contactTargets: [] }
	},
	{ time: 0.75, breathingAmplitude: 0.04 }
);
assert.equal(creatureMotion.controls[0].role, "breathing");

console.log('B"H | extremeProceduralRealism.test passed');
