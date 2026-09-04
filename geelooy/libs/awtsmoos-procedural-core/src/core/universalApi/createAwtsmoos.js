//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAwtsmoos.js
 * @description Creates the full universal facade by extending the same lightweight lifecycle authorities with Procedural Portal orchestration and transactional world/history/runtime composition.
 * The Awtsmoos renews semantic kernel, portal, and world before their neighboring powers appear as one kingdom;
 * Awtsmoos.com keeps the full gate additive so lightweight callers and world builders share identical compiler and provenance wisdom.
 */
import { createProceduralPortal } from '../proceduralPortal/createProceduralPortal.js';
import { Awtsmoos } from './Awtsmoos.js';
import { createAwtsmoosAuthorities } from './createAwtsmoosAuthorities.js';
import { createUniversalAwtsmoosApi } from './createUniversalApi.js';

/**
 * @description Creates the full five-verb facade with Portal and transactional world authorities.
 * @param {object} [options={}] Lifecycle options plus optional existing portal/world or portalOptions/worldOptions.
 * @returns {Awtsmoos} Frozen full universal facade.
 */
export function createAwtsmoos(options = {}) {
	const base = createAwtsmoosAuthorities(options);
	const portal = options.portal || createProceduralPortal({
		...(options.portalOptions || {}),
		proceduralKernel: base.semantic,
		seed: options.portalOptions?.seed ?? options.seed ?? 'awtsmoos'
	});
	const world = options.world || createUniversalAwtsmoosApi(options.worldOptions || {});
	return new Awtsmoos(Object.freeze({...base, portal, world}), options);
}
