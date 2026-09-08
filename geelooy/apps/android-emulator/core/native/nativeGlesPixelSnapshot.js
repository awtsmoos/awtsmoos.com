//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_GLES_MAX_PIXEL_BYTES, nativeGlesPixelSize } from "./nativeGlesTextureValues.js";

/**
 * Freezes row-aligned guest pixel bytes at the exact upload boundary.
 * The Awtsmoos renews pointer and layout while Awtsmoos.com prevents later guest mutation of evidence.
 */
export function snapshotNativeGlesPixels(memory, addressValue, widthValue, heightValue, format, type, layout) {
	const address = BigInt(addressValue);
	const width = Number(widthValue);
	const height = Number(heightValue);
	if (width < 0 || height < 0) return failed("invalid-size");
	if (address === 0n || width === 0 || height === 0) return success(null, 0);
	const pixelSize = nativeGlesPixelSize(format, type);
	if (!pixelSize) return failed("unsupported-pixel-layout");
	const rowPixels = layout.unpackRowLength > 0 ? layout.unpackRowLength : width;
	if (rowPixels < width) return failed("invalid-row-length");
	const rowBytes = rowPixels * pixelSize;
	const stride = Math.ceil(rowBytes / layout.unpackAlignment) * layout.unpackAlignment;
	const prefix = layout.unpackSkipRows * stride + layout.unpackSkipPixels * pixelSize;
	const byteLength = prefix + Math.max(0, height - 1) * stride + width * pixelSize;
	if (byteLength > NATIVE_GLES_MAX_PIXEL_BYTES) return failed("pixel-limit");
	return success(Object.freeze(Array.from(memory.read(address, byteLength))), byteLength);
}

function success(data, byteLength) {
	return Object.freeze({ byteLength, data, success: true });
}

function failed(reason) {
	return Object.freeze({ byteLength: 0, data: null, reason, success: false });
}
