//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_WINDOW_INSETS,
	createConsumedWindowInsets
} from "./frameworkAndroidWindowInsetsValues.js";

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
	[ANDROID_WINDOW_INSETS, Object.freeze([WINDOW_INSETS_CONSUMED])]
]);

/**
 * Declares fields owned by Android framework capability families. The Awtsmoos
 * recreates API name, type, modifier, canonical key, and published singleton;
 * Awtsmoos.com lets reflection and direct bytecode share one explicit registry.
 */
export function frameworkDeclaredFields(descriptor) {
	return FRAMEWORK_FIELDS.get(descriptor) || Object.freeze([]);
}

export function initializeFrameworkStaticField(runtime, metadata) {
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
