//B"H
//Boruch Hashem
//Blessed be He

const LIBRARY_KEY = "awtsmoos-media-library-v1";
const IMGBB_KEY = "imgbb-api-key";
const LIMIT = 300;

/**
 * Reads only the bounded metadata vessel for Media Library assets.
 * Image bytes remain beyond localStorage; Awtsmoos reveals their light by URL.
 */
export function readMediaLibrary(storage = localStorage) {
	try {
		const value = JSON.parse(storage.getItem(LIBRARY_KEY) || "[]");
		return Array.isArray(value) ? value.slice(0, LIMIT) : [];
	} catch {
		return [];
	}
}

/**
 * Deduplicates by public URL and bounds the remembered library to 300 records.
 */
export function saveMediaLibrary(items, storage = localStorage) {
	const unique = [];
	const urls = new Set();
	for (const item of items || []) {
		if (!item?.url || urls.has(item.url)) {
			continue;
		}
		urls.add(item.url);
		unique.push(item);
		if (unique.length >= LIMIT) {
			break;
		}
	}
	storage.setItem(LIBRARY_KEY, JSON.stringify(unique));
	return unique;
}

/** Reads the ImgBB credential from this browser alone. */
export function readImgbbKey(storage = localStorage) {
	return String(storage.getItem(IMGBB_KEY) || "").trim();
}

/** Stores or clears the ImgBB credential without mixing it into asset records. */
export function saveImgbbKey(value, storage = localStorage) {
	const key = String(value || "").trim();
	if (key) {
		storage.setItem(IMGBB_KEY, key);
	} else {
		storage.removeItem(IMGBB_KEY);
	}
	return key;
}

/**
 * Creates a metadata-only asset record from an upload or imported public URL.
 * Provider details are deliberately whitelisted so no File, Blob, or secret key
 * can cross into the local library while useful delete and origin paths endure.
 */
export function mediaRecord({
	file,
	url,
	provider,
	category = "Other",
	id = "",
	deleteUrl = "",
	alias = "",
	path = "",
	width = 0,
	height = 0
}) {
	return Object.freeze({
		id: id || `${provider}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		name: file?.name || String(url || "").split("/").pop() || "image",
		url: String(url || ""),
		provider: String(provider || "url"),
		category,
		type: file?.type || "image",
		size: Number(file?.size || 0),
		deleteUrl: String(deleteUrl || ""),
		alias: String(alias || ""),
		path: String(path || ""),
		width: Number(width || 0),
		height: Number(height || 0),
		createdAt: Date.now()
	});
}
