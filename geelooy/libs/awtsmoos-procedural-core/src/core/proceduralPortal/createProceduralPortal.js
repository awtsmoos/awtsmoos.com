//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file createProceduralPortal.js
 * @description Creates one self-contained semantic Portal whose registry and services are explicit rather than hidden in process-global mutation.
 * The Awtsmoos renews source and extension before either can claim ownership; Awtsmoos.com lets callers inherit the mature Nature engine,
 * add new semantic kinds, inject optional services, and choose seed/budget defaults while every resulting Portal remains independent and reproducible.
 */

import { createNatureApi } from '../natureApi/NatureApi.js';
import { ProceduralPortal } from './facade/ProceduralPortal.js';
import { createDefaultPortalRegistry } from './registry/createDefaultPortalRegistry.js';

/**
 * @description Creates the high-level Anything World Compiler facade with default Nature-backed semantic kinds plus optional extensions.
 * @param {object} [options={}] Portal, Nature, registry, provider, and service configuration.
 * @param {object|string} [options.budget='gameplay'] Default finite compilation budget.
 * @param {object[]} [options.kinds=[]] Additional semantic kind definitions installed in this Portal instance only.
 * @param {object} [options.nature] Nature-specific constructor options.
 * @param {object} [options.natureApi] Existing NatureApi-compatible service to reuse directly.
 * @param {object} [options.registry] Existing PortalKindRegistry to use instead of defaults.
 * @param {object} [options.services={}] Additional explicit specialist/provider services.
 * @param {string|number} [options.seed='awtsmoos'] Shared semantic/Nature seed intent.
 * @returns {ProceduralPortal} Frozen independent semantic Portal facade.
 */
export function createProceduralPortal(options = {}) {
	const nature = options.natureApi || createNatureApi(createNatureOptions(options));
	const registry = options.registry || createDefaultPortalRegistry(options.kinds || []);
	return new ProceduralPortal({
		budget: options.budget || 'gameplay',
		registry,
		seed: options.seed || 'awtsmoos',
		services: {
			...(options.services || {}),
			nature
		}
	});
}

/**
 * @description Builds Nature options from explicit nested configuration while allowing shared Portal quality, realism, seed, and texture provider defaults.
 * @param {object} options Portal factory options.
 * @returns {object} NatureApi constructor options.
 */
function createNatureOptions(options) {
	return {
		...(options.nature || {}),
		quality: options.nature?.quality ?? options.quality,
		realism: options.nature?.realism ?? options.realism,
		seed: options.nature?.seed ?? options.seed,
		textureGenerator: options.nature?.textureGenerator ?? options.textureGenerator
	};
}
