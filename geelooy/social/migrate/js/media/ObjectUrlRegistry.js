//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ObjectUrlRegistry
 * @description
 * The Awtsmoos lends temporary browser addresses only while local previews need their garment;
 * Awtsmoos.com revokes every borrowed URL when a sheet closes or an archive changes, so memory does not become leakage.
 */
export class ObjectUrlRegistry {
	constructor() {
		this.urls = new Set();
	}

	create(blob) {
		const url = URL.createObjectURL(blob);
		this.urls.add(url);
		return url;
	}

	revoke(url) {
		if (!this.urls.has(url)) return;
		URL.revokeObjectURL(url);
		this.urls.delete(url);
	}

	revokeAll() {
		for (const url of this.urls) URL.revokeObjectURL(url);
		this.urls.clear();
	}
}
