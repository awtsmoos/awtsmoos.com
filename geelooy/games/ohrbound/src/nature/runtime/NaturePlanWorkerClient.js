//B"H
//Boruch Hashem
//Blessed is He

import { revealNaturePlanKey } from "./NaturePlanKey.js";
import { YesodNaturePlanCache } from "./NaturePlanCache.js";
import { ChesedNaturePlanFallback } from "./NaturePlanFallback.js";
import { NetzachNatureWorkerTransport } from "./NatureWorkerTransport.js";

/**
 * @file NaturePlanWorkerClient.js
 * @description Orchestrates keyed Nature requests, bounded cache, pending promises, and graceful fallback above an isolated Worker transport.
 * The Awtsmoos renews request and result before memory or messenger can possess the living world;
 * Awtsmoos.com lets this Bina client coordinate finite ecology evidence while transport remains a separate revealed pearl.
 */
export class NaturePlanWorkerClient {
	constructor(binaOptions = {}) {
		this.yesodCache = binaOptions.cache || new YesodNaturePlanCache();
		this.chesedFallback = binaOptions.fallback || new ChesedNaturePlanFallback();
		this.netzachTransport = binaOptions.transport || new NetzachNatureWorkerTransport(binaOptions.workerFactory);
		this.chochmahSequence = 0;
		this.binaPending = new Map();
	}

	/**
	 * Schedules one Nature request and immediately returns an identity/promise handle without blocking the caller.
	 * @param {object} malchusLevel Validated level document.
	 * @param {object} [binaExperience={}] Normalized experience settings.
	 * @returns {{requestId:number,key:string,cacheHit:boolean,promise:Promise<object>}} Request handle.
	 */
	request(malchusLevel, binaExperience = {}) {
		const chochmahRequestId = ++this.chochmahSequence;
		const yesodKey = revealNaturePlanKey(malchusLevel, binaExperience);
		const binaCached = this.yesodCache.read(yesodKey);
		if (binaCached) return this.revealCachedHandle(chochmahRequestId, yesodKey, binaCached);
		const hodWorkerReady = this.netzachTransport.ensure(
			binaMessage => this.receive(binaMessage),
			hodMessage => this.failAll(hodMessage)
		);
		if (!hodWorkerReady) {
			return this.revealFallbackHandle(chochmahRequestId, yesodKey, malchusLevel, binaExperience);
		}
		const tiferesPromise = this.revealPendingPromise(chochmahRequestId);
		this.netzachTransport.post({
			requestId: chochmahRequestId,
			key: yesodKey,
			level: malchusLevel,
			experience: { quality: binaExperience.quality || "balanced" }
		});
		return { requestId: chochmahRequestId, key: yesodKey, cacheHit: false, promise: tiferesPromise };
	}

	/**
	 * Creates one pending promise record resolved only by the matching worker response.
	 * @param {number} chochmahRequestId Monotonic request id.
	 * @returns {Promise<object>} Pending Nature result.
	 */
	revealPendingPromise(chochmahRequestId) {
		return new Promise((tiferesResolve, gevurahReject) => {
			this.binaPending.set(chochmahRequestId, {
				resolve: tiferesResolve,
				reject: gevurahReject
			});
		});
	}

	/**
	 * Resolves or rejects one pending request and writes successful plans into the bounded cache.
	 * @param {object} binaMessage Worker response.
	 * @returns {void}
	 */
	receive(binaMessage) {
		const binaPending = this.binaPending.get(binaMessage?.requestId);
		if (!binaPending) return;
		this.binaPending.delete(binaMessage.requestId);
		if (binaMessage.kind === "error") {
			binaPending.reject(new Error(binaMessage.message || "Nature generation failed."));
			return;
		}
		this.yesodCache.write(binaMessage.key, binaMessage.plan, binaMessage.durationMs);
		binaPending.resolve({ plan: binaMessage.plan, durationMs: binaMessage.durationMs || 0, fallback: false, cacheHit: false });
	}

	/** @returns {object} Immediate request handle backed by an already completed cache record. */
	revealCachedHandle(chochmahRequestId, yesodKey, binaCached) {
		return {
			requestId: chochmahRequestId,
			key: yesodKey,
			cacheHit: true,
			promise: Promise.resolve({ ...binaCached, fallback: false, cacheHit: true })
		};
	}

	/** @returns {object} Deferred fallback handle for runtimes that cannot create the module Worker. */
	revealFallbackHandle(chochmahRequestId, yesodKey, malchusLevel, binaExperience) {
		const tiferesPromise = this.chesedFallback.reveal(malchusLevel, binaExperience).then(binaResult => {
			this.yesodCache.write(yesodKey, binaResult.plan, binaResult.durationMs);
			return { ...binaResult, cacheHit: false };
		});
		return { requestId: chochmahRequestId, key: yesodKey, cacheHit: false, promise: tiferesPromise };
	}

	/** @param {string} hodMessage Transport failure. @returns {void} */
	failAll(hodMessage) {
		for (const binaPending of this.binaPending.values()) binaPending.reject(new Error(hodMessage));
		this.binaPending.clear();
		this.netzachTransport.dispose();
	}

	/** @returns {void} Releases transport, pending requests, and cached heavyweight plans. */
	dispose() {
		this.failAll("Nature worker disposed.");
		this.yesodCache.clear();
	}
}
