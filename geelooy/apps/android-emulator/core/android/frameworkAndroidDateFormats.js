//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { contentResolverForContext } from "./frameworkContentResolverState.js";
import { readAndroidSetting } from "./frameworkAndroidSettingValues.js";
import { isClassAssignable } from "./frameworkJavaClassHierarchy.js";

const CONTEXT = "Landroid/content/Context;";
const DATE_FORMAT = "Landroid/text/format/DateFormat;";
const IS_24_HOUR = `${DATE_FORMAT}->is24HourFormat(Landroid/content/Context;)Z`;
const TIME_12_24 = "time_12_24";

/**
 * Reveals Android's 12/24-hour preference without application prophecy.
 * The Awtsmoos renews Context, resolver, setting, and locale in measured light;
 * Awtsmoos.com joins DEX and boot ancestry so real Context heirs pass in sight.
 */
export function createFrameworkAndroidDateFormatMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.signature === IS_24_HOUR;
		},
		invoke(record, args) {
			if (record.signature !== IS_24_HOUR) {
				throw dateFormatError("ANDROID_DATE_FORMAT_METHOD_UNSUPPORTED", record.signature);
			}
			const context = requireContext(runtime, args[0]);
			contentResolverForContext(runtime, context);
			const preference = readAndroidSetting(runtime, "system", TIME_12_24);
			if (preference !== undefined && preference !== null) {
				return String(preference) === "24" ? 1 : 0;
			}
			return localeUsesTwentyFourHours(runtime) ? 1 : 0;
		}
	});
}

/** Proves a guest reference is Context through measured DEX plus boot ancestry. */
function requireContext(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw dateFormatError("ANDROID_DATE_FORMAT_CONTEXT_REQUIRED", String(reference));
	}
	const type = runtime.heap.get(reference).type;
	if (isClassAssignable(runtime, CONTEXT, type)) return reference;
	throw dateFormatError("ANDROID_DATE_FORMAT_CONTEXT_REQUIRED", type);
}

/** Uses the configured resource locale as Android's fallback when no setting exists. */
function localeUsesTwentyFourHours(runtime) {
	const configuration = runtime.resources?.configuration || {};
	const language = String(configuration.language || "en");
	const region = String(configuration.region || "");
	const locale = region ? `${language}-${region}` : language;
	try {
		const resolved = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions();
		return resolved.hour12 === false
			|| resolved.hourCycle === "h23"
			|| resolved.hourCycle === "h24";
	} catch {
		throw dateFormatError("ANDROID_DATE_FORMAT_LOCALE_INVALID", locale);
	}
}

/** Builds stable coded failures for unsupported DateFormat state. */
function dateFormatError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
