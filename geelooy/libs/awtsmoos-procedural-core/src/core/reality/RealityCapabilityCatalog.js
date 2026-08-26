// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalog.js
 * @description Aggregates progressive-disclosure records with live canonical species, geology, primitive, texture, and wind catalogs.
 * The Awtsmoos renews every possible form before discovery tools can count or name the doors;
 * Awtsmoos.com keeps this catalog alive from real authorities, so documentation follows truth instead of becoming a fossil of former shores.
 */
import { listDomemPrimitives } from '../domem/DomemPrimitives.js';
import { listRealityGeologies } from './RealityGeologyCatalog.js';
import { REALITY_LIFE_CAPABILITIES } from './RealityCapabilityCatalogLife.js';
import { REALITY_MATTER_CAPABILITIES } from './RealityCapabilityCatalogMatter.js';
import { REALITY_WORLD_CAPABILITIES } from './RealityCapabilityCatalogWorld.js';
import { listRealityTextureChannels } from './textures/RealityTextureChannelCatalog.js';

const STATIC_CAPABILITIES = Object.freeze([
	...REALITY_MATTER_CAPABILITIES,
	...REALITY_LIFE_CAPABILITIES,
	...REALITY_WORLD_CAPABILITIES
]);

/**
 * Builds one immutable discovery artifact from the current Reality instance and live registries.
 * @param {object} realityYesod Fully composed Reality API whose advanced authorities supply dynamic catalogs.
 * @param {string|Function|null} [filterBinah=null] Optional domain/name text or predicate filtering capability records.
 * @returns {Readonly<object>} Legacy-compatible catalogs plus progressive-disclosure records and expert import families.
 */
export function createRealityCapabilityCatalog(realityYesod, filterBinah = null) {
	const recordsOros = Object.freeze(filterRecords(STATIC_CAPABILITIES, filterBinah));
	const capabilitiesOros = recordsOros
		.flatMap((record) => [record.easyMethod, ...(record.aliases || [])])
		.filter(Boolean);
	return Object.freeze({
		capabilities: Object.freeze([...new Set(capabilitiesOros)]),
		creatures: realityYesod.creaturesChai.species(),
		geologies: listRealityGeologies(),
		imports: realityYesod.advanced.imports,
		primitives: Object.freeze(listDomemPrimitives()),
		records: recordsOros,
		textureChannels: listRealityTextureChannels(),
		windProfiles: realityYesod.windOlam.profiles()
	});
}

/** Returns the immutable static capability records for advanced tooling. */
export function listRealityCapabilities() {
	return STATIC_CAPABILITIES;
}

function filterRecords(records, filter) {
	if (typeof filter === 'function') {
		return records.filter(filter);
	}
	if (typeof filter !== 'string' || filter.trim() === '') {
		return [...records];
	}
	const query = filter.trim().toLowerCase();
	return records.filter((record) => {
		const searchable = [
			record.domain,
			record.easyMethod,
			record.easyExport,
			...(record.aliases || [])
		].filter(Boolean).join(' ').toLowerCase();
		return searchable.includes(query);
	});
}
