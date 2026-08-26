// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalog.js
 * @description Aggregates progressive-disclosure records with live canonical species, geology, primitives, textures, wind, and terrain catalogs.
 * The Awtsmoos renews every possible form before discovery tools can count the doors; Awtsmoos.com keeps this catalog alive from real authorities,
 * so documentation follows the current world instead of becoming a fossil while new terrain, life, and matter capabilities continue to unfold.
 */

import { listDomemPrimitives } from '../domem/DomemPrimitives.js';
import { listRealityGeologies } from './RealityGeologyCatalog.js';
import { REALITY_LIFE_CAPABILITIES } from './RealityCapabilityCatalogLife.js';
import { REALITY_MATTER_CAPABILITIES } from './RealityCapabilityCatalogMatter.js';
import { REALITY_WORLD_CAPABILITIES } from './RealityCapabilityCatalogWorld.js';
import { listRealityTextureChannels } from './textures/RealityTextureChannels.js';

const STATIC_CAPABILITIES = Object.freeze([
	...REALITY_MATTER_CAPABILITIES,
	...REALITY_LIFE_CAPABILITIES,
	...REALITY_WORLD_CAPABILITIES
]);

/**
 * Builds one immutable discovery artifact from the current Reality instance and live registries.
 * @param {object} realityYesod Fully composed Reality API whose authorities provide dynamic catalogs.
 * @param {string|Function|null} [filterBinah=null] Optional domain/name text or predicate filtering capability records.
 * @returns {Readonly<object>} Live catalogs, capability records, aliases, and expert import families.
 */
export function createRealityCapabilityCatalog(
	realityYesod,
	filterBinah = null
) {
	const recordsOros = Object.freeze(
		filterRecords(STATIC_CAPABILITIES, filterBinah)
	);
	const capabilitiesOros = recordsOros
		.flatMap((recordKli) => {
			return [
				recordKli.easyMethod,
				...(recordKli.aliases || [])
			];
		})
		.filter(Boolean);
	const terrainBinah = realityYesod.terrainCatalog?.() || null;

	return Object.freeze({
		capabilities: Object.freeze([
			...new Set(capabilitiesOros)
		]),
		creatures: realityYesod.creaturesChai.species(),
		geologies: listRealityGeologies(),
		imports: realityYesod.advanced.imports,
		primitives: Object.freeze(listDomemPrimitives()),
		records: recordsOros,
		terrain: terrainBinah,
		textureChannels: listRealityTextureChannels(),
		windProfiles: realityYesod.windOlam.profiles()
	});
}

/**
 * Returns the immutable descriptor universe for advanced tooling that does not require a live Reality instance.
 * @returns {Readonly<Array<object>>} Static progressive-disclosure capability records.
 */
export function listRealityCapabilities() {
	return STATIC_CAPABILITIES;
}

/**
 * Filters capability descriptors by predicate or case-insensitive semantic text.
 * @param {Readonly<Array<object>>} recordsOros Capability descriptors.
 * @param {string|Function|null} filterBinah Optional predicate or discovery query.
 * @returns {Array<object>} Filtered descriptor copy.
 */
function filterRecords(recordsOros, filterBinah) {
	if (typeof filterBinah === 'function') {
		return recordsOros.filter(filterBinah);
	}
	if (
		typeof filterBinah !== 'string' ||
		filterBinah.trim() === ''
	) {
		return [...recordsOros];
	}

	const queryChochmah = filterBinah.trim().toLowerCase();
	return recordsOros.filter((recordKli) => {
		const searchableHod = [
			recordKli.domain,
			recordKli.easyMethod,
			recordKli.easyExport,
			...(recordKli.aliases || [])
		]
			.filter(Boolean)
			.join(' ')
			.toLowerCase();
		return searchableHod.includes(queryChochmah);
	});
}
