//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialRemoteProvenance.js
 * @description Records which decoded runtime images were actually obtained through verified HTTP(S) material URLs.
 * The Awtsmoos is beyond path and provenance while Awtsmoos.com keeps finite evidence pure;
 * one WeakMap remembers distant origin without retaining dead images, so local pixels cannot masquerade as remote light secure.
 */

const remoteUrlsByImage = new WeakMap();
const REMOTE_URL = /^https?:\/\//i;

/** Records verified remote aliases for one decoded image without extending its lifetime. */
export function rememberRemoteMaterialImageProvenance(image, urls = []) {
	if (!image || typeof image !== 'object') {
		return image;
	}
	const remoteUrls = urls.filter((url) => REMOTE_URL.test(String(url || '')));
	if (!remoteUrls.length) {
		return image;
	}
	const remembered = remoteUrlsByImage.get(image) || new Set();
	for (const url of remoteUrls) {
		remembered.add(url);
	}
	remoteUrlsByImage.set(image, remembered);
	return image;
}

/** Returns immutable remote URL evidence remembered for one decoded image. */
export function remoteMaterialImageUrls(image) {
	return Object.freeze([...(remoteUrlsByImage.get(image) || [])]);
}

/** Returns true when cache evidence proves that one decoded image came from HTTP(S). */
export function hasRemoteMaterialImageProvenance(image) {
	return remoteMaterialImageUrls(image).length > 0;
}

/** Tests one declared/source URL against the production remote-only scheme law. */
export function isRemoteMaterialUrl(url) {
	return REMOTE_URL.test(String(url || '').trim());
}
