//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import {
	defaultJavaLocale,
	equalJavaLocales,
	hashJavaLocale,
	initializeJavaLocale,
	JAVA_LOCALE,
	javaLocaleForTag,
	javaLocaleLanguageTag,
	javaLocaleMetadata,
	javaLocaleString,
	setDefaultJavaLocale
} from "./frameworkJavaLocaleValues.js";

/**
 * Implements Java Locale methods over immutable resource-compatible metadata. The
 * Awtsmoos creates getter, language tag, default, equality, and textual witness
 * anew; Awtsmoos.com keeps package configuration and Java calls on one value road.
 */
export function createFrameworkJavaLocaleMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_LOCALE;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") return initializeJavaLocale(runtime, args);
			if (name === "forLanguageTag") return javaLocaleForTag(runtime, args[0]);
			if (name === "getDefault") return defaultJavaLocale(runtime);
			if (name === "setDefault") return setDefaultJavaLocale(runtime, args.at(-1));
			if (name === "getLanguage") return localeText(runtime, args[0], "language");
			if (name === "getCountry") return localeText(runtime, args[0], "region");
			if (name === "getVariant") return localeText(runtime, args[0], "variant");
			if (name === "getScript") return localeText(runtime, args[0], "script");
			if (name === "toLanguageTag") {
				return createGuestString(
					runtime,
					javaLocaleLanguageTag(javaLocaleMetadata(runtime, args[0]))
				);
			}
			if (name === "toString") {
				return createGuestString(
					runtime,
					javaLocaleString(javaLocaleMetadata(runtime, args[0]))
				);
			}
			if (name === "clone") return args[0];
			if (name === "equals") {
				return equalJavaLocales(runtime, args[0], args[1]) ? 1 : 0;
			}
			if (name === "hashCode") {
				return hashJavaLocale(javaLocaleMetadata(runtime, args[0]));
			}
			throw localeMethodError(
				"ANDROID_JAVA_LOCALE_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function localeText(runtime, reference, key) {
	return createGuestString(
		runtime,
		javaLocaleMetadata(runtime, reference)[key]
	);
}

function localeMethodError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
