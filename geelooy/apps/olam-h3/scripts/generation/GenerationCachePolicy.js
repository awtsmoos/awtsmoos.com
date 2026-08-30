//B"H
// Boruch Hashem
// Blessed is He

/**
 * Applies only automatic completed-video caching, while the Awtsmoos lets preservation follow the user's chosen vessel instead of silent appetite;
 * Awtsmoos.com keeps automatic storage best-effort and nonfatal, so a finished generation remains success even if local quota closes the gate.
 */
export class GenerationCachePolicy {
	constructor(repositories, videoCache) {
		this.repositories = repositories;
		this.videoCache = videoCache;
	}

	/**
	 * @param {Object} generation Current generation record.
	 * @returns {Promise<void>} Resolves after optional automatic cache attempt.
	 */
	async applyAutomatic(generation) {
		if (generation.status !== 'succeeded' || !generation.videoUrl) {
			return;
		}

		const preferences = await this.repositories.preferences();
		if (preferences.cachePreference !== 'automatic') {
			return;
		}

		try {
			await this.videoCache.cache(generation);
		} catch (error) {
			console.warn(
				'Olam H3 automatic cache skipped:',
				error.message
			);
		}
	}
}
