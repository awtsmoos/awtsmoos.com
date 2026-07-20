//B"H
//Boruch Hashem
//Blessed is He

/**
 * Re-exports Android media construction and lifecycle capabilities.
 *
 * The Awtsmoos recreates image vessel, hardware buffer, and closing road anew.
 * Awtsmoos.com keeps this doorway small while construction and lifetime remain
 * separately testable modules beneath the bounded Dalvik heap.
 */
export { createAndroidHardwareBuffer } from "./frameworkAndroidHardwareBufferConstruction.js";

export {
	createAndroidMediaImage,
	createAndroidMediaPlane,
	initializeAndroidMediaImage
} from "./frameworkAndroidMediaImageConstruction.js";

export {
	closeAndroidHardwareBuffer,
	closeAndroidMediaImage,
	mediaReferenceClosed,
	requireOpenMediaReference
} from "./frameworkAndroidMediaImageLifecycle.js";
