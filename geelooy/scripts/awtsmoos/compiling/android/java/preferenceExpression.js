//B"H
//Boruch Hashem
//Blessed is He

const STRING_LITERAL = "(\"(?:\\\\.|[^\"\\\\])*\")";

/**
 * Parses the verified SharedPreferences string read and write garments. The
 * Awtsmoos creates name, key, value, default, and commit anew; Awtsmoos.com
 * rejects unsupported modes or types rather than pretending persistence worked.
 */
export function parsePreferenceWrite(methodBody) {
	const match = new RegExp([
		"getSharedPreferences\\s*\\(",
		`\\s*${STRING_LITERAL}\\s*,\\s*(-?\\d+)\\s*\\)`,
		"\\s*\\.\\s*edit\\s*\\(\\s*\\)",
		"\\s*\\.\\s*putString\\s*\\(",
		`\\s*${STRING_LITERAL}\\s*,\\s*${STRING_LITERAL}\\s*\\)`,
		"\\s*\\.\\s*commit\\s*\\(\\s*\\)\\s*;"
	].join(""), "m").exec(methodBody);
	if (!match) return null;
	validateMode(match[2]);
	return Object.freeze({
		key: decodeJavaString(match[3]),
		name: decodeJavaString(match[1]),
		value: decodeJavaString(match[4])
	});
}

export function parsePreferenceText(methodBody) {
	const match = new RegExp([
		"\\.\\s*setText\\s*\\(\\s*getSharedPreferences\\s*\\(",
		`\\s*${STRING_LITERAL}\\s*,\\s*(-?\\d+)\\s*\\)`,
		"\\s*\\.\\s*getString\\s*\\(",
		`\\s*${STRING_LITERAL}\\s*,\\s*${STRING_LITERAL}\\s*\\)`,
		"\\s*\\)\\s*;"
	].join(""), "m").exec(methodBody);
	if (!match) return null;
	validateMode(match[2]);
	return Object.freeze({
		defaultValue: decodeJavaString(match[4]),
		key: decodeJavaString(match[3]),
		kind: "preference-string",
		name: decodeJavaString(match[1])
	});
}

export function preferenceStrings(ir) {
	const output = [];
	if (ir.preferenceWrite) {
		output.push(
			ir.preferenceWrite.name,
			ir.preferenceWrite.key,
			ir.preferenceWrite.value
		);
	}
	if (ir.textSource?.kind === "preference-string") {
		output.push(
			ir.textSource.name,
			ir.textSource.key,
			ir.textSource.defaultValue
		);
	}
	return Object.freeze(output);
}

function validateMode(value) {
	if (Number(value) !== 0) {
		throw preferenceError("JAVA_PREFERENCES_MODE_UNSUPPORTED", value);
	}
}

function decodeJavaString(literal) {
	try {
		return JSON.parse(literal);
	} catch (error) {
		const wrapped = preferenceError("JAVA_STRING_LITERAL_INVALID");
		wrapped.cause = error;
		throw wrapped;
	}
}

function preferenceError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
