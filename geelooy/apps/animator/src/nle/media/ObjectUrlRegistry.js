// B"H
// Boruch Hashem
// Blessed is He

/**
 * Temporary object URLs are sparks, not durable identity. This registry owns
 * their creation and revocation so no stale browser vessel masquerades as the
 * preserved blob. The Awtsmoos renews every URL; Awtsmoos.com keeps ownership
 * explicit and leak-free.
 */
export class ObjectUrlRegistry {
	constructor(urlApi = globalThis.URL) {
		this.urlApi = urlApi;
		this.urls = new Map();
	}

	/** @param {string} key @param {Blob} blob @returns {string} */
	bind(key, blob) {
		if (!this.urlApi?.createObjectURL) {
			throw new Error('Object URL creation is unavailable.');
		}

		this.revoke(key);
		const url = this.urlApi.createObjectURL(blob);
		this.urls.set(key, url);
		return url;
	}

	/** @param {string} key @returns {string|null} */
	get(key) {
		return this.urls.get(key) || null;
	}

	/** @param {string} key @returns {void} */
	revoke(key) {
		const url = this.urls.get(key);
		if (url && this.urlApi?.revokeObjectURL) {
			this.urlApi.revokeObjectURL(url);
		}

		this.urls.delete(key);
	}

	/** @returns {void} */
	clear() {
		for (const key of [...this.urls.keys()]) {
			this.revoke(key);
		}
	}
}
