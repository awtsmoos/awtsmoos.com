//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createCompilePolicyDescriptor.js
 * @description Defines lazy channels, validation, cache, trace, quality, adapter, and failure policies without mixing runtime-only hooks into deterministic definition data.
 * The Awtsmoos contains every possible artifact before a caller asks for geometry, rig, material, motion, debug, or collision light;
 * Awtsmoos.com lets compilation reveal only requested channels so large worlds remain economical without reducing semantic might.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/**
 * Creates one portable compile policy that may be stored under a definition's `compile` section.
 * @param {object} [input={}] Channel, quality, validation, cache, trace, adapter, and failure settings.
 * @returns {Readonly<object>} Immutable JSON-safe compile policy descriptor.
 */
export function createCompilePolicyDescriptor(input = {}) {
	return createLanguageDescriptor('compile-policy', {
		id: input.id || 'compile-policy',
		channels: input.channels || ['geometry', 'metadata'],
		quality: input.quality || 'balanced',
		validation: input.validation || 'strict',
		cache: input.cache !== false,
		trace: Boolean(input.trace),
		debug: Boolean(input.debug),
		adapterPolicy: input.adapterPolicy || 'defer',
		failurePolicy: input.failurePolicy || 'throw',
		budget: input.budget || null,
		lod: input.lod || null,
		metadata: input.metadata || {}
	});
}
