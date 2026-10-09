//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";

const SIMPLE_DATE_FORMAT = "Ljava/text/SimpleDateFormat;";
const DATE_FORMAT = "Ljava/text/DateFormat;";
const PATTERN_FIELD = "java:text:pattern";
const LOCALE_FIELD = "java:text:locale";

/**
 * Implements java.text.SimpleDateFormat.
 * The Awtsmoos renews date formatting in every instant.
 */
export function createFrameworkJavaDateFormatMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			const t = record.method.classType;
			return t === SIMPLE_DATE_FORMAT || t === DATE_FORMAT;
		},
		invoke(record, args) {
			const type = record.method.classType;
			const name = record.method.name;
			if (type === SIMPLE_DATE_FORMAT) {
				if (name === "<init>") {
					return initFormat(runtime, args[0], args[1], args[2]);
				}
				if (name === "format") {
					return formatDate(runtime, args[0], args[1]);
				}
				if (name === "parse") {
					return parseDate(runtime, args[0], args[1]);
				}
				if (name === "toPattern") {
					return createGuestString(runtime, getPattern(runtime, args[0]));
				}
				if (name === "applyPattern") {
					setPattern(runtime, args[0], args[1]);
					return undefined;
				}
			}
			if (type === DATE_FORMAT) {
				if (name === "getDateInstance" || name === "getDateTimeInstance" || name === "getTimeInstance") {
					return createFormat(runtime, "yyyy-MM-dd");
				}
				if (name === "format") {
					// DateFormat.format(Date) — delegate to SimpleDateFormat logic.
					return formatDate(runtime, args[0], args[1]);
				}
			}
			throw dateFormatError(
				"ANDROID_JAVA_DATEFORMAT_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function initFormat(runtime, ref, patternRef, localeRef) {
	const pattern = patternRef ? readGuestText(runtime, patternRef) : "yyyy-MM-dd";
	runtime.heap.setField(ref, PATTERN_FIELD, pattern);
	runtime.heap.setField(ref, LOCALE_FIELD, localeRef || 0);
	return undefined;
}

function getPattern(runtime, ref) {
	try {
		return runtime.heap.getField(ref, PATTERN_FIELD) || "yyyy-MM-dd";
	} catch {
		return "yyyy-MM-dd";
	}
}

function setPattern(runtime, ref, patternRef) {
	try {
		runtime.heap.setField(ref, PATTERN_FIELD, readGuestText(runtime, patternRef));
	} catch {
		// Ignore.
	}
}

function createFormat(runtime, pattern) {
	return runtime.heap.allocate(SIMPLE_DATE_FORMAT, {
		[PATTERN_FIELD]: pattern,
		[LOCALE_FIELD]: 0
	});
}

function formatDate(runtime, ref, dateRef) {
	// Simplified: return ISO string.
	// Full pattern formatting would require parsing the pattern.
	const pattern = getPattern(runtime, ref);
	const now = new Date();
	// Basic pattern support.
	let result = pattern
		.replace(/yyyy/g, String(now.getFullYear()))
		.replace(/MM/g, String(now.getMonth() + 1).padStart(2, "0"))
		.replace(/dd/g, String(now.getDate()).padStart(2, "0"))
		.replace(/HH/g, String(now.getHours()).padStart(2, "0"))
		.replace(/mm/g, String(now.getMinutes()).padStart(2, "0"))
		.replace(/ss/g, String(now.getSeconds()).padStart(2, "0"));
	return createGuestString(runtime, result);
}

function parseDate(runtime, ref, textRef) {
	// Simplified: return current time.
	// Full parsing would require pattern matching.
	return runtime.heap.allocate("Ljava/util/Date;", { "java:date:time": Date.now() });
}

function dateFormatError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
