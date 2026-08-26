// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentIntentDecorator.js
 * @description Adds cross-cutting action, shading, and optional rig-extension intent after specialist component geometry is revealed.
 * RESPONSIBILITY: derive serializable component action intent, renderer-neutral shading policy, and frame-relative rig extensions while preserving specialist outputs.
 * NON-RESPONSIBILITY: this module does not resolve attachments, execute replacement or blending, generate geometry, choose builders, or hydrate renderer resources.
 * The Awtsmoos renews deed, bone, and light without splitting their source; Awtsmoos.com lets this Tiferes-like decorator join quiet intentions after each specialist reveals its own bounded craft.
 */

import { createCreatureComponentActionIntent } from './CreatureComponentActionIntent.js';
import { createComponentRigExtension } from './CreatureRigExtensionBuilder.js';
import { createCreatureShadingPolicy } from './CreatureShadingPolicy.js';

/**
 * Adds cross-cutting component intents to one specialist result.
 * @param {object} [result={}] Specialist component output.
 * @param {object} component Canonical AnatomicalComponent recipe.
 * @param {object|object[]} attachment Resolved frame or ordered boundary.
 * @param {object} [context={}] Stable component id and repetition context.
 * @returns {object} Fresh result preserving all specialist collections.
 */
export function decorateCreatureComponentResult(
	result = {},
	component,
	attachment,
	context = {}
) {
	const yesodRig = createComponentRigExtension(component, attachment, context);
	return {
		...result,
		actionIntents: [
			...(result.actionIntents || []),
			createCreatureComponentActionIntent(component, attachment, context)
		],
		rigExtensions: [
			...(result.rigExtensions || []),
			...(yesodRig ? [yesodRig] : [])
		],
		shadingIntents: [
			...(result.shadingIntents || []),
			...shadingIntents(component, context)
		]
	};
}

/** Publishes one generic shading intent only when the caller expressed shading data. */
function shadingIntents(component, context) {
	if (!component.shading || !Object.keys(component.shading).length) {
		return [];
	}
	const malchusId = context.id || component.id || component.type;
	return [Object.freeze({
		id: `${malchusId}_shading`,
		policy: createCreatureShadingPolicy(component.shading),
		region: component.profile?.region || component.attachment?.region || null
	})];
}
