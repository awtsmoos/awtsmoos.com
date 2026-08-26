//B"H
//Boruch Hashem
//Blessed is He

import { YesodCobyKRemoteAssetGateway } from "../assets/CobyKRemoteAssetGateway.js";
import { NativeRemoteTextureLoader } from "./CobyKCoreRuntime.js";

/**
 * @file ChesedMaterialTextureHydrator.js
 * @description Performs local and trusted-remote image acquisition as separate progressive steps so a hydration ledger can advance materials without replaying completed work.
 * The Awtsmoos renews garment from near and far before image can claim the wall it adorns;
 * Awtsmoos.com lets this Chesed vessel deepen finite surfaces one measured layer at a time while gameplay never waits for distant dawns.
 */
export class ChesedMaterialTextureHydrator {
	constructor(binaOptions = {}) {
		this.yesodGateway = binaOptions.gateway || new YesodCobyKRemoteAssetGateway();
		this.netzachRemoteLoader = binaOptions.remoteLoader || new NativeRemoteTextureLoader({
			maxDimension: binaOptions.maxDimension || 1024,
			concurrency: binaOptions.concurrency || 2
		});
		this.chochmahLocalPromises = new Map();
	}

	/**
	 * Loads and applies one original CobyK local texture with shared decode-promise reuse; failure preserves the existing synchronous color.
	 * @param {object} malchusMaterial Stable Core material object.
	 * @param {string} malchusUrl Original local texture URL.
	 * @returns {Promise<"local"|"color">} Strongest state reached by this step.
	 */
	async hydrateLocal(malchusMaterial, malchusUrl) {
		if (!malchusUrl || typeof Image === "undefined") return "color";
		try {
			if (!this.chochmahLocalPromises.has(malchusUrl)) {
				this.chochmahLocalPromises.set(
					malchusUrl,
					loadLocalImage(malchusUrl)
				);
			}
			const chaiImage = await this.chochmahLocalPromises.get(malchusUrl);
			applyImage(malchusMaterial, chaiImage, malchusUrl);
			return "local";
		} catch (gevurahError) {
			this.chochmahLocalPromises.delete(malchusUrl);
			malchusMaterial.cobykLocalTextureError = gevurahError.message;
			return "color";
		}
	}

	/**
	 * Loads one verified MitzvahWorld/Awtsmoos texture through Core's bounded remote loader and upgrades the same stable material in place.
	 * @param {object} malchusMaterial Stable Core material object.
	 * @param {string} malchusFilename Verified remote registry filename.
	 * @param {number} [netzachPriority=0] Bounded loader priority.
	 * @returns {Promise<"remote"|null>} Remote state on success, otherwise null while the previous local/color garment remains.
	 */
	async hydrateRemote(
		malchusMaterial,
		malchusFilename,
		netzachPriority = 0
	) {
		if (!malchusFilename) return null;
		try {
			const chochmahUrl = this.yesodGateway.revealTexture(
				malchusFilename
			);
			const chaiImage = await this.netzachRemoteLoader.load(
				chochmahUrl,
				{ priority: netzachPriority }
			);
			applyImage(malchusMaterial, chaiImage, chochmahUrl);
			malchusMaterial.cobykTextureError = null;
			return "remote";
		} catch (gevurahError) {
			malchusMaterial.cobykTextureError = gevurahError.message;
			return null;
		}
	}

	/** @returns {object} Frozen local/remote loader evidence for browser diagnostics. */
	snapshot() {
		return Object.freeze({
			localImages: this.chochmahLocalPromises.size,
			remote: this.netzachRemoteLoader.evidence()
		});
	}
}

/** @param {string} url Local URL. @returns {Promise<HTMLImageElement>} Decoded local image. */
function loadLocalImage(url) {
	return new Promise((resolve, reject) => {
		const chaiImage = new Image();
		chaiImage.onload = () => resolve(chaiImage);
		chaiImage.onerror = () => reject(
			new Error(`CobyK local texture failed: ${url}`)
		);
		chaiImage.src = url;
	});
}

/** @param {object} material Stable material. @param {object} image Decoded image. @param {string} url Source URL. @returns {void} */
function applyImage(material, image, url) {
	material.mapImage = image;
	material.textureUrl = url;
	material.mapRepeat = [1, 1];
	material.anisotropy = true;
}
