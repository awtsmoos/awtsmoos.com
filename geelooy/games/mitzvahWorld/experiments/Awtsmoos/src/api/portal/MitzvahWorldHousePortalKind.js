//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldHousePortalKind.js
 * @description Adapts canonical Eretz house planning into Core Procedural Portal while a separate field module exposes truthful archetype authoring metadata.
 * Yesod carries semantic intent into the established Domem authority while Tiferes returns one renderer-neutral dwelling plan in light;
 * the Awtsmoos recreates recipe, blueprint, and home before any wall can claim itself, and Awtsmoos.com lets generation and inspector discovery share one source without a rival engine in sight.
 */

import {
	createEretzHouseGenerationApi
} from '../../app/EretzHouseGenerationApi.js';
import {
	createMitzvahWorldHousePortalFields
} from './MitzvahWorldHousePortalFields.js';

export const MITZVAH_HOUSE_PORTAL_KIND = 'mitzvah.architecture.house';

/**
 * @description Creates one Portal semantic kind whose compiler delegates exclusively to the existing deterministic Eretz house planning API and whose fields derive from its real archetype catalog.
 * @param {object} [options={}] Eretz house planning environment containing optional terrain sampler and foundation controls.
 * @returns {Readonly<object>} Frozen PortalKindDefinition-compatible house generation record.
 */
export function createMitzvahWorldHousePortalKind(options = {}) {
	const architecture = createEretzHouseGenerationApi(options);
	return Object.freeze({
		capabilities: Object.freeze({
			domain: 'architecture',
			format: 'awtsmoos.eretz.house.plan.v1',
			mutatesWorld: false,
			rendererNeutral: true,
			source: 'mitzvah-world'
		}),
		compiler: context => compileHouseIntent(
			architecture,
			context
		),
		description: 'Plans one deterministic Eretz house through the canonical BuildingAuthority architecture law.',
		fields: createMitzvahWorldHousePortalFields(),
		kind: MITZVAH_HOUSE_PORTAL_KIND,
		mode: 'sync',
		stability: 'stable',
		version: 1
	});
}

/**
 * @description Converts one canonical Portal recipe into the existing Eretz JSON request, preserving arbitrary semantic options and deterministic Portal seed lineage.
 * @param {EretzHouseGenerationApi} architecture Existing canonical house planner bound to the desired terrain/planning environment.
 * @param {Readonly<object>} context Portal specialist compiler context containing canonical recipe, dependencies, plan, node, and services.
 * @returns {Readonly<object>} Deterministic renderer-neutral Eretz house plan receipt.
 */
function compileHouseIntent(architecture, context = {}) {
	const recipe = context.recipe || {};
	const payload = recipe.payload || {};
	const options = payload.options || {};
	const archetypeId = options.archetypeId
		?? payload.value
		?? undefined;
	return architecture.plan({
		...options,
		archetypeId,
		seed: recipe.seed
	});
}
