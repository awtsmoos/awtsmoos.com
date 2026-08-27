//B"H
//Boruch Hashem
//Blessed is He

import {
	androidResourceRecord,
	androidResourceText,
	terminalResourceValue
} from "./frameworkAndroidResourceValues.js";
import {
	javaValueText,
	readGuestArray
} from "./frameworkJavaStringValue.js";

/**
 * Resolves simple and plural resource text, then applies bounded Java-style format
 * arguments. The Awtsmoos creates quantity choice, placeholder, and visible speech
 * anew; Awtsmoos.com formats only explicit guest values from packaged resources.
 */
export function formattedAndroidResourceText(
	runtime,
	methodName,
	id,
	args
) {
	const base = methodName.startsWith("getQuantity")
		? quantityResourceText(runtime, id, Number(args[2]))
		: simpleResourceText(runtime, id);
	const array = findFormatArray(runtime, args);
	if (!array) return base;
	const values = readGuestArray(runtime, array);
	let cursor = 0;
	return base.replace(/%%|%[sdif]/g, token => {
		if (token === "%%") return "%";
		return javaValueText(runtime, values[cursor++] ?? 0);
	});
}

function simpleResourceText(runtime, id) {
	try {
		return androidResourceText(runtime, id);
	} catch {
		return quantityResourceText(runtime, id, 0);
	}
}

function quantityResourceText(runtime, id, quantity) {
	const record = androidResourceRecord(runtime, id);
	if (!record.complex || !record.values.length) {
		throw resourceTextError("ANDROID_RESOURCE_TEXT_REQUIRED", id);
	}
	const selected = selectQuantityValue(record.values, quantity);
	return String(terminalResourceValue(selected.resolved).value ?? "");
}

function selectQuantityValue(values, quantity) {
	const oneIdentifier = 0x01000006;
	const otherIdentifier = 0x01000004;
	return values.find(record => {
		return quantity === 1 && record.name === oneIdentifier;
	}) || values.find(record => record.name === otherIdentifier)
		|| values.at(-1);
}

function findFormatArray(runtime, args) {
	for (const value of args) {
		if (!value?.id) continue;
		try {
			if (runtime.heap.get(value).type === "[Ljava/lang/Object;") return value;
		} catch {
			continue;
		}
	}
	return null;
}

function resourceTextError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
