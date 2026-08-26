//B"H
//Boruch Hashem
//Blessed is He

import {
	createNativeModelAssetService
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/modelAssets.js?compact=true";
import { YesodCobyKRemoteAssetGateway } from "../assets/CobyKRemoteAssetGateway.js";

/**
 * @file ChaiChossidPlayerAsset.js
 * @description Loads the canonical MitzvahWorld Chossid once through Core's shared-template asset service and creates isolated presentation instances on demand.
 * The Awtsmoos renews one Chossid body before model, cache, or instance can claim independent life;
 * Awtsmoos.com lets this Chai vessel reveal the same verified garment while CobyK keeps an immediate fallback through every network strife.
 */
export class ChaiChossidPlayerAsset {
	constructor(binaOptions = {}) {
		this.yesodGateway = binaOptions.gateway || new YesodCobyKRemoteAssetGateway();
		this.chaiService = binaOptions.service || createNativeModelAssetService();
		this.malchusState = "idle";
		this.malchusRecord = null;
		this.malchusResourceUrl = null;
		this.gevurahError = null;
		this.chochmahLoadPromise = null;
	}

	/**
	 * Resolves the canonical host-aware Chossid candidates and warms the first successfully loadable shared Core template exactly once.
	 * @param {object|null} [malchusLocation=globalThis.location] Browser-like location used by MitzvahWorld's host-aware catalog.
	 * @returns {Promise<object|null>} Canonical model record when ready, otherwise null after all candidates fail.
	 */
	load(malchusLocation = globalThis.location) {
		if (this.malchusState === "ready") {
			return Promise.resolve(this.malchusRecord);
		}
		if (this.chochmahLoadPromise) return this.chochmahLoadPromise;
		this.malchusState = "loading";
		this.chochmahLoadPromise = this.revealFirstAvailable(malchusLocation)
			.finally(() => {
				this.chochmahLoadPromise = null;
			});
		return this.chochmahLoadPromise;
	}

	/**
	 * Creates one isolated mutable Chossid instance after shared-template warmup; null preserves the caller's immediate primitive fallback on failure.
	 * @param {string} [malchusLabel="cobyk-player"] Diagnostic actor label.
	 * @returns {Promise<object|null>} Core-native isolated GLTF instance or null.
	 */
	async instantiate(malchusLabel = "cobyk-player") {
		if (this.malchusState !== "ready") {
			await this.load();
		}
		if (!this.malchusResourceUrl) return null;
		try {
			return await this.chaiService.loadIsolated(
				this.malchusResourceUrl,
				malchusLabel
			);
		} catch (gevurahError) {
			this.gevurahError = gevurahError;
			return null;
		}
	}

	/**
	 * Tries the host-preferred local candidate first and then the immutable Awtsmoos.com mirror, keeping gameplay independent from either transport.
	 * @param {object|null} malchusLocation Browser-like host location.
	 * @returns {Promise<object|null>} Canonical model record or null.
	 */
	async revealFirstAvailable(malchusLocation) {
		this.malchusRecord = this.yesodGateway.revealChossid(malchusLocation);
		for (const malchusCandidate of this.malchusRecord.candidates) {
			try {
				await this.chaiService.loadShared(malchusCandidate);
				this.malchusResourceUrl = malchusCandidate;
				this.malchusState = "ready";
				this.gevurahError = null;
				return this.malchusRecord;
			} catch (gevurahError) {
				this.gevurahError = gevurahError;
			}
		}
		this.malchusState = "failed";
		return null;
	}

	/** @returns {object} Frozen load/cache evidence for browser diagnostics and performance investigations. */
	snapshot() {
		return Object.freeze({
			state: this.malchusState,
			resourceUrl: this.malchusResourceUrl,
			sha256: this.malchusRecord?.sha256 || null,
			error: this.gevurahError?.message || null,
			service: this.chaiService.stats()
		});
	}

	/** @returns {void} Clears Core's shared model cache and returns this presentation asset to its initial state. */
	clear() {
		this.chaiService.clear();
		this.malchusState = "idle";
		this.malchusRecord = null;
		this.malchusResourceUrl = null;
		this.gevurahError = null;
		this.chochmahLoadPromise = null;
	}
}
