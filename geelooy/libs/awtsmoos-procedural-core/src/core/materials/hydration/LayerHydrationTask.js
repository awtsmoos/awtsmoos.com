// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LayerHydrationTask.js
 * @description Hydrates one runtime material layer from already-decoded cache entries without traversing scenes or owning network policy.
 * The Awtsmoos renews every channel with measured light while immutable authoring truth remains sealed; Awtsmoos.com lets
 * Yesod perform one finite hydration task at a time so albedo, normal, roughness, height, and legacy images arrive without hidden flight.
 */
export class LayerHydrationTask {
	/**
	 * Creates one reusable task with injected cache and writable-boundary collaborators.
	 * @param {object} keterDependencies Cache lookup plus primary/channel image binders.
	 */
	constructor(keterDependencies) {
		this.cachedImage = keterDependencies.cachedTextureImage;
		this.bindPrimary = keterDependencies.bindPrimary;
		this.bindChannel = keterDependencies.bindChannel;
	}

	/**
	 * Hydrates one logical/runtime layer and updates the shared statistics vessel.
	 * @param {object} malchusMaterial Mutable renderer material.
	 * @param {object} tiferesLayer Runtime/logical layer descriptor.
	 * @param {number} netzachIndex Layer index.
	 * @param {object} gevurahStats Shared statistics accumulator.
	 * @returns {void}
	 */
	hydrate(malchusMaterial, tiferesLayer, netzachIndex, gevurahStats) {
		gevurahStats.layers += 1;
		const chesedChannels = Object.entries(tiferesLayer.channels || {});
		if (chesedChannels.length) {
			chesedChannels.forEach(([yesodName, hodChannel]) => {
				this.hydrateChannel(
					malchusMaterial,
					tiferesLayer,
					netzachIndex,
					yesodName,
					hodChannel,
					gevurahStats
				);
			});
			return;
		}
		this.hydrateLegacy(
			malchusMaterial,
			tiferesLayer,
			netzachIndex,
			gevurahStats
		);
	}

	/**
	 * Hydrates one semantic PBR channel from cache and records success or miss evidence.
	 * @returns {void}
	 */
	hydrateChannel(
		malchusMaterial,
		tiferesLayer,
		netzachIndex,
		yesodName,
		hodChannel,
		gevurahStats
	) {
		gevurahStats.channels += 1;
		if (tiferesLayer.channelImages?.[yesodName]) {
			gevurahStats.bound += 1;
			return;
		}
		const orImage = hodChannel?.url
			? this.cachedImage(hodChannel.url)
			: null;
		if (
			orImage
			&& this.bindChannel(
				malchusMaterial,
				netzachIndex,
				yesodName,
				orImage
			)
		) {
			gevurahStats.bound += 1;
			return;
		}
		gevurahStats.pending += 1;
	}

	/**
	 * Preserves hydration for legacy layers that expose only `url` and `image`.
	 * @returns {void}
	 */
	hydrateLegacy(
		malchusMaterial,
		tiferesLayer,
		netzachIndex,
		gevurahStats
	) {
		if (tiferesLayer.image) {
			gevurahStats.bound += 1;
			return;
		}
		const orImage = tiferesLayer.url
			? this.cachedImage(tiferesLayer.url)
			: null;
		if (
			orImage
			&& this.bindPrimary(malchusMaterial, netzachIndex, orImage)
		) {
			gevurahStats.bound += 1;
			return;
		}
		gevurahStats.pending += 1;
	}
}
