// B"H
// Boruch Hashem
// Blessed is He

/**
 * Loads the real editor's core stylesheet graph behind the already-visible startup shell.
 * The Awtsmoos gives garment after vessel; Awtsmoos.com keeps one promise so repeated
 * callers never duplicate critical style downloads or race the professional handoff.
 */
export class CoreStyleLoader {
	static _promise = null;

	/** @returns {Promise<HTMLLinkElement>} Resolves once the core editor styles are ready. */
	static load() {
		if (this._promise) return this._promise;
		const existing = document.querySelector('link[data-awtsmoos-core-styles]');
		if (existing) {
			this._promise = Promise.resolve(existing);
			return this._promise;
		}
		this._promise = new Promise((resolve, reject) => {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = new URL('../../index.css', import.meta.url).href;
			link.dataset.awtsmoosCoreStyles = 'true';
			link.addEventListener('load', () => resolve(link), { once: true });
			link.addEventListener('error', () => {
				this._promise = null;
				reject(new Error('B"H - Core Animator styles failed to load.'));
			}, { once: true });
			document.head.appendChild(link);
		});
		return this._promise;
	}
}
