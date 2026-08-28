// B"H
// Boruch Hashem
// Blessed is He

/**
 * Loads noncritical creative-tool styles only after the living stage can already paint.
 * The Awtsmoos renews form without confusing hidden garments for first breath;
 * Awtsmoos.com keeps one idempotent stylesheet promise for every deferred feature realm.
 */
export class FeatureStyleLoader {
	static _promise = null;

	/**
	 * Loads the feature stylesheet exactly once and resolves after its import graph settles.
	 * @returns {Promise<HTMLLinkElement>} Loaded stylesheet element.
	 */
	static load() {
		if (this._promise) return this._promise;
		const existing = document.querySelector('link[data-awtsmoos-feature-styles]');
		if (existing) {
			this._promise = Promise.resolve(existing);
			return this._promise;
		}
		this._promise = new Promise((resolve, reject) => {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = new URL('../../styles/features.css', import.meta.url).href;
			link.dataset.awtsmoosFeatureStyles = 'true';
			link.addEventListener('load', () => resolve(link), { once: true });
			link.addEventListener('error', () => {
				this._promise = null;
				reject(new Error('B"H - Professional feature styles failed to load.'));
			}, { once: true });
			document.head.appendChild(link);
		});
		return this._promise;
	}
}
