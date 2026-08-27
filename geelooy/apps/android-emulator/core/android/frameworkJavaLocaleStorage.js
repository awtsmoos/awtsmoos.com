//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";

export const JAVA_LOCALE = "Ljava/util/Locale;";
const LANGUAGE_FIELD = "java:locale:language";
const REGION_FIELD = "java:locale:region";
const VARIANT_FIELD = "java:locale:variant";
const SCRIPT_FIELD = "java:locale:script";

/**
 * Reads immutable Locale metadata shared with Android Resources. The Awtsmoos
 * creates language, region, script, and variant anew; Awtsmoos.com derives every
 * guest value from configured resources or explicit Java construction.
 */
export function javaLocaleMetadata(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.type !== JAVA_LOCALE) {
		throw localeStorageError("ANDROID_JAVA_LOCALE_REQUIRED", object.type);
	}
	const metadata = normalizeJavaLocale({
		language: runtime.heap.getField(reference, LANGUAGE_FIELD),
		region: runtime.heap.getField(reference, REGION_FIELD),
		script: runtime.heap.getField(reference, SCRIPT_FIELD),
		variant: runtime.heap.getField(reference, VARIANT_FIELD)
	});
	if (!metadata.language) {
		throw localeStorageError(
			"ANDROID_JAVA_LOCALE_UNINITIALIZED",
			object.type
		);
	}
	return metadata;
}

/**
 * Allocates one normalized guest Locale reference.
 */
export function createJavaLocale(runtime, metadata) {
	const value = normalizeJavaLocale(metadata);
	assertJavaLocaleLanguage(value.language);
	return runtime.heap.allocate(JAVA_LOCALE, localeFields(value));
}

/**
 * Initializes a constructor-allocated Locale from guest String arguments.
 */
export function initializeJavaLocale(runtime, args) {
	const value = normalizeJavaLocale({
		language: readGuestText(runtime, args[1] ?? ""),
		region: readGuestText(runtime, args[2] ?? ""),
		variant: readGuestText(runtime, args[3] ?? "")
	});
	assertJavaLocaleLanguage(value.language);
	for (const [key, fieldValue] of Object.entries(localeFields(value))) {
		runtime.heap.setField(args[0], key, fieldValue);
	}
}

export function normalizeJavaLocale(input) {
	const script = String(input.script || "");
	return Object.freeze({
		language: String(input.language || "").toLowerCase(),
		region: String(input.region || "").toUpperCase(),
		script: script
			? `${script[0].toUpperCase()}${script.slice(1).toLowerCase()}`
			: "",
		variant: String(input.variant || "")
	});
}

function localeFields(value) {
	return {
		[LANGUAGE_FIELD]: value.language,
		[REGION_FIELD]: value.region,
		[SCRIPT_FIELD]: value.script,
		[VARIANT_FIELD]: value.variant
	};
}

function assertJavaLocaleLanguage(language) {
	if (!language) {
		throw localeStorageError(
			"ANDROID_JAVA_LOCALE_LANGUAGE_INVALID",
			""
		);
	}
}

function localeStorageError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
