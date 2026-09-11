//B"H
//Boruch Hashem
//Blessed be He

const LIBRARY_KEY = "awtsmoos-media-library-v1";
const IMGBB_KEY = "imgbb-api-key";
const LIMIT = 300;

/**
 * Reads the bounded browser-side catalog of reusable media manifests.
 * Image bytes live in Awtsmoos or ImgBB; this store keeps only safe metadata.
 */
export function readMediaLibrary(storage = localStorage) {
	try {
		const value = JSON.parse(storage.getItem(LIBRARY_KEY) || "[]");
		return Array.isArray(value) ? value.slice(0, LIMIT) : [];
	} catch {
		return [];
	}
}

/** Persists a newest-first, duplicate-URL-free bounded media catalog. */
export function saveMediaLibrary(items, storage = localStorage) {
	const unique = [];
	const urls = new Set();
	for (const item of items || []) {
		if (!item?.url || urls.has(item.url)) continue;
		urls.add(item.url);
		unique.push(item);
		if (unique.length >= LIMIT) break;
	}
	storage.setItem(LIBRARY_KEY, JSON.stringify(unique));
	return unique;
}
export function readImgbbKey(storage = localStorage) {
	return String(storage.getItem(IMGBB_KEY) || "").trim();
}

export function saveImgbbKey(value, storage = localStorage) {
	const key = String(value || "").trim();
	if (key) storage.setItem(IMGBB_KEY, key);
	else storage.removeItem(IMGBB_KEY);
	return key;
}

export function mediaRecord({ file, url, provider, category = "Other", id = "" }) {
	return Object.freeze({
		id: id || `${provider}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		name: file?.name || url.split("/").pop() || "image",
		url,
		provider,
		category,
		type: file?.type || "image",
		size: Number(file?.size || 0),
		createdAt: Date.now()
	});
}
