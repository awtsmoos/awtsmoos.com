//B"H
//Boruch Hashem
//Blessed is He

import {
	JAVA_STRING,
	JAVA_STRING_BUFFER,
	JAVA_STRING_BUILDER,
	readGuestArray,
	readJavaText,
	writeJavaText
} from "./frameworkJavaStringValue.js";

/**
 * Constructs measured Java text vessels from strings, bytes, chars, and code
 * points. The Awtsmoos creates source, range, decoding, and mutable beginning anew;
 * Awtsmoos.com bounds every array read and decodes only deterministic UTF text.
 */
export function constructJavaText(runtime, record, args) {
	const type = record.method.classType;
	if (type === JAVA_STRING) {
		writeJavaText(runtime, args[0], constructStringValue(runtime, record, args));
		return undefined;
	}
	if ([JAVA_STRING_BUILDER, JAVA_STRING_BUFFER].includes(type)) {
		writeJavaText(runtime, args[0], constructBuilderValue(runtime, record, args));
		return undefined;
	}
	throw constructorError("ANDROID_JAVA_TEXT_CONSTRUCTOR_TYPE", type);
}

function constructStringValue(runtime, record, args) {
	const descriptor = record.method.descriptor;
	if (descriptor === "(Ljava/lang/String;)V") {
		return readJavaText(runtime, args[1]);
	}
	if (descriptor.startsWith("([B")) {
		return decodeByteString(runtime, descriptor, args);
	}
	if (descriptor === "([C)V") {
		return charString(readGuestArray(runtime, args[1]));
	}
	if (descriptor === "([CII)V") {
		return charString(readGuestArray(runtime, args[1], args[2], args[3]));
	}
	if (descriptor === "([III)V") {
		return codePointString(
			readGuestArray(runtime, args[1], args[2], args[3])
		);
	}
	throw constructorError("ANDROID_JAVA_STRING_CONSTRUCTOR_UNSUPPORTED", descriptor);
}

function constructBuilderValue(runtime, record, args) {
	const descriptor = record.method.descriptor;
	if (descriptor === "()V" || descriptor === "(I)V") return "";
	if (descriptor === "(Ljava/lang/String;)V") {
		return readJavaText(runtime, args[1]);
	}
	throw constructorError("ANDROID_JAVA_BUILDER_CONSTRUCTOR_UNSUPPORTED", descriptor);
}

function decodeByteString(runtime, descriptor, args) {
	const hasRange = descriptor.startsWith("([BII");
	const bytes = readGuestArray(
		runtime,
		args[1],
		hasRange ? args[2] : 0,
		hasRange ? args[3] : null
	);
	const unsigned = Uint8Array.from(bytes, value => Number(value) & 0xff);
	const encoding = charsetName(runtime, args[hasRange ? 4 : 2]);
	try {
		return new TextDecoder(encoding).decode(unsigned);
	} catch (error) {
		const wrapped = constructorError("ANDROID_JAVA_STRING_CHARSET", encoding);
		wrapped.cause = error;
		throw wrapped;
	}
}

function charsetName(runtime, value) {
	if (!value) return "utf-8";
	try {
		const text = readJavaText(runtime, value).trim().toLowerCase();
		if (["utf8", "utf-8"].includes(text)) return "utf-8";
		if (["us-ascii", "ascii"].includes(text)) return "windows-1252";
		return text;
	} catch {
		return String(runtime.heap.getField(value, "java:charset:name") || "utf-8");
	}
}

function charString(values) {
	return String.fromCharCode(...values.map(value => Number(value) & 0xffff));
}

function codePointString(values) {
	return String.fromCodePoint(...values.map(value => Number(value)));
}

function constructorError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
