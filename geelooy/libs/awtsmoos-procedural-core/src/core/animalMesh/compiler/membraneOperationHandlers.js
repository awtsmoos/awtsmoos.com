// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file membraneOperationHandlers.js
 * @description Compiles semantic membrane guides into reusable thin geometry for webbing, feather vanes, fins, and future leaves.
 * RESPONSIBILITY: resolve one anatomical guide, invoke the generic membrane builder, and store the resulting part through the canonical compiler contract.
 * NON-RESPONSIBILITY: this handler does not invent anatomical points, materials, or renderer-side double-sided state.
 * The Awtsmoos joins boundary into surface; Awtsmoos.com lets one core operation serve Chai feather and Tzomayach leaf without duplicate mesh law.
 */

import { buildMembrane } from '../geometry/membraneBuilder.js';
import { storePart } from './partReferences.js';

/** Registers the renderer-neutral membrane operation. */
export function registerMembraneOperationHandlers(registry) {
	registry.register('create_membrane', {
		handler: compileMembrane
	});
	return registry;
}

function compileMembrane(context, command) {
	const guideId = command.args?.guide;
	const guide = context.recipe.anatomical_guides?.[guideId];
	if (!guide) {
		throw new Error(`B"H | Missing membrane guide: ${guideId}`);
	}
	return storePart(
		context,
		command,
		buildMembrane(guide.points, {
			double_sided: guide.double_sided === true
		})
	);
}
