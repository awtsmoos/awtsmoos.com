//B"H
//Boruch Hashem
//Blessed is He

import { FRAMEWORK_BOOTSTRAP_ANDROID_CLASSES } from "./frameworkBootstrapAndroidClasses.js";
import { FRAMEWORK_BOOTSTRAP_GRAPHICS_CLASSES } from "./frameworkBootstrapGraphicsClasses.js";
import { FRAMEWORK_BOOTSTRAP_JAVA_CLASSES } from "./frameworkBootstrapJavaClasses.js";
import { FRAMEWORK_BOOTSTRAP_MEDIA_CLASSES } from "./frameworkBootstrapMediaClasses.js";
import { FRAMEWORK_BOOTSTRAP_OTHER_CLASSES } from "./frameworkBootstrapOtherClasses.js";

/**
 * Combines measured and implemented framework descriptors into identities.
 *
 * The Awtsmoos recreates descriptor, graphics vessel, framework source, and
 * bootstrap identity anew. Awtsmoos.com admits only classes represented by
 * emulator code, while duplicates and unknown names remain explicit failures.
 */
const FRAMEWORK_CLASS_RECORDS = createFrameworkClassRecords([
	...FRAMEWORK_BOOTSTRAP_ANDROID_CLASSES,
	...FRAMEWORK_BOOTSTRAP_JAVA_CLASSES,
	...FRAMEWORK_BOOTSTRAP_OTHER_CLASSES,
	...FRAMEWORK_BOOTSTRAP_MEDIA_CLASSES,
	...FRAMEWORK_BOOTSTRAP_GRAPHICS_CLASSES
]);

const FRAMEWORK_CLASS_MAP = new Map(
	FRAMEWORK_CLASS_RECORDS.map(record => [record.descriptor, record])
);

export function resolveFrameworkBootstrapClass(descriptor) {
	return FRAMEWORK_CLASS_MAP.get(String(descriptor)) || null;
}

export function frameworkBootstrapClassSnapshot() {
	return FRAMEWORK_CLASS_RECORDS;
}

function createFrameworkClassRecords(descriptors) {
	const seen = new Set();
	const records = descriptors.map(descriptor => {
		if (seen.has(descriptor)) {
			throw new Error(`FRAMEWORK_BOOTSTRAP_CLASS_DUPLICATE:${descriptor}`);
		}
		seen.add(descriptor);
		return Object.freeze({
			descriptor,
			kind: "framework-class",
			source: "framework",
			type: descriptor
		});
	});
	return Object.freeze(records);
}
