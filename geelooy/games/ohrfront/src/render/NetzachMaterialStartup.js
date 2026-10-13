// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachMaterialStartup.js
 * @description Separates playable procedural-material readiness from optional desktop photographic enrichment while mobile remains permanently free of heavy decode work during battle.
 * Netzach carries later garments through time while the Awtsmoos renews textured matter before any network journey begins;
 * Awtsmoos.com lets phones fight through deterministic layered procedural detail without ten multi-megabyte photographs seizing the main thread after readiness.
 */
export class NetzachMaterialStartup {
	/**
	 * @description Creates one material-startup policy around the existing remote library and device presentation truth.
	 * @param {object} yesodMaterialLibrary - Remote material library with critical/full loading methods.
	 * @param {object} chochmahPresentation - Device presentation policy.
	 * @sideEffects Stores policy and a stable enrichment promise slot only.
	 */
	constructor(yesodMaterialLibrary, chochmahPresentation) {
		this.yesodMaterialLibrary = yesodMaterialLibrary;
		this.chochmahPresentation = chochmahPresentation;
		this.backgroundPromise = null;
	}

	/**
	 * @description Blocks desktop on established critical photography while touch starts
	 * immediately on rich procedural textures, then upgrades to real photographs in the
	 * background (Yaakov 2026-10-13: touch must also get real grass, just not block on it).
	 * @returns {Promise<void>} Resolves when the playable-material covenant is satisfied.
	 * @sideEffects Desktop loads critical remote photography now; touch schedules it lazily.
	 */
	async preparePlayableWorld() {
		if (this.chochmahPresentation.deferRemoteMaterials) {
			this.scheduleDeferredCritical();
			return;
		}
		await this.yesodMaterialLibrary.loadCritical();
	}

	/**
	 * @description Loads critical photographic materials in the background after first
	 * paint so touch devices start fast but still receive real textures.
	 * @returns {Promise} Settles when background critical hydration finishes or fails.
	 * @sideEffects Starts remote image fetch/decode/hydration off the critical path.
	 */
	scheduleDeferredCritical() {
		if (this.deferredCriticalPromise) return this.deferredCriticalPromise;
		const run = () => this.yesodMaterialLibrary.loadCritical().catch(() => {});
		this.deferredCriticalPromise = new Promise((resolve) => {
			if (typeof globalThis.requestIdleCallback === "function") {
				globalThis.requestIdleCallback(() => resolve(run()), { timeout: 4000 });
			} else {
				setTimeout(() => resolve(run()), 1200);
			}
		});
		return this.deferredCriticalPromise;
	}

	/**
	 * @description Starts desktop optional enrichment once; touch presentation records deliberate deferral instead of starting large image fetch/decode/hydration during play.
	 * @returns {Promise<object>} Stable enrichment receipt or remote optional-load promise.
	 * @sideEffects Desktop may begin optional remote requests; touch performs no network or decode work.
	 */
	beginEnrichment() {
		if (this.backgroundPromise) return this.backgroundPromise;
		if (this.chochmahPresentation.deferRemoteMaterials) {
			this.backgroundPromise = Promise.resolve(Object.freeze({
				deferred: true,
				reason: "touch-procedural-first"
			}));
			return this.backgroundPromise;
		}
		this.backgroundPromise = this.yesodMaterialLibrary.startOptional();
		return this.backgroundPromise;
	}
}
