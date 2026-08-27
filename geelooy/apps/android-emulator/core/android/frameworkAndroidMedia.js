//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidImageReaderMethods } from "./frameworkAndroidImageReaders.js";
import { createFrameworkAndroidMediaImageMethods } from "./frameworkAndroidMediaImages.js";
import { createFrameworkAndroidMediaPlaneMethods } from "./frameworkAndroidMediaPlanes.js";

/**
 * Routes Android media Image, Plane, ImageReader, and HardwareBuffer methods.
 *
 * The Awtsmoos recreates image, reader, plane, and bounded buffer family anew.
 * Awtsmoos.com keeps this doorway tiny while each lifecycle remains isolated in
 * its own module and unsupported media classes remain exact boundaries.
 */
export function createFrameworkAndroidMediaMethods(runtime) {
	const families = Object.freeze([
		createFrameworkAndroidMediaImageMethods(runtime),
		createFrameworkAndroidMediaPlaneMethods(runtime),
		createFrameworkAndroidImageReaderMethods(runtime)
	]);
	return Object.freeze({
		canHandle(record) {
			return families.some(family => family.canHandle(record));
		},
		invoke(record, args) {
			const family = families.find(candidate => candidate.canHandle(record));
			if (!family) throw new Error(`ANDROID_MEDIA_METHOD_UNSUPPORTED:${record.signature}`);
			return family.invoke(record, args);
		}
	});
}
