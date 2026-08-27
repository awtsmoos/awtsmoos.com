//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createStreamDescriptor.js
 * @description Defines deterministic world/object streaming intent for chunks, regions, priorities, budgets, and cancellation-aware consumers.
 * The Awtsmoos is present in every region before a camera approaches its finite boundary;
 * Awtsmoos.com records streaming policy as data so large worlds may reveal nearby vessels without changing distant identity.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/**
 * Creates one portable streaming policy descriptor without owning async iteration or transport implementation.
 * @param {object} [input={}] Chunk sizing, region, priority, preload, budget, and identity settings.
 * @returns {Readonly<object>} Immutable stream descriptor for world/domain compilers.
 */
export function createStreamDescriptor(input = {}) {
	return createLanguageDescriptor('stream', {
		id: input.id || 'stream',
		streamType: input.streamType || input.type || 'spatial-chunks',
		chunkSize: input.chunkSize || null,
		region: input.region || null,
		priority: input.priority || 'distance',
		preload: input.preload ?? 1,
		budget: input.budget || null,
		preserveIdentity: input.preserveIdentity !== false,
		metadata: input.metadata || {}
	});
}
