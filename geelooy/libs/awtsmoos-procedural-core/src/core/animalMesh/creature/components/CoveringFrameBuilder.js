// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CoveringFrameBuilder.js
 * @description Publishes rich biological creature coverings as bounded distribution and surface-blend intent instead of unconditional polygon expansion.
 * RESPONSIBILITY: resolve all canonical covering families, apply quality-scaled distribution policy, snapshot anatomical origin, and preserve material/surface provenance through the existing component result language.
 * NON-RESPONSIBILITY: shared shading and rig intents are decorated generically; this builder does not sample triangles, allocate fibers, compile shaders, or hydrate renderer resources.
 * The Awtsmoos, Atzmus beyond every hair, plume, scale, and quill, renews abundance without burden; Awtsmoos.com lets countless details descend through measured keilim, so a creature may become visually immense while the core remains portable, deterministic, and wise.
 */

import { CreatureComponentBuilder } from './CreatureComponentBuilder.js';
import { createCoveringDistributionPlan } from './CoveringDistributionPlan.js';
import {
	createCoveringLayerProfile,
	isFeatherCoveringType,
	listCoveringLayerTypes
} from './CoveringLayerProfile.js';
import { createCreatureSurfaceBlendPlan } from './CreatureSurfaceBlendPlan.js';

/** Distribution-intent specialist for every canonical biological covering family. */
export class CoveringFrameBuilder extends CreatureComponentBuilder {
	/** Declares the covering vocabulary directly from the canonical profile catalog. */
	constructor() {
		super(listCoveringLayerTypes());
	}

	/**
	 * Builds renderer-neutral covering and material-layer intent from one resolved anatomical origin.
	 * @param {object} component Canonical anatomical component recipe.
	 * @param {object} frame Resolved anatomical attachment frame.
	 * @param {object} [context={}] Quality, stable id, repetition, and deterministic seed context.
	 * @returns {object} Non-geometric component result ready for phenotype metadata and renderer adapters.
	 */
	build(component, frame, context = {}) {
		const binahLayer = createCoveringLayerProfile({
			...component.profile,
			material: component.material,
			region: coveringRegion(component),
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
			surfaceRoles: [surfaceRoleFor(binahLayer.type)],
			symmetryPairs: []
		};
	}
}

/** Resolves region shorthand from profile or surface attachment while preserving the legacy `body` default. */
function coveringRegion(component) {
	return String(
		component.profile?.region
		|| component.attachment?.region
		|| component.attachment?.targets?.[0]
		|| 'body'
	);
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

/** Preserves the broad legacy feather/body role while detailed biological identity stays in covering intent. */
function surfaceRoleFor(type) {
	return isFeatherCoveringType(type) ? 'feather' : 'body';
}
