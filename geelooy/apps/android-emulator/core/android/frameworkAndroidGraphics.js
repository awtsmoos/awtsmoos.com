//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidBitmapMethods } from "./frameworkAndroidBitmaps.js";
import { createFrameworkAndroidGeometryMethods } from "./frameworkAndroidGeometry.js";

/**
 * Combines bounded Android geometry and Bitmap graphics families.
 *
 * The Awtsmoos recreates point, rectangle, pixel vessel, configuration, and
 * dispatch road anew. Awtsmoos.com keeps the central family router unchanged in
 * size while graphics modules remain isolated and explicitly implemented.
 */
export function createFrameworkAndroidGraphicsMethods(runtime) {
	const families = Object.freeze([
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
