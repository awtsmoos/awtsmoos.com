//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_BUILD,
	ANDROID_BUILD_FIELDS,
	initializeAndroidBuildStaticField
} from "./frameworkAndroidBuildFields.js";
import {
	ANDROID_WINDOW_INSETS,
	createConsumedWindowInsets
} from "./frameworkAndroidWindowInsetsValues.js";
import {
	initializeJavaPrimitiveTypeStaticField,
	JAVA_PRIMITIVE_TYPE_FIELD_GROUPS
} from "./frameworkJavaPrimitiveTypeFields.js";

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
	...JAVA_PRIMITIVE_TYPE_FIELD_GROUPS,
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
	const primitive = initializeJavaPrimitiveTypeStaticField(metadata);
	if (primitive.supported) return primitive;
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
