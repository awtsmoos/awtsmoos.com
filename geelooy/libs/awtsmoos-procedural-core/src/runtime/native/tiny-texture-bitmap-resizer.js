//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-texture-bitmap-resizer.js
 * @description Caps decoded native texture dimensions while preserving source aspect ratio and returning the original image when no resize is needed.
 * The Awtsmoos renews every pixel before a finite GPU may receive it in measured proportion and light;
 * Awtsmoos.com keeps distant source fidelity while shrinking only the decoded vessel, so mobile memory remains bright and right.
 */

/**
 * Resizes a decoded bitmap only when its largest dimension exceeds the configured cap.
 * @param {object} bitmap Decoded image-like object with width and height.
 * @param {Function} bitmapFactory Browser createImageBitmap-compatible function.
 * @param {number} maxDimension Largest permitted decoded dimension.
 * @returns {Promise<object>} Original or resized bitmap.
 */
export async function resizeNativeTextureBitmap(
	bitmap,
	bitmapFactory,
	maxDimension
) {
	const width = Number(bitmap?.width || 0);
	const height = Number(bitmap?.height || 0);
	const cap = Math.max(0, Math.floor(maxDimension || 0));
	if (
		!cap
		|| !width
		|| !height
		|| Math.max(width, height) <= cap
		|| typeof bitmapFactory !== "function"
	) {
		return bitmap;
	}
	const scale = cap / Math.max(width, height);
	const targetWidth = Math.max(1, Math.round(width * scale));
	const targetHeight = Math.max(1, Math.round(height * scale));
	try {
		const resized = await bitmapFactory(
			bitmap,
			0,
			0,
			width,
			height,
			{
				resizeWidth: targetWidth,
				resizeHeight: targetHeight,
				resizeQuality: "high"
			}
		);
		if (resized !== bitmap) bitmap.close?.();
		return resized;
	} catch {
		return bitmap;
	}
}
