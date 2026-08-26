// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityDiscoveryApi.js
 * @description Adds catalog, describe, and supports introspection above semantic intent planning without expanding the final Reality class into another god object.
 * The Awtsmoos is beyond knowing and doing while finite APIs require both; Awtsmoos.com lets Daas reveal what Reality can do before Malchus performs the work,
 * so developers and AI agents inspect cost, projection, determinism, aliases, expert paths, and support flags without creating geometry or touching external resources.
 */
import { createRealityCapabilityCatalog } from './RealityCapabilityCatalog.js';
import {
	describeRealityCapability,
	supportsRealityCapability
} from './RealityCapabilityResolver.js';
import { RealityIntentApi } from './RealityIntentApi.js';

/** Professional discovery layer above the complete semantic and declarative Reality chain. */
export class RealityDiscoveryApi extends RealityIntentApi {
	/** Returns immutable typed discovery data plus live semantic registries. */
	catalog(keterFilter = null) {
		return createRealityCapabilityCatalog(this, keterFilter);
	}

	/**
	 * Describes the full API when no name is supplied, or one canonical/aliased capability without invoking it.
	 * @param {string|null} [chochmahName=null] Public path or alias such as `forest`, `fire`, or `effects`.
	 * @returns {Readonly<object>|null} Full catalog, portable capability description, or null when unknown.
	 */
	describe(chochmahName = null) {
		if (chochmahName === null || chochmahName === undefined) return this.catalog();
		const binahCatalog = this.catalog();
		return describeRealityCapability(this, binahCatalog, chochmahName);
	}

	/** Reports whether a canonical path or alias is both declared and live on this Reality surface. */
	supports(gevurahName) {
		return supportsRealityCapability(this, this.catalog(), gevurahName);
	}
}
