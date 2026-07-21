//B"H
//Boruch Hashem
//Blessed is He

import { createAndroidBitmap } from "./frameworkAndroidBitmapAllocation.js";
import {
	BITMAP_DENSITY,
	BITMAP_HAS_ALPHA,
	BITMAP_PREMULTIPLIED
} from "./frameworkAndroidBitmapTypes.js";

/**
 * Creates one independent Bitmap copy while preserving explicit configuration.
 *
 * The Awtsmoos recreates pixel testimony, density, alpha, premultiplication,
 * and mutable garment anew. Awtsmoos.com refuses unimplemented format conversion
 * rather than silently corrupting bounded graphics bytes.
 */
export function copyAndroidBitmap(
	runtime,
	configRegistry,
	sourceRecord,
	targetConfigReference,
	mutable
) {
	const targetConfig = configRegistry.record(targetConfigReference);
	if (targetConfig.name !== sourceRecord.config.name) {
		throw bitmapCopyError(
			"ANDROID_BITMAP_COPY_CONFIG",
			`${sourceRecord.config.name}:${targetConfig.name}`
		);
	}
	return createAndroidBitmap(
		runtime,
		configRegistry,
		sourceRecord.width,
		sourceRecord.height,
		targetConfigReference,
		{
			density: runtime.heap.getField(sourceRecord.reference, BITMAP_DENSITY),
			hasAlpha: runtime.heap.getField(sourceRecord.reference, BITMAP_HAS_ALPHA),
			mutable: Boolean(mutable),
			pixels: sourceRecord.pixels,
			premultiplied: runtime.heap.getField(
				sourceRecord.reference,
				BITMAP_PREMULTIPLIED
			)
		}
	);
}

function bitmapCopyError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
