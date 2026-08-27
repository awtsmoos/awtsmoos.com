//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldVillagePortalKind.js
 * @description Adapts the spatially pure canonical village master plan into Core Procedural Portal while typed field metadata reveals optional district focus.
 * Tiferes gathers homes, roads, water, markets, cameras, biomes, and landmarks into one valley while Yesod preserves their measured relationships;
 * the Awtsmoos recreates village and traveler before runtime can claim the land, and Awtsmoos.com lets Portal reveal a complete world-plan document while inspector focus remains a side-effect-free lens in hand.
 */

import {
	CANONICAL_VILLAGE_PLAN
} from '../../world/village/CanonicalVillagePlan.js';
import {
	createMitzvahWorldVillagePortalFields
} from './MitzvahWorldVillagePortalFields.js';

export const MITZVAH_VILLAGE_PORTAL_KIND = 'mitzvah.world.village';

/**
 * @description Creates one renderer-neutral Portal kind whose compiler returns the canonical spatial village document plus optional district focus evidence exposed through typed metadata.
 * @returns {Readonly<object>} Frozen PortalKindDefinition-compatible village planning record.
 */
export function createMitzvahWorldVillagePortalKind() {
	return Object.freeze({
		capabilities: Object.freeze({
			domain: 'world',
			format: 'awtsmoos.eretz.village.plan.v1',
			mutatesWorld: false,
			rendererNeutral: true,
			source: 'mitzvah-world'
		}),
		compiler: context => compileVillageIntent(context),
		description: 'Reveals the canonical Eretz village master plan without awakening runtime side effects.',
		fields: createMitzvahWorldVillagePortalFields(),
		kind: MITZVAH_VILLAGE_PORTAL_KIND,
		mode: 'sync',
		stability: 'stable',
		version: 1
	});
}

/**
 * @description Projects the immutable canonical village plan into one Portal result while allowing callers to focus diagnostics on a named district without deleting surrounding world relationships.
 * @param {Readonly<object>} context Portal specialist context containing the canonical recipe and deterministic seed path.
 * @returns {Readonly<object>} Frozen village plan result containing format, seed, full canonical plan, and optional focused district.
 */
function compileVillageIntent(context = {}) {
	const recipe = context.recipe || {};
	const options = recipe.payload?.options || {};
	const districtId = String(options.districtId || '').trim();
	const district = districtId
		? CANONICAL_VILLAGE_PLAN.districts.find(value => value.id === districtId) || null
		: null;
	if (districtId && !district) {
		throw new RangeError(`Unknown canonical village district: ${districtId}`);
	}
	return Object.freeze({
		district,
		format: 'awtsmoos.eretz.village.plan.v1',
		plan: CANONICAL_VILLAGE_PLAN,
		seed: recipe.seed,
		version: CANONICAL_VILLAGE_PLAN.version
	});
}
