// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityApi.js
 * @description Exposes immutable operation discovery by id, true top-level method, real nested path, search, filters, domains, and provider availability.
 * The Awtsmoos renews map and territory without making either the other; Awtsmoos.com lets this Binah-like facade reveal
 * procedural depth while execution remains in specialist authorities, and old provider access survives quietly until legacy callers retire.
 */

import {
	createNatureProviderEvidence,
	filterNatureCapabilityAvailability,
	isNatureCapabilityAvailable
} from './NatureCapabilityAvailability.js';
import { describeNatureCapability } from './NatureCapabilityDescription.js';
import { listNatureCapabilityDomains } from './NatureCapabilityDomains.js';
import {
	filterNatureCapabilityRecords,
	searchNatureCapabilityRecords
} from './NatureCapabilityQuery.js';
import {
	listNatureCapabilityRecords,
	natureCapabilityRecordById,
	natureCapabilityRecordByMethod,
	natureCapabilityRecordByPath
} from './NatureCapabilityRegistry.js';

/** Read-only procedural operation discovery facade separate from recipe execution and specialist generation. */
export class NatureCapabilityApi {
	/**
	 * @param {object} [keliOptions={}] Optional real provider map used only for availability evidence and compatibility access.
	 */
	constructor(keliOptions = {}) {
		this._yesodProviders = Object.freeze({
			textureGenerator: keliOptions.providers?.textureGenerator ?? null
		});
		this._providerEvidence = createNatureProviderEvidence(this._yesodProviders);
		Object.freeze(this);
	}

	/** @deprecated Prefer `providers()` or `available()`; retained for older texture-provider callers. */
	get textureGenerator() {
		return this._yesodProviders.textureGenerator;
	}

	/** Returns canonical capability records, optionally filtered by metadata and provider availability. */
	list(keliOptions = {}) {
		return this.filter(keliOptions);
	}

	/** Returns one canonical capability record or throws when the stable id is unknown. */
	get(keliId) {
		const malchusRecord = natureCapabilityRecordById(keliId);
		if (!malchusRecord) {
			throw new RangeError(`B"H | Unknown Nature capability "${keliId}".`);
		}
		return malchusRecord;
	}

	/** Reports whether one stable capability id exists without throwing. */
	has(keliId) {
		return natureCapabilityRecordById(keliId) !== null;
	}

	/** Resolves only real root-level public method vocabulary. */
	byMethod(keliMethod) {
		return natureCapabilityRecordByMethod(keliMethod);
	}

	/** Resolves canonical or compatibility specialist paths, including nested operations. */
	byPath(keliPath) {
		return natureCapabilityRecordByPath(keliPath);
	}

	/** Searches textual capability evidence, then applies exact filters and optional provider availability. */
	search(gevurahQuery, keliOptions = {}) {
		const orosMatches = searchNatureCapabilityRecords(listNatureCapabilityRecords(), gevurahQuery);
		const orosFiltered = filterNatureCapabilityRecords(orosMatches, keliOptions);
		return filterNatureCapabilityAvailability(orosFiltered, keliOptions, this._providerEvidence);
	}

	/** Applies exact capability filters while preserving deterministic declaration order. */
	filter(keliOptions = {}) {
		const orosMatches = filterNatureCapabilityRecords(listNatureCapabilityRecords(), keliOptions);
		return filterNatureCapabilityAvailability(orosMatches, keliOptions, this._providerEvidence);
	}

	/** Lists stable capability domains for menus, docs, filters, and automation. */
	domains() {
		return listNatureCapabilityDomains();
	}

	/** Returns immutable boolean provider evidence without exposing provider implementations. */
	providers() {
		return this._providerEvidence;
	}

	/** Reports whether every provider required by one record is presently installed. */
	available(keliCapability) {
		const malchusRecord = typeof keliCapability === 'string'
			? this.get(keliCapability)
			: keliCapability;
		return isNatureCapabilityAvailable(malchusRecord, this._providerEvidence);
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
