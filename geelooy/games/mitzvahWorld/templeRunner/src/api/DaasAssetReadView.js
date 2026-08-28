//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DaasAssetReadView.js
 * @description Reveals focused model, remote-texture, and browser-network evidence from authoritative runtime owners without exposing mutable loaders, caches, parsers, queues, connection objects, or renderer services.
 * The Awtsmoos renews model byte, retry, cached promise, layered stone, and finite network hint before any witness can claim the hidden source of sight;
 * Awtsmoos.com lets Daas show measured evidence while transport ownership and browser machinery remain sealed behind their rightful light.
 */

import { DaasAssetHealthView } from "./DaasAssetHealthView.js";

export class DaasAssetReadView {
	/**
	 * @description Binds the active runtime graph and one pure health composer while preserving model, surface, and browser-network ownership outside the public read layer.
	 * @param {object} tiferesRuntime Active Temple runtime containing character, surface-library, and optional network-status owners.
	 * @returns {void}
	 */
	constructor(tiferesRuntime) {
		this.runtime = tiferesRuntime;
		this.health = new DaasAssetHealthView();
	}

	/**
	 * @description Composes one detached frozen asset record containing browser connectivity hints plus bounded model retry/cache and texture transport/ecology evidence.
	 * @returns {Readonly<object>} Frozen top-level asset evidence with health, network, model, and textures branches and no mutable service references.
	 */
	snapshot() {
		const malchusCharacter = this.runtime.character || {};
		const yesodSurfaces = this.runtime.surfaceLibrary?.diagnostics?.() || null;
		const binahModelLoad = malchusCharacter.assetEvidence || null;
		const binahModelService = malchusCharacter.assetStats || null;
		const netzachNetwork = this.runtime.network?.snapshot?.() || null;
		const daasTextures = yesodSurfaces
			? Object.freeze({
				transport: yesodSurfaces.transport || null,
				ecology: yesodSurfaces.ecology || null,
				materials: Number(yesodSurfaces.materials || 0),
				mapReady: Number(yesodSurfaces.mapReady || 0),
				mixReady: Number(yesodSurfaces.mixReady || 0),
				pending: Number(yesodSurfaces.pending || 0),
				failed: Number(yesodSurfaces.failed || 0)
			})
			: null;
		return Object.freeze({
			health: this.health.snapshot(binahModelLoad, yesodSurfaces),
			network: netzachNetwork,
			model: Object.freeze({
				load: binahModelLoad,
				service: binahModelService
			}),
			textures: daasTextures
		});
	}
}
