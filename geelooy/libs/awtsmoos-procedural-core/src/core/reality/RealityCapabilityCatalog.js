//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalog.js
 * @description Composes the canonical Reality capability covenant with live intents, presets, Terrain, species, textures, wind, realism, aliases, and expert import evidence.
 * The Awtsmoos renews every possible doorway before discovery tools can count its finite name;
 * Awtsmoos.com lets one catalog feed humans, JSON, editors, docs, and agents without mistaking method, namespace, export, or native vessel for the same flame.
 */
import { listDomemPrimitives } from '../domem/DomemPrimitives.js';
import { natureProfileAliases } from '../natureApi/NatureProfileAliases.js';
import { REALITY_EFFECT_CAPABILITIES } from './RealityCapabilityCatalogEffects.js';
import { REALITY_LIFE_CAPABILITIES } from './RealityCapabilityCatalogLife.js';
import { REALITY_MATTER_CAPABILITIES } from './RealityCapabilityCatalogMatter.js';
import { REALITY_PROTOCOL_CAPABILITIES } from './RealityCapabilityCatalogProtocol.js';
import { REALITY_WORLD_CAPABILITIES } from './RealityCapabilityCatalogWorld.js';
import {
	filterRealityCapabilityNames,
	filterRealityCapabilityRecords,
	realityCapabilityPublicNames,
	summarizeRealityCapabilitySurfaces
} from './RealityCapabilityFilter.js';
import { listRealityGeologies } from './RealityGeologyCatalog.js';
import { createRealityRealismCatalog } from './RealityRealismCatalog.js';
import { listRealityTextureChannels } from './textures/RealityTextureChannels.js';

const STATIC_CAPABILITIES = Object.freeze([
	...REALITY_MATTER_CAPABILITIES,
	...REALITY_LIFE_CAPABILITIES,
	...REALITY_EFFECT_CAPABILITIES,
	...REALITY_WORLD_CAPABILITIES,
	...REALITY_PROTOCOL_CAPABILITIES
]);

/**
 * Builds one immutable discovery artifact from the live Reality instance and the canonical portable covenant.
 * @param {object} realityYesod Fully composed Reality API.
 * @param {string|Function|null} [filterBinah=null] Optional semantic text or record predicate.
 * @returns {Readonly<object>} Progressive-disclosure catalog spanning native, JSON, intent, realism, and expert surfaces.
 */
export function createRealityCapabilityCatalog(realityYesod, filterBinah = null) {
	const recordsOros = Object.freeze(filterRealityCapabilityRecords(STATIC_CAPABILITIES, filterBinah));
	const intentOros = filterRealityCapabilityNames(realityYesod.intents?.() || [], filterBinah);
	const presetOros = filterRealityCapabilityNames(realityYesod.presets?.() || [], filterBinah);
	const natureOros = filterRealityCapabilityNames(
		realityYesod.advanced.nature.operationRegistry.kinds(),
		filterBinah
	);
	return Object.freeze({
		capabilities: realityCapabilityPublicNames(recordsOros),
		creatures: realityYesod.creaturesChai.species(),
		effectPresets: realityYesod.effects.presetNames(),
		geologies: listRealityGeologies(),
		imports: realityYesod.advanced.imports,
		intentAliases: realityYesod.intentDaas?.aliases() || Object.freeze({}),
		intents: Object.freeze(intentOros),
		jsonCapabilities: Object.freeze(recordsOros.filter((recordKli) => recordKli.jsonEnabled)),
		natureOperations: Object.freeze(natureOros),
		primitives: Object.freeze(listDomemPrimitives()),
		profileAliases: natureProfileAliases(),
		realism: createRealityRealismCatalog(recordsOros),
		records: recordsOros,
		scenePresets: Object.freeze(presetOros),
		surfaces: summarizeRealityCapabilitySurfaces(recordsOros),
		terrain: realityYesod.terrainCatalog?.() || null,
		textureChannels: listRealityTextureChannels(),
		windProfiles: realityYesod.windOlam.profiles()
	});
}

/** Returns the immutable canonical Reality capability covenant without requiring a live instance. */
export function listRealityCapabilities() {
	return STATIC_CAPABILITIES;
}
