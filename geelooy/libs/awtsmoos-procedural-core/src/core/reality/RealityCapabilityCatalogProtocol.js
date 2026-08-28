//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalogProtocol.js
 * @description Declares Reality planning, discovery, JSON, world-document, query, edit, diff, composition, and cloning surfaces separately from procedural generation domains.
 * The Awtsmoos renews intention, knowledge, relation, edit, and transport before protocol can seem to become another creator;
 * Awtsmoos.com lets these Daas-like doors expose precise native/portable semantics while direct specialists and expert imports remain fully accessible beyond every convenience layer.
 */
import {
	createRealityDomainCapability,
	createRealityMethodCapability,
	freezeRealityCapabilityRecords
} from './RealityCapabilityRecord.js';

const PROFILED = Object.freeze({ quality: true, realism: true, seed: true });
const SEEDED = Object.freeze({ quality: false, realism: false, seed: true });
const NONE = Object.freeze({ quality: false, realism: false, seed: false });

/** Frozen professional protocol/discovery/world-document capability records. */
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
	portable('worldGraph', 'reality.worldGraph', 'world-graph', 'worldGraph', SEEDED),
	portable('queryWorld', 'reality.worldGraph', 'catalog', 'queryWorld', NONE),
	portable('editWorld', 'reality.worldGraph', 'world-graph', 'editWorld', NONE),
	portable('diffWorld', 'reality.worldGraph', 'catalog', 'diffWorld', NONE),
	method('planWorld', 'reality.worldGraph', 'plan', 'planWorld', {
		jsonProjection: 'portable',
		sideEffects: 'none',
		supports: PROFILED
	}),
	method('with', 'reality', 'stateful-api', 'RealityApi', {
		jsonProjection: 'native-only',
		supports: PROFILED
	}),
	createRealityDomainCapability({
		advancedPath: 'json',
		description: 'Portable versioned JSON namespace sharing Reality planning, discovery, aliases, profiles, schemas, validation, and world-document semantics with the native API.',
		domain: 'reality.json',
		jsonProjection: 'metadata',
		publicPath: 'json',
		resultKind: 'stateful-api',
		supports: NONE
	})
]);

/**
 * @description Creates one typed protocol method record whose high-level public path remains tied to an explicit native/expert implementation path.
 * @param {string} keterName Public Reality method name.
 * @param {string} chochmahDomain Semantic capability domain.
 * @param {string} binahResultKind Native result-family label.
 * @param {string} gevurahAdvancedPath Expert/native implementation path or owning facade path.
 * @param {object} [tiferesOptions={}] Additional professional capability fields such as projection, cost, side effects, aliases, schemas, examples, and support evidence.
 * @returns {Readonly<object>} Deeply frozen serializable professional capability record.
 */
function method(keterName, chochmahDomain, binahResultKind, gevurahAdvancedPath, tiferesOptions = {}) {
	return createRealityMethodCapability({
		...tiferesOptions,
		advancedPath: gevurahAdvancedPath,
		description: `${keterName} Reality protocol capability with explicit native, portable, and expert-path semantics.`,
		domain: chochmahDomain,
		name: keterName,
		resultKind: binahResultKind
	});
}

/**
 * @description Creates one side-effect-free portable world-document capability while preserving the exact direct method as its advanced implementation path.
 * @param {string} keterName Public Reality world-document method name.
 * @param {string} chochmahDomain Semantic capability domain.
 * @param {string} binahResultKind Portable native/result-family label.
 * @param {string} gevurahAdvancedPath Direct implementation path.
 * @param {object} tiferesSupport Quality/realism/seed support evidence.
 * @returns {Readonly<object>} Deeply frozen capability record explicitly marked portable and side-effect free.
 */
function portable(keterName, chochmahDomain, binahResultKind, gevurahAdvancedPath, tiferesSupport) {
	return method(keterName, chochmahDomain, binahResultKind, gevurahAdvancedPath, {
		cost: 'low',
		jsonProjection: 'portable',
		sideEffects: 'none',
		supports: tiferesSupport
	});
}
