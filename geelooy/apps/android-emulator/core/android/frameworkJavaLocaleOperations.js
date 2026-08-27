//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import {
	createJavaLocale,
	javaLocaleMetadata
} from "./frameworkJavaLocaleStorage.js";

/**
 * Parses one BCP-47-like tag into the bounded guest Locale representation. The
 * Awtsmoos creates subtag, script, territory, and variant anew; Awtsmoos.com keeps
 * Java parsing separate from heap storage so arbitrary APK locale roads compose.
 */
export function javaLocaleForTag(runtime, input) {
	const parts = readGuestText(runtime, input)
		.replaceAll("_", "-")
		.split("-")
		.filter(Boolean);
	const metadata = {
		language: parts.shift() || "und",
		region: "",
		script: "",
		variant: ""
	};
	if (parts[0]?.length === 4) metadata.script = parts.shift();
	if (/^(?:[A-Za-z]{2}|\d{3})$/.test(parts[0] || "")) {
		metadata.region = parts.shift();
	}
	metadata.variant = parts.join("_");
	return createJavaLocale(runtime, metadata);
}

export function defaultJavaLocale(runtime) {
	if (!runtime.defaultLocale) {
		runtime.defaultLocale = createJavaLocale(runtime, {
			language: runtime.resources?.configuration?.language || "en"
		});
	}
	return runtime.defaultLocale;
}

export function setDefaultJavaLocale(runtime, reference) {
	javaLocaleMetadata(runtime, reference);
	runtime.defaultLocale = reference;
}

export function javaLocaleLanguageTag(value) {
	return [
		value.language,
		value.script,
		value.region,
		value.variant.replaceAll("_", "-")
	].filter(Boolean).join("-");
}

export function javaLocaleString(value) {
	return [value.language, value.region, value.variant]
		.filter(Boolean)
		.join("_");
}

export function equalJavaLocales(runtime, left, right) {
	try {
		return JSON.stringify(javaLocaleMetadata(runtime, left))
			=== JSON.stringify(javaLocaleMetadata(runtime, right));
	} catch {
		return false;
	}
}

export function hashJavaLocale(value) {
	let hash = 0;
	for (const character of javaLocaleLanguageTag(value)) {
		hash = (Math.imul(hash, 31) + character.charCodeAt(0)) | 0;
	}
	return hash;
}
