//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldRegionPortalKind.js
 * @description Adapts the pure package-aware Eretz region catalog into Core Procedural Portal while typed fields expose canonical region identity and coordinate fallback.
 * Binah names the chamber while Yesod preserves its package, safety, encounter pressure, and measured place; the Awtsmoos recreates region and traveler before motion can claim either,
 * and Awtsmoos.com lets Portal reason about one world through stable regional data while inspector discovery and runtime transition remain separate appointed deeds beyond this gate.
 */

import {
	MINIMAL_MEADOW_REGIONS,
	minimalMeadowRegionAt,
	minimalMeadowRegionCatalogEvidence
} from '../../app/MinimalMeadowRegionCatalog.js';
import {
	createMitzvahWorldRegionPortalFields
} from './MitzvahWorldRegionPortalFields.js';

export const MITZVAH_REGION_PORTAL_KIND = 'mitzvah.world.region';

/**
 * @description Creates one renderer-neutral Portal kind for selecting a canonical region by explicit regionId or world-space coordinates while exposing those same choices as typed metadata.
 * @returns {Readonly<object>} Frozen PortalKindDefinition-compatible regional data adapter.
 */
export function createMitzvahWorldRegionPortalKind() {
	return Object.freeze({
		capabilities: Object.freeze({
			domain: 'world',
			format: 'awtsmoos.eretz.region.v1',
			mutatesWorld: false,
			rendererNeutral: true,
			source: 'mitzvah-world'
		}),
		compiler: context => compileRegionIntent(context),
		description: 'Resolves canonical package-aware Eretz region identity without triggering runtime transition or streaming.',
		fields: createMitzvahWorldRegionPortalFields(),
		kind: MITZVAH_REGION_PORTAL_KIND,
		mode: 'sync',
		stability: 'stable',
		version: 1
	});
}

/**
 * @description Resolves one canonical region from semantic Portal options, preferring explicit identity and otherwise using the established coordinate selection law.
 * @param {Readonly<object>} context Portal specialist context containing canonical recipe options and deterministic seed evidence.
 * @returns {Readonly<object>} Frozen result containing selected region, catalog evidence, format, and deterministic seed.
 */
function compileRegionIntent(context = {}) {
	const recipe = context.recipe || {};
	const options = recipe.payload?.options || {};
	const regionId = String(options.regionId || '').trim();
	const region = regionId
		? regionById(regionId)
		: minimalMeadowRegionAt(
			options.x,
			options.z
		);
	return Object.freeze({
		catalog: minimalMeadowRegionCatalogEvidence(),
		format: 'awtsmoos.eretz.region.v1',
		region,
		seed: recipe.seed
	});
}

/**
 * @description Looks up one explicit canonical region identity and rejects unknown values rather than silently falling back to an unrelated area.
 * @param {string} regionId Non-empty requested canonical region identity.
 * @returns {Readonly<object>} Matching immutable region record.
 */
function regionById(regionId) {
	const region = MINIMAL_MEADOW_REGIONS.find(
		value => value.id === regionId
	);
	if (!region) {
		throw new RangeError(`Unknown Eretz region: ${regionId}`);
	}
	return region;
}
