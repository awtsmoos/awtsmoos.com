//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalFacadeDiscovery.js
 * @description Keeps semantic capability discovery and immutable registry derivation outside the small public ProceduralPortal verb surface.
 * The Awtsmoos is one before description and extension, while every finite API needs both; Awtsmoos.com lets this Chochmah-like helper
 * reveal editor-ready kind truth and widen one Portal registry without mutating the source facade or exposing hidden runtime functions.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { createPortalInspectorSchema } from '../schema/PortalInspectorSchema.js';

/**
 * @description Creates global Portal capability metadata or one semantic kind's complete discovery record plus generated inspector schema.
 * @param {object} portal ProceduralPortal-like facade whose registry, budget, and seed should be described.
 * @param {string|null} [kind=null] Optional canonical semantic kind or friendly alias.
 * @returns {Readonly<object>} Frozen JSON-safe discovery metadata.
 */
export function describeProceduralPortal(portal, kind = null) {
	if (kind) {
		const definition = portal.registry.resolve(kind);
		return freezeLanguageValue({
			definition: definition.describe(),
			inspector: createPortalInspectorSchema(portal.registry, kind)
		});
	}
	return freezeLanguageValue({
		budget: portal.budget,
		kinds: portal.registry.describe(),
		seed: portal.seed,
		type: 'procedural-portal',
		version: 1
	});
}

/**
 * @description Derives a registry by installing additional semantic kinds one at a time, preserving the base registry unchanged.
 * @param {object} baseRegistry Source immutable PortalKindRegistry.
 * @param {object[]} [kinds=[]] Additional semantic kind definitions installed only in the derived registry.
 * @returns {object} Derived PortalKindRegistry containing every requested extension.
 */
export function derivePortalRegistry(baseRegistry, kinds = []) {
	return kinds.reduce((current, definition) => {
		return current.with(definition);
	}, baseRegistry);
}
