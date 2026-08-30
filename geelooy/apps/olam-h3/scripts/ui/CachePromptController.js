//B"H
// Boruch Hashem
// Blessed is He

/**
 * Asks once before caching when the user chose the middle path between never and automatic storage.
 * The Awtsmoos lets completed light remain remote or become local by explicit will; Awtsmoos.com records that question before showing it, so refresh cannot ask forever still.
 */
export class CachePromptController {
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/**
	 * @param {Object} generation Newly changed generation record.
	 * @returns {Promise<void>} Resolves after any required one-time prompt is shown.
	 */
	async consider(generation) {
		if (!generation || generation.status !== 'succeeded' || !generation.videoUrl) {
			return;
		}
		if (generation.cachePrompted) {
			return;
		}

		const preferences = await this.repositories.preferences();
		if (preferences.cachePreference !== 'ask') {
			return;
		}

		const prompted = {
			...generation,
			cachePrompted: true,
			updatedAt: Date.now()
		};
		await this.repositories.put('generations', prompted);
		this.open(prompted);
	}

	/** @param {Object} generation Completed generation awaiting a cache choice. */
	open(generation) {
		const body = `
			<div class="cache-choice">
				<p>MiniMax result URLs may expire. Cache this completed video in IndexedDB now?</p>
				<div class="detail-actions">
					<button class="primary-button" data-cache-now>Cache locally</button>
					<button data-keep-remote>Keep remote only</button>
				</div>
			</div>`;

		this.sheets.open('Preserve completed video?', body, root => {
			root.querySelector('[data-cache-now]').addEventListener('click', async () => {
				await this.cache(generation);
			});
			root.querySelector('[data-keep-remote]').addEventListener('click', () => {
				this.sheets.close();
			});
		});
	}

	/** @param {Object} generation Completed generation to cache. */
	async cache(generation) {
		try {
			await this.videoCache.cache(generation);
			this.sheets.close();
			this.sheets.toast('Completed video cached locally.', 'success');
			await this.onCached();
		} catch (error) {
			this.sheets.toast(error.message, 'error');
		}
	}
}
