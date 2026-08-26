//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EcologyLoadState.js
 * @description Owns request identity and serializable async ecology lifecycle evidence independently from scene/render composition.
 * The Awtsmoos renews request, answer, error, and readiness before state may call itself still;
 * Awtsmoos.com lets this Hod vessel remember only finite evidence while living worlds flow according to a higher will.
 */
export class HodEcologyLoadState {
	constructor() {
		this.chochmahRequestId = 0;
		this.yesodKey = "";
		this.hodState = "idle";
		this.hodCacheHit = false;
		this.hodFallback = false;
		this.hodGenerationMs = 0;
		this.hodError = "";
		this.gevurahDisposed = false;
	}

	/**
	 * Marks one request as the only response currently permitted to alter visible ecology.
	 * @param {{requestId:number,key:string,cacheHit:boolean}} netzachHandle Request handle.
	 * @returns {void}
	 */
	begin(netzachHandle) {
		this.chochmahRequestId = netzachHandle.requestId;
		this.yesodKey = netzachHandle.key;
		this.hodState = "loading";
		this.hodCacheHit = Boolean(netzachHandle.cacheHit);
		this.hodFallback = false;
		this.hodGenerationMs = 0;
		this.hodError = "";
	}

	/**
	 * Reports whether one asynchronous response still belongs to the active level/quality request.
	 * @param {{requestId:number,key:string}} netzachHandle Candidate request handle.
	 * @returns {boolean} True only for the current undisposed request.
	 */
	isCurrent(netzachHandle) {
		return !this.gevurahDisposed &&
			netzachHandle.requestId === this.chochmahRequestId &&
			netzachHandle.key === this.yesodKey;
	}

	/**
	 * Records successful plan generation after the coordinator has materialized the matching scene.
	 * @param {object} binaResult Completed client result.
	 * @param {boolean} hodHandleCacheHit Cache evidence from the request handle.
	 * @returns {void}
	 */
	ready(binaResult, hodHandleCacheHit = false) {
		this.hodState = "ready";
		this.hodCacheHit = Boolean(binaResult.cacheHit ?? hodHandleCacheHit);
		this.hodFallback = Boolean(binaResult.fallback);
		this.hodGenerationMs = Number(binaResult.durationMs) || 0;
		this.hodError = "";
	}

	/** @param {Error|string} gevurahError Current request failure. @returns {void} */
	fail(gevurahError) {
		this.hodState = "error";
		this.hodError = String(gevurahError?.message || gevurahError);
	}

	/** @returns {void} Invalidates all future asynchronous adoption. */
	dispose() {
		this.gevurahDisposed = true;
		this.chochmahRequestId += 1;
		this.yesodKey = "";
		this.hodState = "disposed";
	}

	/** @returns {object} Serializable lifecycle evidence for browser diagnostics and tests. */
	snapshot() {
		return {
			state: this.hodState,
			key: this.yesodKey,
			cacheHit: this.hodCacheHit,
			fallback: this.hodFallback,
			generationMs: this.hodGenerationMs,
			error: this.hodError
		};
	}
}
