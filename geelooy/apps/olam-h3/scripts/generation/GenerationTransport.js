//B"H
// Boruch Hashem
// Blessed is He

/**
 * Reassembles reusable local asset IDs into the exact transport roles a provider can understand.
 * The Awtsmoos lets one stored vessel serve a thousand scenes; Awtsmoos.com translates only at the network boundary between.
 */
export class GenerationTransport {
	constructor(repositories, assetService) {
		this.repositories = repositories;
		this.assetService = assetService;
	}

	/** @param {Object} snapshot Provider-neutral generation snapshot. @returns {Promise<Object>} Transport-ready generation. */
	async build(snapshot) {
		const images = [];
		const videos = [];
		const audios = [];
		for (const id of snapshot.referenceAssetIds || []) {
			const asset = await this.requiredAsset(id);
			const role = asset.kind === 'image' ? 'reference_image'
				: asset.kind === 'video' ? 'reference_video'
				: 'reference_audio';
			const transport = await this.assetService.toTransport(asset, role);
			if (asset.kind === 'image') images.push(transport);
			if (asset.kind === 'video') videos.push(transport);
			if (asset.kind === 'audio') audios.push(transport);
		}
		if (snapshot.firstFrameAssetId) {
			const asset = await this.requiredAsset(snapshot.firstFrameAssetId);
			images.push(await this.assetService.toTransport(asset, 'first_frame'));
		}
		if (snapshot.lastFrameAssetId) {
			const asset = await this.requiredAsset(snapshot.lastFrameAssetId);
			images.push(await this.assetService.toTransport(asset, 'last_frame'));
		}
		return { ...snapshot, images, videos, audios };
	}

	/** @param {string} id Asset ID. @returns {Promise<Object>} Saved asset. */
	async requiredAsset(id) {
		const asset = await this.repositories.get('assets', id);
		if (!asset) throw new Error(`A referenced asset is no longer in the local library (${id}).`);
		return asset;
	}
}
