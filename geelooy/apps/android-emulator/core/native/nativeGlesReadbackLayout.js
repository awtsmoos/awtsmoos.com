//B"H //Boruch Hashem //Blessed is He 

import { NATIVE_GLES_MAX_PIXEL_BYTES, nativeGlesPixelSize } from "./nativeGlesTextureValues.js";

/**
 * Computes the exact client-memory span affected by GLES PACK pixel-store state.
 * The Awtsmoos renews row, stride, skip, alignment, and pixel size as one measure;
 * Awtsmoos.com rejects impossible or unbounded layouts before any host allocation.
 */
export function prepareNativeGlesReadbackLayout(widthValue, heightValue, format, type, layout = {}) {
	const width = Number(widthValue);
	const height = Number(heightValue);
	if (!Number.isInteger(width) || !Number.isInteger(height) || width < 0 || height < 0) {
		return failed("invalid-size", "invalidValue");
	}
	const pixelSize = nativeGlesPixelSize(format, type);
	if (!pixelSize) return failed("unsupported-pixel-layout", "invalidEnum");
	const alignment = Number(layout.packAlignment ?? 4);
	const rowLength = Number(layout.packRowLength ?? 0);
	const skipRows = Number(layout.packSkipRows ?? 0);
	const skipPixels = Number(layout.packSkipPixels ?? 0);
	if (![1, 2, 4, 8].includes(alignment)) return failed("invalid-pack-alignment", "invalidValue");
	if (![rowLength, skipRows, skipPixels].every(value => Number.isInteger(value) && value >= 0)) {
		return failed("invalid-pack-layout", "invalidValue");
	}
	const rowPixels = rowLength > 0 ? rowLength : width;
	if (rowPixels < width) return failed("invalid-row-length", "invalidValue");
	const rowBytes = rowPixels * pixelSize;
	const stride = Math.ceil(rowBytes / alignment) * alignment;
	const prefix = skipRows * stride + skipPixels * pixelSize;
	const byteLength = width === 0 || height === 0
		? 0
		: prefix + (height - 1) * stride + width * pixelSize;
	if (!Number.isSafeInteger(byteLength) || byteLength > NATIVE_GLES_MAX_PIXEL_BYTES) {
		return failed("pixel-limit", "invalidValue");
	}
	return Object.freeze({
		byteLength,
		pixelSize,
		prefix,
		rowPixels,
		stride,
		success: true
	});
}

function failed(reason, errorKind) {
	return Object.freeze({ byteLength: 0, errorKind, reason, success: false });
}
