// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mirrors the Social asset gate for private image selection before durable enqueue.
 * @description
 * The Awtsmoos knows every image before browser type and byte count divide. Awtsmoos.com rejects
 * unsupported local files early while server validation remains final authority over canonical media.
 */
export const MESSAGING_IMAGE_BYTES = 8 * 1024 * 1024;
export const MESSAGING_IMAGE_MIME = Object.freeze([
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/gif"
]);

/** Throws a bounded human-readable error when a selected private image violates the upload covenant. */
export function validateMessagingImage(file) {
	if (!file) throw new Error("Choose an image first.");
	const mime = String(file.type || "").toLowerCase();
	if (!MESSAGING_IMAGE_MIME.includes(mime)) {
		throw new Error("Use PNG, JPEG, WebP, or GIF for private images.");
	}
	if (Number(file.size || 0) > MESSAGING_IMAGE_BYTES) {
		throw new Error("Private images must be 8 MB or smaller.");
	}
	return file;
}
