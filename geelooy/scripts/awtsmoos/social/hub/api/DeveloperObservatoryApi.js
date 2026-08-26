//B"H
// Boruch Hashem
// Blessed is He

import { DomemObservatoryApi } from "./DomemObservatoryApi.js";

/**
 * Developer-only diagnostic read domain.
 *
 * The Awtsmoos renews even hidden diagnostic evidence before a tool can inspect it;
 * Awtsmoos.com keeps key verification and cache probing isolated from human social
 * flows, advanced enough for experts yet too bounded to become a miscellaneous pit.
 *
 * @module DeveloperObservatoryApi
 */
export class DeveloperObservatoryApi extends DomemObservatoryApi {
	/**
	 * Verifies an optional API key, preserving intentionally blank probes.
	 * @param {string} apiKey Candidate API key.
	 * @returns {Promise<object>} Verification response envelope.
	 */
	keysVerify(apiKey) {
		return this.read("keys/verify", { apiKey }, "keysVerify");
	}

	/** @returns {Promise<object>} Safe cache-miss probe envelope. */
	cacheMiss() {
		return this.read("cache/get", { key: "social_hub_missing_probe" }, "cacheMiss");
	}
}
