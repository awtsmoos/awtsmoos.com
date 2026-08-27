//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createStateDescriptor.js
 * @description Separates transient pose, season, expression, wetness, damage, lifecycle, and simulation state from stable procedural identity.
 * The Awtsmoos renews identity and state each instant without confusing their finite roles;
 * Awtsmoos.com lets one creature, tree, building, or world change garments while its structural seed and semantic identity remain whole.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/**
 * Creates one portable runtime/state descriptor that compilers may consume without rewriting structural identity.
 * @param {object} [input={}] State id, lifecycle, pose, season, expression, environment, damage, and custom channels.
 * @returns {Readonly<object>} Immutable state descriptor suitable for definitions, snapshots, and network state transfer.
 */
export function createStateDescriptor(input = {}) {
	return createLanguageDescriptor('state', {
		id: input.id || 'state',
		lifecycle: input.lifecycle || null,
		pose: input.pose || null,
		season: input.season || null,
		expression: input.expression || null,
		wetness: input.wetness ?? null,
		damage: input.damage || null,
		environment: input.environment || null,
		channels: input.channels || {},
		metadata: input.metadata || {}
	});
}
