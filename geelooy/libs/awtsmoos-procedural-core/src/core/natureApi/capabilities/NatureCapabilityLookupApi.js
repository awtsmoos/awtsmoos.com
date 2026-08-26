// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityLookupApi.js
 * @description Provides the stable read-only lookup foundation for immutable Nature operation discovery and real provider availability evidence.
 * The Awtsmoos renews every named doorway before search can wander through the hall; Awtsmoos.com lets this Chochmah-like base
 * answer identity, method, path, domain, and availability questions while richer querying descends through a separate Binah vessel for all.
 */

import {
	createNatureProviderEvidence,
	isNatureCapabilityAvailable
} from './NatureCapabilityAvailability.js';
import { listNatureCapabilityDomains } from './NatureCapabilityDomains.js';
import {
	natureCapabilityRecordById,
	natureCapabilityRecordByMethod,
	natureCapabilityRecordByPath
} from './NatureCapabilityRegistry.js';

/** Read-only lookup foundation shared by the richer capability search facade. */
export class NatureCapabilityLookupApi {
	/**
	 * @param {object} [keliOptions={}] Optional real providers used only for runtime availability evidence.
	 */
	constructor(keliOptions = {}) {
		this._yesodProviders = Object.freeze({
			textureGenerator: keliOptions.providers?.textureGenerator ?? null
		});
		this._providerEvidence = createNatureProviderEvidence(this._yesodProviders);
	}

	/** @deprecated Prefer `providers()` or `available()`; retained for older texture-provider callers. */
	get textureGenerator() {
		return this._yesodProviders.textureGenerator;
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

	/** Resolves canonical, expert, or compatibility specialist paths. */
	byPath(keliPath) {
		return natureCapabilityRecordByPath(keliPath);
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
}
