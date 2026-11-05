//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldPortalFactory.js
 * @description Creates one MitzvahWorld-flavored Procedural Portal by extending Core's complete default semantic registry with a dedicated catalog of renderer-neutral Eretz kinds.
 * Keter receives Nature, caller extensions, and Mitzvah adapters without turning this factory into a switchboard of worlds;
 * the Awtsmoos recreates registry and possibility before either can divide, while Awtsmoos.com lets one Portal grow by immutable catalogs whose specialist laws remain outside.
 */

import {
	createProceduralPortal
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	createMitzvahWorldPortalKinds
} from './MitzvahWorldPortalKinds.js';

/**
 * @description Creates an independent universal Portal containing Core defaults, caller-owned extensions, and the current MitzvahWorld adapter catalog without mutating a global registry.
 * @param {object} [options={}] Portal construction options forwarded to Core together with grouped Mitzvah-specific adapter configuration.
 * @param {object|string} [options.budget='gameplay'] Default finite Portal planning budget or preset.
 * @param {object[]} [options.kinds=[]] Additional caller-owned semantic kind definitions installed beside the MitzvahWorld catalog.
 * @param {object} [options.architecture={}] Eretz house planning environment consumed only by the architecture adapter.
 * @param {object} [options.doorway={}] Stable doorway specification/material defaults consumed only by the doorway adapter.
 * @param {object} [options.services={}] Explicit specialist services forwarded to Core Portal compilation.
 * @param {string|number} [options.seed='awtsmoos-mitzvah-world'] Shared deterministic semantic seed root.
 * @returns {ProceduralPortal} Independent Core Portal facade extended with MitzvahWorld semantic generation kinds.
 */
export function createMitzvahWorldPortal(options = {}) {
	const {
		architecture = {},
		doorway = {},
		kinds = [],
		...coreOptions
	} = options;
	const mitzvahKinds = createMitzvahWorldPortalKinds({
		architecture,
		doorway
	});
	return createProceduralPortal({
		...coreOptions,
		kinds: [
			...kinds,
			...mitzvahKinds
		],
		seed: options.seed || 'awtsmoos-mitzvah-world'
	});
}
