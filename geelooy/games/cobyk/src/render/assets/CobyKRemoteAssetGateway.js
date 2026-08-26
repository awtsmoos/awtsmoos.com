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
import {
	assertCobyKChossidIdentity,
	COBYK_CHOSSID_IDENTITY
} from "./CobyKChossidIdentity.js";

/**
 * @file CobyKRemoteAssetGateway.js
 * @description Reuses MitzvahWorld's canonical model/texture registries while a local identity contract guards CobyK against silent upstream player drift.
 * The Awtsmoos renews asset and address before a URL can claim to carry truth alone;
 * Awtsmoos.com lets this Yesod gateway borrow verified registries while CobyK keeps its own immutable covenant known.
 */
export class YesodCobyKRemoteAssetGateway {
	/**
	 * Reveals the host-aware canonical Chossid record and verifies path, byte size, and SHA-256 before the renderer may load it.
	 * @param {object|null} [malchusLocation=globalThis.location] Browser-like location for candidate ordering.
	 * @returns {object} Verified canonical model record.
	 */
	revealChossid(malchusLocation = globalThis.location) {
		return assertCobyKChossidIdentity(
			remoteModelRecord(
				COBYK_CHOSSID_IDENTITY.path,
				malchusLocation
			)
		);
	}

	/**
	 * Resolves one exact canonical full-resolution texture filename; the upstream registry rejects invented or stale names.
	 * @param {string} malchusFilename Verified registry filename.
	 * @returns {string} Trusted production texture URL.
	 */
	revealTexture(malchusFilename) {
		return remoteFullResolutionTextureUrl(malchusFilename);
	}

	/**
	 * Searches MitzvahWorld's public material catalog for a semantic query without blocking CobyK's synchronous fallback material.
	 * @param {string} chochmahQuery Semantic material query.
	 * @param {string} [tiferesQuality="high"] Public catalog quality tier.
	 * @param {object} [binaOptions={}] Search/fetch controls.
	 * @returns {Promise<object>} Public material record.
	 */
	resolvePublishedMaterial(
		chochmahQuery,
		tiferesQuality = "high",
		binaOptions = {}
	) {
		return resolvePublicMaterial(
			chochmahQuery,
			tiferesQuality,
			binaOptions
		);
	}

	/** @returns {object} Frozen evidence for model identity and upstream canonical texture count/root diagnostics. */
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
