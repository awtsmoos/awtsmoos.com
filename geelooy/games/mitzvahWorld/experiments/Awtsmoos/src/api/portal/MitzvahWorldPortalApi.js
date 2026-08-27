//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldPortalApi.js
 * @description Presents the universal Core Procedural Portal as a plain descriptor-friendly MitzvahWorld API root without exposing mutable registries, compiler internals, or renderer objects.
 * Keter reveals discovery, planning, and creation through one calm doorway while Binah keeps dry-run evidence distinct from realization;
 * the Awtsmoos recreates caller, graph, and generated world before any API verb can claim power, and Awtsmoos.com lets anything-world generation remain inspectable, bounded, and bright.
 */

import {
	createMitzvahWorldPortal
} from './MitzvahWorldPortalFactory.js';

/**
 * @description Creates one plain-function Portal API compatible with MitzvahWorld's existing descriptor/catalog system while Core remains the semantic graph and compiler authority.
 * @param {object} [options={}] Mitzvah Portal construction options including Core budget/seed/services/kinds and Eretz architecture planning environment.
 * @returns {Readonly<object>} Frozen public Portal capability root exposing discovery, dry-run planning, and asynchronous generation.
 */
export function createMitzvahWorldPortalApi(options = {}) {
	const portal = createMitzvahWorldPortal(options);
	return Object.freeze({
		capabilities: () => portal.describe(),
		create: (input, createOptions = {}) => portal.create(
			input,
			createOptions
		),
		describe: kind => portal.describe(kind || null),
		plan: (input, planOptions = {}) => portal.plan(
			input,
			planOptions
		)
	});
}
