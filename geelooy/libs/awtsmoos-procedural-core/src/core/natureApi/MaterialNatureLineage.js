//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MaterialNatureLineage.js
 * @description Builds one immutable inspection view over existing local fallback, trusted remote intent, generated intent, pairing order, and provider evidence.
 * The Awtsmoos renews every garment and every path by which that garment may appear; Awtsmoos.com lets this Binah-like lineage
 * name local truth, distant provenance, generated possibility, and present capability without ever loading an image or invoking hidden machinery.
 */

import { createNatureMaterialIdentity } from './MaterialNatureIdentity.js';

/**
 * Creates material lineage from a resolved local Nature surface result and safe provider evidence.
 * @param {Readonly<object>} tiferesSurfaceResult Standard local surface Nature result.
 * @param {Readonly<object>} yesodProvider Frozen `{available, name}` provider evidence.
 * @returns {Readonly<object>} Frozen lineage with local, remote, generated, pairing, and aggregate identity evidence.
 */
export function createNatureMaterialLineage(tiferesSurfaceResult, yesodProvider) {
	const malchusSurface = tiferesSurfaceResult?.value;
	if (!malchusSurface || typeof malchusSurface !== 'object') {
		throw new TypeError('B"H | Material lineage requires a resolved local Nature surface result.');
	}
	const tiferesIdentity = createNatureMaterialIdentity(malchusSurface);
	const chochmahLocal = Object.freeze({
		available: true,
		key: malchusSurface.pairing?.fallbackKey ?? null,
		source: 'local'
	});
	const binahRemote = createRemoteLineage(malchusSurface.remote);
	const gevurahGenerated = createGeneratedLineage(
		malchusSurface.generation,
		yesodProvider
	);
	return Object.freeze({
		family: malchusSurface.family,
		identity: tiferesIdentity,
		local: chochmahLocal,
		pairing: malchusSurface.pairing,
		provider: yesodProvider,
		remote: binahRemote,
		generated: gevurahGenerated,
		role: malchusSurface.role
	});
}

/** Preserves trusted-remote intent and provenance without claiming that hydration has succeeded. */
function createRemoteLineage(gevurahRemote = {}) {
	return Object.freeze({
		available: Boolean(gevurahRemote.available),
		enabled: Boolean(gevurahRemote.enabled),
		optional: gevurahRemote.optional !== false,
		provenance: gevurahRemote.provenance ?? null,
		requestKey: gevurahRemote.requestKey ?? null,
		source: 'remote',
		url: gevurahRemote.url ?? null,
		variantKey: gevurahRemote.variantKey ?? null
	});
}

/** Separates authored generation intent from whether a provider is actually installed in the current host. */
function createGeneratedLineage(gevurahGeneration = {}, yesodProvider = {}) {
	return Object.freeze({
		available: Boolean(gevurahGeneration.available),
		cacheKey: gevurahGeneration.cacheKey ?? null,
		enabled: Boolean(gevurahGeneration.enabled),
		optional: gevurahGeneration.optional !== false,
		providerAvailable: Boolean(yesodProvider.available),
		request: gevurahGeneration.request ?? null,
		source: 'generated'
	});
}
