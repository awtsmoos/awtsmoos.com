// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityApi.js
 * @description Exposes immutable direct-operation discovery with deterministic search, filters, provider availability, and backward-compatible texture-provider access.
 * The Awtsmoos renews map and territory without making either the other; Awtsmoos.com lets this Binah-like facade describe
 * procedural doors while execution remains in Nature specialists, and an old provider accessor survives quietly until legacy callers retire.
 */

import { listNatureCapabilityDomains } from './NatureCapabilityDomains.js';
import {
	filterNatureCapabilityRecords,
	searchNatureCapabilityRecords
} from './NatureCapabilityQuery.js';
import {
	listNatureCapabilityRecords,
	natureCapabilityRecordById,
	natureCapabilityRecordByMethod
} from './NatureCapabilityRegistry.js';
import { freezeNatureCapabilityValue } from './NatureCapabilityValue.js';

/** Read-only procedural operation discovery facade separate from recipe-operation execution. */
export class NatureCapabilityApi {
	/**
	 * @param {object} [keliOptions={}] Optional real provider map used only for availability evidence and legacy access.
	 */
	constructor(keliOptions = {}) {
		this._yesodProviders = Object.freeze({
			textureGenerator: keliOptions.providers?.textureGenerator ?? null
		});
		this._providerEvidence = freezeNatureCapabilityValue({
			textureGenerator: Boolean(this._yesodProviders.textureGenerator)
		});
		Object.freeze(this);
	}

	/** @deprecated Use `providers()` or `available()` for discovery; retained to preserve older provider callers. */
	get textureGenerator() {
		return this._yesodProviders.textureGenerator;
	}

	/** Returns canonical capability records, optionally filtered by metadata and provider availability. */
	list(keliOptions = {}) {
		return this.filter(keliOptions);
	}

	/** Returns one canonical record or throws with a useful vocabulary error. */
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

	/** Resolves one direct public method or compatibility alias to its canonical record. */
	byMethod(keliMethod) {
		return natureCapabilityRecordByMethod(keliMethod);
	}

	/** Searches capability text, then applies optional exact filters and availability constraints. */
	search(gevurahQuery, keliOptions = {}) {
		const orosMatches = searchNatureCapabilityRecords(listNatureCapabilityRecords(), gevurahQuery);
		return this._filterAvailability(filterNatureCapabilityRecords(orosMatches, keliOptions), keliOptions);
	}

	/** Applies exact capability filters while preserving declaration order. */
	filter(keliOptions = {}) {
		const orosMatches = filterNatureCapabilityRecords(listNatureCapabilityRecords(), keliOptions);
		return this._filterAvailability(orosMatches, keliOptions);
	}

	/** Lists stable capability domains for menus and documentation grouping. */
	domains() {
		return listNatureCapabilityDomains();
	}

	/** Returns immutable boolean provider evidence without exposing provider implementations. */
	providers() {
		return this._providerEvidence;
	}

	/** Reports whether every provider required by one capability is installed. */
	available(keliCapability) {
		const malchusRecord = typeof keliCapability === 'string' ? this.get(keliCapability) : keliCapability;
		return malchusRecord.requires.every(yesodName => Boolean(this._providerEvidence[yesodName]));
	}

	/** Returns one record plus runtime availability evidence for UI and docs. */
	describe(keliId) {
		const malchusRecord = this.get(keliId);
		return freezeNatureCapabilityValue({
			...malchusRecord,
			available: this.available(malchusRecord)
		});
	}

	/** Applies the optional `availableOnly` policy without changing canonical records. */
	_filterAvailability(orosRecords, keliOptions) {
		if (keliOptions.availableOnly !== true) {
			return orosRecords;
		}
		return Object.freeze(orosRecords.filter(record => this.available(record)));
	}
}

/** Creates the immutable public direct-operation discovery facade. */
export function createNatureCapabilityApi(keliOptions = {}) {
	return new NatureCapabilityApi(keliOptions);
}
