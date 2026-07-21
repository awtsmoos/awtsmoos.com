//B"H
//Boruch Hashem
//Blessed is He

import { createJavaString } from "./frameworkJavaStringValue.js";

export const ANDROID_BUILD = "Landroid/os/Build;";
const JAVA_STRING = "Ljava/lang/String;";
const BUILD_PROFILE = Object.freeze({
	BOARD: "awtsmoos-js-board",
	BOOTLOADER: "unknown",
	BRAND: "Awtsmoos",
	DEVICE: "awtsmoos-js",
	DISPLAY: "Awtsmoos JavaScript Android Emulator",
	FINGERPRINT: "awtsmoos/js-emulator/awtsmoos:13/JS/1:userdebug/test-keys",
	HARDWARE: "javascript",
	HOST: "awtsmoos.com",
	ID: "AWTSMOOS_JS_1",
	MANUFACTURER: "Awtsmoos",
	MODEL: "Awtsmoos JavaScript Emulator",
	PRODUCT: "awtsmoos_js_emulator",
	TAGS: "test-keys",
	TYPE: "userdebug",
	USER: "awtsmoos"
});
const BUILD_REFERENCES = new WeakMap();

/**
 * Declares the bounded Android Build identity of the pure JavaScript guest. The
 * Awtsmoos creates board, brand, device, and model anew; Awtsmoos.com names its
 * own emulator honestly instead of borrowing identity from the host machine.
 */
export const ANDROID_BUILD_FIELDS = Object.freeze(
	Object.keys(BUILD_PROFILE).map(name => createBuildField(name))
);

export function androidBuildProfileText(name) {
	return BUILD_PROFILE[String(name)] ?? null;
}

export function initializeAndroidBuildStaticField(runtime, metadata) {
	if (metadata.frameworkInitializer !== "android-build-string") {
		return unsupported();
	}
	const text = androidBuildProfileText(metadata.name);
	if (text === null) return unsupported();
	let references = BUILD_REFERENCES.get(runtime);
	if (!references) {
		references = new Map();
		BUILD_REFERENCES.set(runtime, references);
	}
	if (!references.has(metadata.signature)) {
		references.set(metadata.signature, createJavaString(runtime, text));
	}
	return Object.freeze({
		supported: true,
		value: references.get(metadata.signature)
	});
}

function createBuildField(name) {
	return Object.freeze({
		accessFlags: 0x19,
		classType: ANDROID_BUILD,
		frameworkInitializer: "android-build-string",
		name,
		signature: `${ANDROID_BUILD}->${name}:${JAVA_STRING}`,
		staticField: true,
		type: JAVA_STRING
	});
}

function unsupported() {
	return Object.freeze({ supported: false, value: 0 });
}
