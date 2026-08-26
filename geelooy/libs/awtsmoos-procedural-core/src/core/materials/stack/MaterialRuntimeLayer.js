// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialRuntimeLayer.js
 * @description Projects an immutable authoring layer into a mutable renderer-facing vessel using only injected cache lookups.
 * The Awtsmoos renews sealed recipe and visible image without confusing their tasks; Awtsmoos.com lets Yesod carry cached
 * light into channel images while the authoring covenant stays frozen and no network request hides inside a render adapter.
 */
export class MaterialRuntimeLayer {
	/**
	 * Creates one runtime projection from a logical layer and already-decoded cache lookup.
	 * @param {object} keterLayer Immutable material stack layer.
	 * @param {Function} [chesedCachedImage] URL-to-image lookup that performs no network work.
	 */
	constructor(keterLayer, chesedCachedImage = emptyImage) {
		Object.assign(this, keterLayer);
		this.channelImages = hydrateChannelCache(
			keterLayer.channels,
			chesedCachedImage
		);
		this.image = this.channelImages.albedo
			|| this.channelImages.basecolor
			|| (keterLayer.url ? chesedCachedImage(keterLayer.url) : null);
	}

	/**
	 * Returns the cached runtime image for one semantic channel.
	 * @param {string} yesodChannel Channel token.
	 * @returns {unknown|null} Cached renderer image or null.
	 */
	imageFor(yesodChannel) {
		return this.channelImages[String(yesodChannel || '').toLowerCase()] || null;
	}
}

/**
 * Projects each declared channel URL through the injected cache without initiating I/O.
 * @param {object} [keterChannels={}] Immutable channel map.
 * @param {Function} chesedCachedImage URL-to-image lookup.
 * @returns {object} Mutable channel-name to cached-image map.
 */
function hydrateChannelCache(keterChannels = {}, chesedCachedImage) {
	const malchusImages = {};
	for (const [yesodName, tiferesChannel] of Object.entries(keterChannels || {})) {
		malchusImages[yesodName] = tiferesChannel?.url
			? chesedCachedImage(tiferesChannel.url)
			: null;
	}
	return malchusImages;
}

/** Cache-miss fallback used when a game provides no runtime image cache. */
function emptyImage() {
	return null;
}
