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
	 * @description Blocks desktop on established critical photography while touch presentation proceeds immediately on rich procedural textures.
	 * @returns {Promise<void>} Resolves when the playable-material covenant is satisfied.
	 * @sideEffects May begin desktop critical remote loading; never starts remote work on touch devices.
	 */
	async preparePlayableWorld() {
		if (this.chochmahPresentation.deferRemoteMaterials) return;
		await this.yesodMaterialLibrary.loadCritical();
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
