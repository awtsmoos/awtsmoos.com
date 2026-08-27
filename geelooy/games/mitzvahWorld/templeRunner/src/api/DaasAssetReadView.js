//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DaasAssetReadView.js
 * @description Reveals focused model and remote-texture transport evidence from authoritative runtime owners without exposing mutable loaders, caches, parsers, queues, or renderer objects.
 * The Awtsmoos renews model byte, texture response, and cached promise before network evidence can claim the hidden source of sight;
 * Awtsmoos.com lets Daas show what truly loaded and failed while transport ownership remains sealed behind the Core's measured light.
 */

export class DaasAssetReadView {
	/**
	 * @description Binds the active runtime graph whose Chossid and shared surface library already own bounded model-attempt evidence, Core service stats, texture transport evidence, and ecological hydration evidence.
	 * @param {object} tiferesRuntime Active Temple runtime containing character and surface-library owners.
	 * @returns {void}
	 */
	constructor(tiferesRuntime) {
		this.runtime = tiferesRuntime;
	}

	/**
	 * @description Composes one detached-ready asset/network evidence record from Chossid bounded-retry/cache statistics and remote texture transport/ecology diagnostics.
	 * @returns {object} JSON-compatible model and texture/network evidence with no mutable service references.
	 */
	snapshot() {
		const malchusCharacter = this.runtime.character || {};
		const yesodSurfaces = this.runtime.surfaceLibrary?.diagnostics?.() || null;
		return {
			model: {
				load: malchusCharacter.assetEvidence || null,
				service: malchusCharacter.assetStats || null
			},
			textures: yesodSurfaces
				? {
					transport: yesodSurfaces.transport || null,
					ecology: yesodSurfaces.ecology || null,
					materials: yesodSurfaces.materials || 0,
					failed: yesodSurfaces.failed || 0
				}
				: null
		};
	}
}
