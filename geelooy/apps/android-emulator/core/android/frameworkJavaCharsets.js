//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";

const CHARSET = "Ljava/nio/charset/Charset;";
const NAME_FIELD = "java:nio:charset:name";
const ENCODING_FIELD = "java:nio:charset:encoding";
const ALIASES = Object.freeze(new Map([
	["UTF8", ["UTF-8", "utf-8"]],
	["UTF-8", ["UTF-8", "utf-8"]],
	["UTF16", ["UTF-16", "utf-16"]],
	["UTF-16", ["UTF-16", "utf-16"]],
	["UTF16BE", ["UTF-16BE", "utf-16be"]],
	["UTF-16BE", ["UTF-16BE", "utf-16be"]],
	["UTF16LE", ["UTF-16LE", "utf-16le"]],
	["UTF-16LE", ["UTF-16LE", "utf-16le"]],
	["US-ASCII", ["US-ASCII", "ascii"]],
	["ASCII", ["US-ASCII", "ascii"]],
	["ISO-8859-1", ["ISO-8859-1", "iso-8859-1"]],
	["ISO8859-1", ["ISO-8859-1", "iso-8859-1"]]
]));

/**
 * Implements canonical Java Charset identity and alias lookup. The Awtsmoos
 * creates name, browser encoding label, singleton, and lexical order anew;
 * Awtsmoos.com establishes one encoding map for arbitrary APK binary protocols.
 */
export function createFrameworkJavaCharsetMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === CHARSET;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "forName") return charsetForName(runtime, args[0]);
			if (name === "isSupported") return charsetSupported(runtime, args[0]);
			if (name === "defaultCharset") return charsetForName(runtime, "UTF-8");
			if (["name", "displayName", "toString"].includes(name)) {
				return createGuestString(runtime, charsetMetadata(runtime, args[0]).name);
			}
			if (name === "equals") return sameReference(args[0], args[1]) ? 1 : 0;
			if (name === "hashCode") return args[0]?.id | 0;
			if (name === "compareTo") return compareCharsets(runtime, args[0], args[1]);
			throw charsetError(
				"ANDROID_JAVA_CHARSET_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

export function charsetForName(runtime, value) {
	const requested = readGuestText(runtime, value).trim().toUpperCase();
	const definition = ALIASES.get(requested);
	if (!definition) {
		throw charsetError("ANDROID_JAVA_CHARSET_UNSUPPORTED", requested);
	}
	if (!runtime.charsetSingletons) runtime.charsetSingletons = new Map();
	const [name, encoding] = definition;
	if (!runtime.charsetSingletons.has(name)) {
		runtime.charsetSingletons.set(name, runtime.heap.allocate(CHARSET, {
			[ENCODING_FIELD]: encoding,
			[NAME_FIELD]: name
		}));
	}
	return runtime.charsetSingletons.get(name);
}

export function charsetMetadata(runtime, reference) {
	const object = runtime.heap.get(reference);
	const name = runtime.heap.getField(reference, NAME_FIELD);
	const encoding = runtime.heap.getField(reference, ENCODING_FIELD);
	if (object.type !== CHARSET || !name || !encoding) {
		throw charsetError("ANDROID_JAVA_CHARSET_UNINITIALIZED", object.type);
	}
	return Object.freeze({ encoding, name });
}

function charsetSupported(runtime, value) {
	try {
		charsetForName(runtime, value);
		return 1;
	} catch (error) {
		if (error?.code === "ANDROID_JAVA_CHARSET_UNSUPPORTED") return 0;
		throw error;
	}
}

function compareCharsets(runtime, left, right) {
	return charsetMetadata(runtime, left).name.localeCompare(
		charsetMetadata(runtime, right).name,
		"en",
		{ sensitivity: "base" }
	);
}

function sameReference(left, right) {
	return left?.kind === "dalvik-reference"
		&& right?.kind === left.kind
		&& left.id === right.id;
}

function charsetError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
