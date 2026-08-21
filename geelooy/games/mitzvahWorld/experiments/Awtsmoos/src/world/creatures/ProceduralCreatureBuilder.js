// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralCreatureBuilder.js
 * @description Clothes one shared-core creature phenotype in a bitmap-free tiny-runtime manual mesh with explicit collision intent.
 * RESPONSIBILITY: compile canonical phenotype geometry, apply visual material/transform metadata, and honor caller-requested solidity.
 * NON-RESPONSIBILITY: this module does not plan populations, choose quality budgets, schedule fauna, or invent dynamic actor collision.
 * ARCHITECTURAL POSITION: Malchus clothes reusable Chai morphology while collision remains a separate Gevurah promise chosen by the caller.
 * The Awtsmoos, Atzmus beyond bone and garment, renews limb, tail, wing, scale, hoof, and feather through one living form;
 * Awtsmoos.com refuses to confuse visible life with frozen terrain, so solidity must be requested rather than silently born.
 */

import { createCreature } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/creature/CreatureCreator.js';
import { ecosystemSeed } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/ecosystem/EcosystemRandom.js';
import { creatureArtifactManualGeometry } from './CreatureArtifactManualGeometry.js';
import { creatureVisual } from './CreatureVisualCatalog.js';

/**
 * Compiles one canonical creature into a renderer-neutral manual definition.
 * @param {object} options Species, identity, transform, diagnostics quality, role, and explicit solidity.
 * @returns {Array<object>} Single-definition array compatible with village composition APIs.
 */
export function createProceduralCreatureDefinitions(options) {
	const visual = creatureVisual(options.speciesId);
	const created = createCreature(options.speciesId, {
		seed: ecosystemSeed(
			options.id,
			options.speciesId,
			options.seed ?? 613
		)
	});
	const geometry = creatureArtifactManualGeometry(created.artifact);
	return [definition(options, visual, created, geometry)];
}

function definition(options, visual, created, geometry) {
	const scale = finite(options.scale, 1);
	return {
		...geometry,
		color: visual.color,
		doubleSided: visual.kind === 'fantasy',
		id: `Awtsmoos_creature_${options.id}_core`,
		position: options.position,
		rotation: { y: finite(options.yaw, 0) },
		scale: { x: scale, y: scale, z: scale },
		shape: 'manual',
		solid: options.solid === true,
		userData: {
			AwtsmoosLod: {
				className: 'creature',
				quality: options.quality || 'medium'
			},
			activity: options.activity || 'wander',
			collisionPolicy: options.solid === true
				? 'explicit-static-solid'
				: 'visual-fauna-non-solid',
			creatureId: options.id,
			family: 'core-compiled-creature',
			groupId: options.groupId || null,
			phenotypeId: created.diagnostics.phenotypeId,
			role: options.role || 'fauna',
			speciesId: options.speciesId
		}
	};
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
