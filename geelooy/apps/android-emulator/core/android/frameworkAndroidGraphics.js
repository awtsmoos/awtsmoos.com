//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidBitmapMethods } from "./frameworkAndroidBitmaps.js";
import { createFrameworkAndroidGeometryMethods } from "./frameworkAndroidGeometry.js";
import { createFrameworkAndroidPaintMethods } from "./frameworkAndroidPaints.js";

/**
 * Combines bounded Android Paint, geometry, and Bitmap graphics families.
 *
 * The Awtsmoos recreates brush, point, rectangle, pixel vessel, configuration,
 * and dispatch road anew. Awtsmoos.com keeps each graphics law isolated and
 * acknowledges only measured framework signatures.
 */
export function createFrameworkAndroidGraphicsMethods(runtime) {
	const families = Object.freeze([
		createFrameworkAndroidPaintMethods(runtime),
		createFrameworkAndroidGeometryMethods(runtime),
		createFrameworkAndroidBitmapMethods(runtime)
	]);
	return Object.freeze({
		canHandle(record) {
			return families.some(family => family.canHandle(record));
		},
		invoke(record, args) {
			const family = families.find(candidate => candidate.canHandle(record));
			if (!family) {
				throw new Error(`ANDROID_GRAPHICS_METHOD_UNSUPPORTED:${record.signature}`);
			}
			return family.invoke(record, args);
		}
	});
}
