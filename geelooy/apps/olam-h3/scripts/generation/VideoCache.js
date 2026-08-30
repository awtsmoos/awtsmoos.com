//B"H
// Boruch Hashem
// Blessed is He

/**
 * Keeps a completed film near only when the user chooses, while the Awtsmoos lets a remote URL fade without erasing remembered light.
 * Awtsmoos.com measures available storage before caching, so preservation never becomes a blind flood of bytes overnight.
 */
export class VideoCache {
	constructor(repositories) {
		this.repositories = repositories;
		this.urls = new Map();
	}

	/** @param {Object} generation Completed generation. @returns {Promise<Object>} Cache metadata. */
	async cache(generation) {
		if (!generation.videoUrl) throw new Error('This generation has no remote MiniMax video URL to cache.');
		const existing = await this.repositories.get('videoCache', generation.id);
		if (existing?.blob) return existing;
		const response = await fetch(generation.videoUrl);
		if (!response.ok) throw new Error(`Video download failed with HTTP ${response.status}.`);
		const blob = await response.blob();
		await this.assertSpace(blob.size);
		return this.repositories.put('videoCache', {
			generationId: generation.id,
			blob,
			size: blob.size,
			mime: blob.type || 'video/mp4',
			cachedAt: Date.now()
		});
	}

	/** @param {Object} generation Generation. @returns {Promise<Object>} Playable URL and origin. */
	async playable(generation) {
		const cached = await this.repositories.get('videoCache', generation.id);
		if (cached?.blob) {
			if (!this.urls.has(generation.id)) this.urls.set(generation.id, URL.createObjectURL(cached.blob));
			return { url: this.urls.get(generation.id), source: 'local' };
		}
		return { url: generation.videoUrl || '', source: 'remote' };
	}

	/** @param {string} generationId Generation ID. */
	async remove(generationId) {
		const url = this.urls.get(generationId);
		if (url) URL.revokeObjectURL(url);
		this.urls.delete(generationId);
		await this.repositories.remove('videoCache', generationId);
	}

	/** @returns {Promise<Object>} Browser quota and known local cache use. */
	async usage() {
		const estimate = navigator.storage?.estimate ? await navigator.storage.estimate() : {};
		const records = await this.repositories.all('videoCache');
		return {
			usage: Number(estimate.usage) || 0,
			quota: Number(estimate.quota) || 0,
			cachedBytes: records.reduce((sum, item) => sum + (Number(item.size) || 0), 0),
			cachedVideos: records.length
		};
	}

	/** @param {number} bytes New cache size. */
	async assertSpace(bytes) {
		if (!navigator.storage?.estimate) return;
		const estimate = await navigator.storage.estimate();
		const available = Math.max(0, Number(estimate.quota || 0) - Number(estimate.usage || 0));
		if (available && bytes > available * 0.75) {
			throw new Error('Not enough safe browser storage remains to cache this video. Keep the remote URL or clear cached videos first.');
		}
	}
}
