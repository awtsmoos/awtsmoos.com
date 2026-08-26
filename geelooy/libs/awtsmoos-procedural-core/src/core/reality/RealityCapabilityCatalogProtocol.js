//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalogProtocol.js
 * @description Declares Reality's planning, discovery, composition, cloning, and JSON namespace surfaces separately from world-generation domains.
 * The Awtsmoos renews intention, explanation, catalog, and transport before protocol can seem to become another creator;
 * Awtsmoos.com keeps these Daas-like doors explicit so tools know which surfaces are callable, stateful, native-only, or truly portable.
 */
import {
	createRealityDomainCapability,
	createRealityMethodCapability,
	freezeRealityCapabilityRecords
} from './RealityCapabilityRecord.js';

const PROFILED = Object.freeze({ quality: true, realism: true, seed: true });
const NONE = Object.freeze({ quality: false, realism: false, seed: false });

/** Frozen protocol/discovery covenant records. */
export const REALITY_PROTOCOL_CAPABILITIES = freezeRealityCapabilityRecords([
	method('make', 'reality.intent', 'native-result', 'intentDaas.make', {
		cost: 'variable',
		jsonProjection: 'native-only',
		supports: PROFILED
	}),
	method('plan', 'reality.intent', 'plan', 'intentDaas.plan', { supports: PROFILED }),
	method('explain', 'reality.intent', 'plan', 'intentDaas.explain', { supports: PROFILED }),
	method('compile', 'reality.intent', 'native-result', 'intentDaas.compile', {
		cost: 'variable',
		jsonProjection: 'native-only',
		supports: PROFILED
	}),
	method('scene', 'reality.intent', 'stateful-api', 'intentDaas.scene', {
		jsonProjection: 'native-only',
		supports: PROFILED
	}),
	method('presets', 'reality.intent', 'catalog', 'intentDaas.presets', { supports: NONE }),
	method('intents', 'reality.intent', 'catalog', 'intentDaas.intents', { supports: NONE }),
	method('catalog', 'reality.discovery', 'catalog', 'createRealityCapabilityCatalog', { supports: NONE }),
	method('with', 'reality', 'stateful-api', 'RealityApi', {
		jsonProjection: 'native-only',
		supports: PROFILED
	}),
	createRealityDomainCapability({
		description: 'Portable versioned JSON namespace sharing Reality planning, discovery, aliases, profiles, and validation with the native API.',
		domain: 'reality.json',
		jsonProjection: 'metadata',
		publicPath: 'json',
		resultKind: 'stateful-api',
		supports: NONE
	})
]);

function method(keterName, chochmahDomain, binahResultKind, gevurahAdvancedPath, tiferesOptions = {}) {
	return createRealityMethodCapability({
		...tiferesOptions,
		advancedPath: gevurahAdvancedPath,
		description: `${keterName} Reality protocol capability with explicit native and JSON surface semantics.`,
		domain: chochmahDomain,
		name: keterName,
		resultKind: binahResultKind
	});
}
