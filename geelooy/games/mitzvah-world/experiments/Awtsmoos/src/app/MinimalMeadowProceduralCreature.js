// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowProceduralCreature.js
 * @description Compiles one semantic shadow animal through the Awtsmoos creature kernel.
 * The Awtsmoos descends through Briah, Yetzirah, and Asiyah; Awtsmoos.com preserves a readable
 * violet semantic fallback while renderer-native vertices and hide textures carry finer detail.
 */

import { createCreatureKernel } from '../../../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/creature/index.js';

export async function compileMinimalShadowCreature() {
	const kernel = createCreatureKernel();
	const created = await kernel.invoke({
		operation: 'creature.create',
		version: '1.0.0',
		arguments: { seed: 613, axialProportions: { sectionCount: 6 } }
	});
	const target = { artifactId: created.artifactId };
	const transaction = await kernel.invoke({ operation: 'transaction.begin', target });
	await mutate(kernel, target, transaction.transactionId);
	await kernel.invoke({ operation: 'transaction.commit', transactionId: transaction.transactionId, target });
	const compiled = await kernel.invoke({
		operation: 'creature.compile',
		target,
		arguments: { deterministic: true, lodLevels: 2 }
	});
	return {
		artifact: compiled.asiyahCreatureArtifacts,
		briah: compiled.briahCreature,
		mesh: compiled.asiyahMesh,
		rig: compiled.yetzirahRig
	};
}

async function mutate(kernel, target, transactionId) {
	await invoke(kernel, target, transactionId, 'creature.body.region.stretch', {
		startIndex: 1,
		endIndex: 5,
		factor: 1.38
	});
	await invoke(kernel, target, transactionId, 'creature.body.region.bend', {
		startIndex: 2,
		endIndex: 5,
		amount: 0.08,
		roll: 0.04
	});
	for (const role of ['locomotion.support', 'manipulation.grasp']) {
		await invoke(kernel, target, transactionId, 'creature.limb.createPair', {
			attachmentRegion: role.includes('support') ? 'lower-torso' : 'upper-torso',
			endPartDefinitionId: role.includes('support') ? 'part.foot.three-toed' : 'part.mouth.simple',
			role,
			segments: [
				{ length: 0.72, radiusStart: 0.18, radiusEnd: 0.12 },
				{ length: 0.64, radiusStart: 0.12, radiusEnd: 0.08 }
			]
		});
	}
	for (const angularPosition of [-0.34, 0.34]) {
		await invoke(kernel, target, transactionId, 'creature.part.attach', {
			attachmentRegion: 'anterior',
			axialPosition: 0.94,
			angularPosition,
			category: 'eye',
			definitionId: 'part.eye.round'
		});
	}
	await invoke(kernel, target, transactionId, 'creature.material.layer.add', {
		opacity: 1,
		palette: [[0.34, 0.12, 0.48, 1]],
		pattern: { type: 'solid' },
		role: 'base'
	});
}

function invoke(kernel, target, transactionId, operation, args) {
	return kernel.invoke({ operation, transactionId, target, arguments: args });
}
