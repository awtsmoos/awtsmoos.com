//B"H
//Boruch Hashem
//Blessed is He

import { revealNaturePlanKey } from "./NaturePlanKey.js";
import { YesodNaturePlanCache } from "./NaturePlanCache.js";
import { ChesedNaturePlanFallback } from "./NaturePlanFallback.js";

/**
 * @file NaturePlanWorkerClient.js
 * @description Owns the module Worker, cache, request identity, and failure transport for nonblocking ecology generation.
 * The Awtsmoos renews messenger and message before either can possess the living world;
 * Awtsmoos.com lets this Netzach client carry finite plans across threads while stale echoes are measured and hurled.
 */
export class NaturePlanWorkerClient {
	constructor(binaOptions = {}) {
		this.yesodCache = binaOptions.cache || new YesodNaturePlanCache();
		this.keterWorkerFactory = binaOptions.workerFactory || revealDefaultWorker;
		this.chesedFallback = binaOptions.fallback || new ChesedNaturePlanFallback();
		this.malchusWorker = null;
		this.chochmahSequence = 0;
		this.binaPending = new Map();
	}

	/**
	 * Schedules one Nature plan request and returns its identity plus a promise without blocking the caller.
	 * @param {object} malchusLevel Validated level document.
	 * @param {object} [binaExperience={}] Normalized experience settings.
	 * @returns {{requestId:number,key:string,cacheHit:boolean,promise:Promise<object>}} Request handle.
	 */
	request(malchusLevel, binaExperience = {}) {
		const chochmahRequestId = ++this.chochmahSequence;
		const yesodKey = revealNaturePlanKey(malchusLevel, binaExperience);
		const binaCached = this.yesodCache.read(yesodKey);
		if (binaCached) {
			return this.revealCachedHandle(chochmahRequestId, yesodKey, binaCached);
		}
		const malchusWorker = this.ensureWorker();
		if (!malchusWorker) {
			return this.revealFallbackHandle(chochmahRequestId, yesodKey, malchusLevel, binaExperience);
		}
		const tiferesPromise = new Promise((tiferesResolve, gevurahReject) => {
			this.binaPending.set(chochmahRequestId, {
				resolve: tiferesResolve,
				reject: gevurahReject
			});
		});
		malchusWorker.postMessage({
			requestId: chochmahRequestId,
			key: yesodKey,
			level: malchusLevel,
			experience: { quality: binaExperience.quality || "balanced" }
		});
		return { requestId: chochmahRequestId, key: yesodKey, cacheHit: false, promise: tiferesPromise };
	}

	/**
	 * Creates and binds the worker lazily so merely importing the game does not allocate a background thread.
	 * @returns {Worker|null} Living worker or null when unavailable.
	 */
	ensureWorker() {
		if (this.malchusWorker) return this.malchusWorker;
		try {
			this.malchusWorker = this.keterWorkerFactory();
		} catch {
			this.malchusWorker = null;
		}
		if (!this.malchusWorker) return null;
		this.malchusWorker.addEventListener("message", malchusEvent => this.receive(malchusEvent.data));
		this.malchusWorker.addEventListener("error", malchusEvent => this.failAll(malchusEvent?.message || "Nature worker failed."));
		return this.malchusWorker;
	}

	/** @param {object} binaMessage Worker response. @returns {void} */
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

	/** @returns {object} Request handle resolved from bounded cache. */
	revealCachedHandle(chochmahRequestId, yesodKey, binaCached) {
		return {
			requestId: chochmahRequestId,
			key: yesodKey,
			cacheHit: true,
			promise: Promise.resolve({ ...binaCached, fallback: false, cacheHit: true })
		};
	}

	/** @returns {object} Request handle resolved by deferred graceful-degradation generation. */
	revealFallbackHandle(chochmahRequestId, yesodKey, malchusLevel, binaExperience) {
		const tiferesPromise = this.chesedFallback.reveal(malchusLevel, binaExperience).then(binaResult => {
			this.yesodCache.write(yesodKey, binaResult.plan, binaResult.durationMs);
			return { ...binaResult, cacheHit: false };
		});
		return { requestId: chochmahRequestId, key: yesodKey, cacheHit: false, promise: tiferesPromise };
	}

	/** @param {string} hodMessage Failure message. @returns {void} */
	failAll(hodMessage) {
		for (const binaPending of this.binaPending.values()) binaPending.reject(new Error(hodMessage));
		this.binaPending.clear();
		this.malchusWorker?.terminate?.();
		this.malchusWorker = null;
	}

	/** @returns {void} Terminates transport and releases pending/cache state. */
	dispose() {
		this.failAll("Nature worker disposed.");
		this.yesodCache.clear();
	}
}

/** @returns {Worker|null} Default optimized module worker for browsers supporting Worker. */
function revealDefaultWorker() {
	if (typeof Worker === "undefined") return null;
	return new Worker(new URL("../worker/NaturePlanWorker.js?compact=true", import.meta.url), {
		type: "module",
		name: "ohrbound-nature"
	});
}
