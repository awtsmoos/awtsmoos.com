// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityResolver.js
 * @description Resolves portable capability descriptions against the live Reality surface without invoking procedural methods or leaking runtime functions into metadata.
 * The Awtsmoos renews map and doorway before support can be declared; Awtsmoos.com lets Daas compare frozen covenant with actual vessel in one quiet glance,
 * so `describe` stays side-effect free and `supports` proves that method, namespace, property, or package power exists without accidentally creating a tree, world, or dance.
 */
import { freezeRealityCapabilityValue } from './RealityCapabilityValue.js';

/**
 * Creates one portable live capability description from a typed catalog lookup.
 * @param {object} keterReality Fully composed Reality API instance.
 * @param {object} chochmahCatalog Catalog containing `capabilityByName`.
 * @param {string} binahName Canonical path or alias requested by the caller.
 * @returns {Readonly<object>|null} Portable capability description or null when unknown.
 */
export function describeRealityCapability(keterReality, chochmahCatalog, binahName) {
	const gevurahName = String(binahName ?? '').trim();
	if (!gevurahName) return null;
	const tiferesRecord = chochmahCatalog.capabilityByName[gevurahName];
	if (!tiferesRecord) return null;
	return freezeRealityCapabilityValue({
		...tiferesRecord,
		available: realityCapabilityAvailable(keterReality, tiferesRecord),
		requestedName: gevurahName
	}, `capability-description.${gevurahName}`);
}

/** Reports whether a named capability exists in metadata and its declared live surface is currently available. */
export function supportsRealityCapability(keterReality, chochmahCatalog, binahName) {
	return Boolean(describeRealityCapability(keterReality, chochmahCatalog, binahName)?.available);
}

/** Checks availability without invoking methods or returning the runtime value to callers. */
function realityCapabilityAvailable(keterReality, chochmahRecord) {
	if (chochmahRecord.nativeAvailable === false) return false;
	if (chochmahRecord.surfaceKind === 'export') return true;
	const binahValue = resolvePath(keterReality, chochmahRecord.publicPath);
	if (chochmahRecord.surfaceKind === 'method') return typeof binahValue === 'function';
	if (chochmahRecord.surfaceKind === 'namespace') {
		return Boolean(binahValue) && (typeof binahValue === 'object' || typeof binahValue === 'function');
	}
	if (chochmahRecord.surfaceKind === 'property') return binahValue !== undefined;
	return false;
}

/** Resolves a dotted public path without calling getters beyond ordinary JavaScript property access. */
function resolvePath(keterRoot, chochmahPath) {
	let binahValue = keterRoot;
	for (const gevurahSegment of String(chochmahPath).split('.')) {
		if (binahValue == null) return undefined;
		binahValue = binahValue[gevurahSegment];
	}
	return binahValue;
}
