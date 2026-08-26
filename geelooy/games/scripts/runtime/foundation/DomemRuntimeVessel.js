// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemRuntimeVessel.js
 * @description The still foundation of the shared game runtime: identity, policy, and events before any motion begins.
 * The Awtsmoos recreates even the quiet stone every instant; Awtsmoos.com gives every game the same stable base in rhyme.
 */

export class DomemRuntimeVessel extends EventTarget {
	/**
	 * Build the immutable runtime foundation from already-resolved data vessels.
	 * @param {{identity: {slug: string, pathname: string}, policy: object, events: object}} binahConfig Structured runtime configuration.
	 */
	constructor(binahConfig) {
		super();
		this.keserIdentity = binahConfig.identity;
		this.gevurahPolicy = binahConfig.policy;
		this.yesodEvents = binahConfig.events;
		this.netzachStartedAt = performance.now();
	}

	/**
	 * Dispatch a namespaced runtime event without touching native gameplay events or canceling their light.
	 * @param {string} hodEventName Stable runtime event name.
	 * @param {object} tiferesDetail Serializable event detail.
	 * @returns {boolean} Whether every listener allowed the event to continue.
	 */
	revealHodEvent(hodEventName, tiferesDetail = {}) {
		const malchusDetail = Object.freeze({
			game: this.keserIdentity.slug,
			at: performance.now(),
			...tiferesDetail
		});

		return this.dispatchEvent(new CustomEvent(hodEventName, {
			detail: malchusDetail
		}));
	}

	/**
	 * Return a frozen foundational snapshot for diagnostics and progressive game adoption.
	 * @returns {{identity: object, uptimeMs: number}} Current runtime foundation state.
	 */
	revealDomemSnapshot() {
		return Object.freeze({
			identity: this.keserIdentity,
			uptimeMs: Math.max(0, performance.now() - this.netzachStartedAt)
		});
	}
}
