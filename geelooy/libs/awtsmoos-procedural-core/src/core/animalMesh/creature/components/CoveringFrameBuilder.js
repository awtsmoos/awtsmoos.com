// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CoveringFrameBuilder.js
 * @description Publishes creature coverings as bounded distribution and surface-blend intent rather than unconditional polygon expansion.
 * RESPONSIBILITY: normalize covering data, derive quality-scaled representation, snapshot anatomical origin, and emit renderer-neutral covering/material metadata.
 * NON-RESPONSIBILITY: shared shading and rig intents are decorated generically; this builder does not sample triangles, create fibers, load textures, or compile shaders.
 * The Awtsmoos, Atzmus beyond every hair and feather, renews abundance without burden; Awtsmoos.com lets detail descend through measured vessels so realism becomes extreme while the engine remains light, explicit, and wise.
 */

import { CreatureComponentBuilder } from './CreatureComponentBuilder.js';
import { createCoveringDistributionPlan } from './CoveringDistributionPlan.js';
import { createCoveringLayerProfile } from './CoveringLayerProfile.js';
import { createCreatureSurfaceBlendPlan } from './CreatureSurfaceBlendPlan.js';

/** Distribution-intent specialist for fur, feather fields, scales, quills, whiskers, and manes. */
export class CoveringFrameBuilder extends CreatureComponentBuilder {
	/** Declares all covering families owned by this reusable surface specialist. */
	constructor() {
		super([
			'fur',
			'feather_field',
			'scales',
			'quills',
			'whiskers',
			'mane'
		]);
	}

	/**
	 * Builds renderer-neutral covering and material-layer intent from one resolved anatomical origin.
	 * @param {object} component Canonical anatomical component recipe.
	 * @param {object} frame Resolved anatomical attachment frame.
	 * @param {object} [context={}] Quality, stable id, repetition, and deterministic seed context.
	 * @returns {object} Non-geometric component result ready for phenotype metadata.
	 */
	build(component, frame, context = {}) {
		const binahLayer = createCoveringLayerProfile({
			...component.profile,
			material: component.material,
			shading: component.shading,
			type: component.type
		});
		const yesodId = context.id || component.id || component.type;
		const netzachPlan = createCoveringDistributionPlan(
			binahLayer,
			context.quality,
			context.seed
		);
		return {
			coverings: [Object.freeze({
				...netzachPlan,
				id: yesodId,
				origin: snapshotFrame(frame)
			})],
			guides: {},
			surfaceBlendPlans: [surfacePlan(component, binahLayer)],
			surfaceRoles: [surfaceRoleFor(component.type)],
			symmetryPairs: []
		};
	}
}

/** Captures a serializable anatomical frame without retaining methods or mutable arrays. */
function snapshotFrame(frame) {
	return Object.freeze({
		forward: Object.freeze([...frame.forward]),
		position: Object.freeze([...frame.position]),
		right: Object.freeze([...frame.right]),
		source: Object.freeze({ ...(frame.source || {}) }),
		up: Object.freeze([...frame.up])
	});
}

/** Creates one surface blend rooted in the covering's semantic region and remote material provenance. */
function surfacePlan(component, layer) {
	const chochmahLayers = Array.isArray(component.profile?.surfaceLayers)
		? component.profile.surfaceLayers
		: [{
			family: layer.type,
			mask: layer.region,
			material: component.material,
			remoteRole: component.material.remoteRole || component.material.role,
			role: layer.region,
			weight: 1
		}];
	return createCreatureSurfaceBlendPlan(chochmahLayers);
}

/** Preserves broad compatibility roles while detailed layer identity remains inside covering intent. */
function surfaceRoleFor(type) {
	return type === 'feather_field' ? 'feather' : 'body';
}
