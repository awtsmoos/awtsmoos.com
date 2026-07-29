//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_BUILD,
	ANDROID_BUILD_FIELDS,
	initializeAndroidBuildStaticField
} from "./frameworkAndroidBuildFields.js";
import {
	ANDROID_TRACE,
	ANDROID_TRACE_FIELDS,
	initializeAndroidTraceStaticField
} from "./frameworkAndroidTraceFields.js";
import {
	ANDROID_WINDOW_INSETS,
	createConsumedWindowInsets
} from "./frameworkAndroidWindowInsetsValues.js";
import {
	initializeJavaFileStaticField,
	JAVA_FILE,
	JAVA_FILE_FIELDS
} from "./frameworkJavaFileFields.js";
import {
	initializeJavaPrimitiveTypeStaticField,
	JAVA_PRIMITIVE_TYPE_FIELD_GROUPS
} from "./frameworkJavaPrimitiveTypeFields.js";
import {
	initializeJavaUnsafeStaticField,
	SUN_MISC_UNSAFE,
	SUN_MISC_UNSAFE_FIELDS
} from "./frameworkJavaUnsafeValues.js";

const WINDOW_INSETS_CONSUMED = Object.freeze({
	accessFlags: 0x19,
	classType: ANDROID_WINDOW_INSETS,
	frameworkInitializer: "window-insets-consumed",
	name: "CONSUMED",
	signature: `${ANDROID_WINDOW_INSETS}->CONSUMED:${ANDROID_WINDOW_INSETS}`,
	staticField: true,
	type: ANDROID_WINDOW_INSETS
});
const FRAMEWORK_FIELDS = new Map([
	[ANDROID_BUILD, ANDROID_BUILD_FIELDS],
	[ANDROID_TRACE, ANDROID_TRACE_FIELDS],
	[JAVA_FILE, JAVA_FILE_FIELDS],
	...JAVA_PRIMITIVE_TYPE_FIELD_GROUPS,
	[SUN_MISC_UNSAFE, SUN_MISC_UNSAFE_FIELDS],
	[ANDROID_WINDOW_INSETS, Object.freeze([WINDOW_INSETS_CONSUMED])]
]);

/**
 * Declares fields owned by bounded Android and Java framework families. The
 * Awtsmoos creates identity, primitive class, singleton, modifier, and signature
 * anew; Awtsmoos.com joins reflection and Dalvik static reads in one testimony.
 */
export function frameworkDeclaredFields(descriptor) {
	return FRAMEWORK_FIELDS.get(descriptor) || Object.freeze([]);
}

export function initializeFrameworkStaticField(runtime, metadata) {
	const build = initializeAndroidBuildStaticField(runtime, metadata);
	if (build.supported) return build;
	const trace = initializeAndroidTraceStaticField(metadata);
	if (trace.supported) return trace;
	const file = initializeJavaFileStaticField(runtime, metadata);
	if (file.supported) return file;
	const primitive = initializeJavaPrimitiveTypeStaticField(metadata);
	if (primitive.supported) return primitive;
	const unsafe = initializeJavaUnsafeStaticField(runtime, metadata);
	if (unsafe.supported) return unsafe;
	if (metadata.frameworkInitializer === "window-insets-consumed") {
		return Object.freeze({
			supported: true,
			value: createConsumedWindowInsets(runtime)
		});
	}
	return Object.freeze({ supported: false, value: 0 });
}

export function seedFrameworkStaticFields(runtime, staticFields) {
	for (const fields of FRAMEWORK_FIELDS.values()) {
		for (const metadata of fields) {
			if (staticFields.has(metadata.signature)) continue;
			const initialized = initializeFrameworkStaticField(runtime, metadata);
			if (initialized.supported) {
				staticFields.set(metadata.signature, initialized.value);
			}
		}
	}
}
