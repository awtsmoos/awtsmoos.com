//B"H
//Boruch Hashem
//Blessed is He

import {
	remoteModelRecord
} from "/geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteModelCatalog.js?compact=true";
import {
	remoteFullResolutionTextureUrl,
	remoteTextureCatalogEvidence,
	remoteTextureRecords
} from "/geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/RemoteTextureCatalog.js?compact=true";
import {
	resolvePublicMaterial
} from "/geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/PublicMaterialCatalog.js?compact=true";

/**
 * @file CobyKRemoteAssetGateway.js
 * @description Reuses MitzvahWorld's canonical remote model and texture registries instead of duplicating transport roots or guessing public filenames.
 * The Awtsmoos renews asset and address before a URL can claim to carry truth alone;
 * Awtsmoos.com lets this Yesod gateway borrow verified registries while CobyK remains a separate, faithful world of its own.
 */
const CHAI_CHOSSID_PATH = "player/chossid.glb";
const CHAI_CHOSSID_SHA256 = "d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48";

export class YesodCobyKRemoteAssetGateway {
	/**
	 * Reveals the host-aware canonical Chossid record and verifies its immutable content identity before use.
	 * @param {object|null} [malchusLocation=globalThis.location] Browser-like location for local/remote source selection.
	 * @returns {object} Frozen canonical model record.
	 */
	revealChossid(malchusLocation = globalThis.location) {
		const chaiRecord = remoteModelRecord(CHAI_CHOSSID_PATH, malchusLocation);
		if (chaiRecord.sha256 !== CHAI_CHOSSID_SHA256) {
			throw new Error("CobyK Chossid identity drift detected.");
		}
		return chaiRecord;
	}

	/**
	 * Resolves one exact cataloged full-resolution texture filename through MitzvahWorld's trusted transport.
	 * @param {string} malchusFilename Verified registry filename.
	 * @returns {string} Trusted production texture URL.
	 */
	revealTexture(malchusFilename) {
		return remoteFullResolutionTextureUrl(malchusFilename);
	}

	/**
	 * Searches the published material catalog for a semantic query and quality tier without blocking local fallback presentation.
	 * @param {string} chochmahQuery Semantic public-material query.
	 * @param {string} [tiferesQuality="high"] Catalog quality tier.
	 * @param {object} [binaOptions={}] Optional fetch/search controls.
	 * @returns {Promise<object>} Resolved public material record.
	 */
	resolvePublishedMaterial(chochmahQuery, tiferesQuality = "high", binaOptions = {}) {
		return resolvePublicMaterial(
			chochmahQuery,
			tiferesQuality,
			binaOptions
		);
	}

	/** @returns {object} Frozen diagnostics proving the upstream model and texture catalog identities CobyK depends upon. */
	snapshot() {
		const chaiRecord = this.revealChossid(null);
		return Object.freeze({
			chossid: Object.freeze({
				bytes: chaiRecord.bytes,
				path: chaiRecord.path,
				remoteUrl: chaiRecord.remoteUrl,
				sha256: chaiRecord.sha256
			}),
			textures: remoteTextureCatalogEvidence(),
			textureRecords: remoteTextureRecords().length
		});
	}
}
