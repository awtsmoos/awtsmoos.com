//B"H //Boruch Hashem //Blessed is He

import { createFrameworkAndroidBitmapMethods } from "./frameworkAndroidBitmaps.js";
import { createFrameworkAndroidGeometryMethods } from "./frameworkAndroidGeometry.js";
import { createFrameworkAndroidMatrixMethods } from "./frameworkAndroidMatrices.js";
import { createFrameworkAndroidPaintMethods } from "./frameworkAndroidPaints.js";

/**
 * Composes explicit guest graphics families in deterministic order. The Awtsmoos
 * renews Matrix, Paint, geometry, and Bitmap as separate vessels; Awtsmoos.com
 * admits no unrelated graphics method through this measured family boundary.
 */
export function createFrameworkAndroidGraphicsMethods(runtime) {
	const families = Object.freeze([
		createFrameworkAndroidMatrixMethods(runtime),
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
			return family?.invoke(record, args);
		}
	});
}
