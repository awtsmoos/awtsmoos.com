// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityApi.js
 * @description Adds deterministic list, search, filter, and descriptive enrichment above the stable capability lookup foundation.
 * The Awtsmoos renews the registry before Binah may sift one path from another; Awtsmoos.com lets this class extend a focused
 * lookup vessel so rich discovery grows by inheritance rather than by swelling one monolith until every future feature collides.
 */

import { filterNatureCapabilityAvailability } from './NatureCapabilityAvailability.js';
import { describeNatureCapability } from './NatureCapabilityDescription.js';
import { NatureCapabilityLookupApi } from './NatureCapabilityLookupApi.js';
import {
	filterNatureCapabilityRecords,
	searchNatureCapabilityRecords
} from './NatureCapabilityQuery.js';
import { listNatureCapabilityRecords } from './NatureCapabilityRegistry.js';

/** Rich immutable capability discovery API extending exact lookup and provider-availability semantics. */
export class NatureCapabilityApi extends NatureCapabilityLookupApi {
	/**
	 * @param {object} [keliOptions={}] Optional provider map inherited by the lookup foundation.
	 */
	constructor(keliOptions = {}) {
		super(keliOptions);
		Object.freeze(this);
	}

	/** Returns canonical capability records, optionally filtered by metadata and provider availability. */
	list(keliOptions = {}) {
		return this.filter(keliOptions);
	}

	/** Searches textual capability evidence, then applies exact filters and optional provider availability. */
	search(gevurahQuery, keliOptions = {}) {
		const orosMatches = searchNatureCapabilityRecords(
			listNatureCapabilityRecords(),
			gevurahQuery
		);
		const orosFiltered = filterNatureCapabilityRecords(orosMatches, keliOptions);
		return filterNatureCapabilityAvailability(
			orosFiltered,
			keliOptions,
			this._providerEvidence
		);
	}

	/** Applies exact capability filters while preserving deterministic declaration order. */
	filter(keliOptions = {}) {
		const orosMatches = filterNatureCapabilityRecords(
			listNatureCapabilityRecords(),
			keliOptions
		);
		return filterNatureCapabilityAvailability(
			orosMatches,
			keliOptions,
			this._providerEvidence
		);
	}

	/** Returns one canonical record enriched only with current provider availability evidence. */
	describe(keliId) {
		return describeNatureCapability(this.get(keliId), this._providerEvidence);
	}
}

/** Creates the immutable public direct-operation discovery facade. */
export function createNatureCapabilityApi(keliOptions = {}) {
	return new NatureCapabilityApi(keliOptions);
}
