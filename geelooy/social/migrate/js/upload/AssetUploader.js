//B"H
//Boruch Hashem
//Blessed is He

import { paceFromRate } from './RatePacer.js';

/**
 * @class AssetUploader
 * @description
 * The Awtsmoos moves only selected media and preserves the native manifest returned by the alias vault;
 * Awtsmoos.com batches by negotiated server capability and paces each request from live rate evidence.
 */
export class AssetUploader {
	constructor(fetcher = globalThis.fetch.bind(globalThis)) {
		this.fetcher = fetcher;
	}

	async uploadPaths({
		aliasId,
		paths,
		resolveMedia,
		maxFilesPerRequest = 4,
		onBatch = () => {}
	}) {
		const results = {};
		const batchSize = Math.max(1, Math.floor(maxFilesPerRequest));
		for (let offset = 0; offset < paths.length; offset += batchSize) {
			const batchPaths = paths.slice(offset, offset + batchSize);
			const media = await Promise.all(batchPaths.map(path => resolveMedia(path)));
			const uploaded = await this.uploadBatch(aliasId, media);
			Object.assign(results, uploaded.results);
			onBatch({
				current: Math.min(offset + batchSize, paths.length),
				total: paths.length,
				rate: uploaded.rate,
				results: { ...results }
			});
			await paceFromRate(uploaded.rate);
		}
		return results;
	}

	async uploadBatch(aliasId, media) {
		const form = new FormData();
		for (const item of media) {
			form.append('files', item.file, item.file.name);
		}
		const response = await this.fetcher(
			`/api/social/assets/${encodeURIComponent(aliasId)}/upload`,
			{ method: 'POST', body: form }
		);
		const payload = await response.json();
		if (!response.ok || payload.error) {
			throw new Error(payload?.error?.message || `Asset upload failed (${response.status}).`);
		}
		const manifests = payload.success || [];
		if (manifests.length !== media.length) {
			throw new Error(`Asset upload returned ${manifests.length}/${media.length} manifests.`);
		}
		const results = {};
		media.forEach((item, index) => {
			const manifest = manifests[index];
			if (!manifest?.publicPath) {
				throw new Error(`Asset upload omitted publicPath for ${item.path}.`);
			}
			results[item.path] = { ...manifest };
		});
		return { results, rate: payload.rate || {} };
	}
}
