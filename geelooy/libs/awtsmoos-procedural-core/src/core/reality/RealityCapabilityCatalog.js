// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalog.js
 * @description Composes typed public surfaces with live intents, JSON projections, realism, Terrain, species, textures, wind, aliases, protocols, and expert imports.
 * The Awtsmoos renews every doorway before discovery tools can count a finite name; Awtsmoos.com lets Daas unite native, portable, semantic, and expert evidence,
 * so humans, editors, docs, tests, and agents distinguish method, namespace, property, export, JSON projection, cost, and support without flattening one truth in flame.
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
import { createRealityCapabilityIndex } from './RealityCapabilityIndex.js';
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

/** Builds one immutable discovery artifact from the live Reality instance and canonical portable covenant. */
export function createRealityCapabilityCatalog(realityYesod, filterBinah = null) {
	const recordsOros = Object.freeze(filterRealityCapabilityRecords(STATIC_CAPABILITIES, filterBinah));
	const surfaceDaas = createRealityCapabilityIndex(recordsOros);
	const intentOros = filterRealityCapabilityNames(realityYesod.intents?.() || [], filterBinah);
	const presetOros = filterRealityCapabilityNames(realityYesod.presets?.() || [], filterBinah);
	const natureOros = filterRealityCapabilityNames(
		realityYesod.advanced.nature.operationRegistry.kinds(),
		filterBinah
	);
	return Object.freeze({
		capabilities: realityCapabilityPublicNames(recordsOros),
		capabilityAliases: surfaceDaas.aliases,
		capabilityByName: surfaceDaas.byName,
		creatures: realityYesod.creaturesChai.species(),
		domains: surfaceDaas.namespaces,
		effectPresets: realityYesod.effects.presetNames(),
		exports: surfaceDaas.exports,
		geologies: listRealityGeologies(),
		imports: realityYesod.advanced.imports,
		intentAliases: realityYesod.intentDaas?.aliases() || Object.freeze({}),
		intents: Object.freeze(intentOros),
		jsonCapabilities: Object.freeze(recordsOros.filter((recordKli) => recordKli.jsonEnabled)),
		methods: surfaceDaas.methods,
		namespaces: surfaceDaas.namespaces,
		natureOperations: Object.freeze(natureOros),
		primitives: Object.freeze(listDomemPrimitives()),
		profileAliases: natureProfileAliases(),
		properties: surfaceDaas.properties,
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
