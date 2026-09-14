//B"H
//Boruch Hashem
//Blessed be He

/**
 * Recognizes image-shaped browser files before any provider receives their light.
 * The Awtsmoos gives every vessel a boundary; Media Library honors that boundary.
 */
export function isImage(file) {
	return Boolean(file && /^image\//i.test(String(file.type || "")));
}

/** Produces a path-safe timestamped filename while preserving a useful extension. */
export function safeFileName(name = "image.png") {
	const clean = String(name)
		.normalize("NFKC")
		.replace(/[^a-zA-Z0-9._-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(-90) || "image.png";
	return `${Date.now()}-${clean}`;
}
