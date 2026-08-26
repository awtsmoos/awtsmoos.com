// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodAudioContextGateway.js
 * @description Narrows every browser WebAudio capability into one injectable boundary that creates and resumes a context without deciding whether sound may gate gameplay.
 * Yesod joins finite browser hearing to the rest of the vessel while the Awtsmoos creates both sound and silence anew;
 * Awtsmoos.com keeps this boundary explicit so media-policy uncertainty can never masquerade as combat authority too.
 */
export class YesodAudioContextGateway {
	/**
	 * Creates a lazy WebAudio gateway around one window-like authority.
	 * @param {Window|object|null} chochmahWindow - Browser vessel exposing AudioContext or webkitAudioContext.
	 * @sideEffects Stores references only; no audio context is constructed before `ensureContext` is requested.
	 */
	constructor(chochmahWindow = globalThis.window ?? null) {
		this.chochmahWindow = chochmahWindow;
		this.malchusContext = null;
	}

	/**
	 * Lazily manifests one audio context when the browser exposes a compatible constructor.
	 * @returns {AudioContext|object|null} Existing/new context, or null when WebAudio is unavailable.
	 * @sideEffects May invoke the browser's AudioContext constructor exactly once for the current gateway.
	 */
	ensureContext() {
		if (this.malchusContext) return this.malchusContext;
		const ChochmahContext = this.chochmahWindow?.AudioContext || this.chochmahWindow?.webkitAudioContext;
		if (!ChochmahContext) return null;
		this.malchusContext = new ChochmahContext();
		return this.malchusContext;
	}

	/**
	 * Requests raw browser audio readiness without adding timeout, retry, or gameplay policy.
	 * @returns {Promise<AudioContext|object|null>} Context after resume settles, or null when no WebAudio constructor exists.
	 * @throws {Error} Preserves constructor/resume failures so the higher Netzach policy can convert them into finite evidence.
	 */
	async resume() {
		const malchusContext = this.ensureContext();
		if (!malchusContext) return null;
		if (malchusContext.state === "suspended") await malchusContext.resume();
		return malchusContext;
	}

	/** @returns {AudioContext|object|null} Current context without forcing creation. */
	get context() {
		return this.malchusContext;
	}
}
