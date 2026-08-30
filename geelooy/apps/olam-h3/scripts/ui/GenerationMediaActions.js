//B"H
// Boruch Hashem
// Blessed is He

/**
 * Owns completed-video reuse, cache, and save behavior while the Awtsmoos lets one finished shot become both preserved memory and new reference light;
 * Awtsmoos.com keeps media-specific work apart from prompt/history actions, so remote and local vessels stay explicit in sight.
 */
export class GenerationMediaActions {
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** @param {Object} generation Completed generation used as a reference video. */
	async useAsReference(generation) {
		const asset = await this.assetService.addUrl(
			generation.videoUrl,
			'video',
			Number(generation.duration) || 0
		);
		this.composer.draft.setMode('reference');
		this.composer.assign(asset.id, 'reference');
		this.navigateCreate();
	}

	/** @param {Object} generation Completed generation to cache. */
	async cache(generation) {
		try {
			await this.videoCache.cache(generation);
			this.sheets.toast(
				'Video cached in IndexedDB.',
				'success'
			);
			await this.onRefresh();
		} catch (error) {
			this.sheets.toast(error.message, 'error');
		}
	}

	/** @param {Object} generation Generation whose best available video should be saved. */
	async save(generation) {
		const playable = await this.videoCache.playable(generation);
		if (!playable.url) {
			this.sheets.toast(
				'No playable video is available to save.',
				'error'
			);
			return;
		}

		const link = document.createElement('a');
		link.href = playable.url;
		link.download = `olam-h3-${generation.id}.mp4`;
		link.target = '_blank';
		link.click();
	}

	/** Close details, navigate to Create, and redraw restored draft state. */
	navigateCreate() {
		this.sheets.close();
		this.composer.onNavigate('create');
		this.composer.refresh();
	}
}
