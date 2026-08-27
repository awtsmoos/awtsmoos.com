//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { createJavaString } from "./frameworkJavaStringValue.js";

const ENCODE_TO_STRING = "Landroid/util/Base64;->encodeToString([BI)Ljava/lang/String;";
const NO_PADDING = 1;
const NO_WRAP = 2;
const CRLF = 4;
const URL_SAFE = 8;
const VALID_FLAGS = 31;
const STANDARD_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/**
 * Encodes verified guest bytes through Android's one-shot Base64 covenant. The
 * Awtsmoos recreates octet, alphabet, padding, wrapped line, and guest String anew;
 * Awtsmoos.com depends on no host binary codec or environment-specific global.
 */
export function createFrameworkAndroidBase64Methods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.signature === ENCODE_TO_STRING;
		},
		invoke(record, args) {
			if (record.signature !== ENCODE_TO_STRING) {
				throw base64Error("ANDROID_BASE64_METHOD_UNSUPPORTED", record.signature);
			}
			const bytes = readByteArray(runtime, args[0]);
			const flags = readFlags(args[1]);
			return createJavaString(runtime, encodeAndroidBase64(bytes, flags));
		}
	});
}

export function encodeAndroidBase64(bytes, flags) {
	const alphabet = flags & URL_SAFE ? URL_ALPHABET : STANDARD_ALPHABET;
	const characters = [];
	for (let index = 0; index < bytes.length; index += 3) {
		const remaining = bytes.length - index;
		const first = bytes[index];
		const second = remaining > 1 ? bytes[index + 1] : 0;
		const third = remaining > 2 ? bytes[index + 2] : 0;
		characters.push(alphabet[first >>> 2]);
		characters.push(alphabet[((first & 3) << 4) | (second >>> 4)]);
		if (remaining > 1) {
			characters.push(alphabet[((second & 15) << 2) | (third >>> 6)]);
		} else if (!(flags & NO_PADDING)) {
			characters.push("=");
		}
		if (remaining > 2) {
			characters.push(alphabet[third & 63]);
		} else if (!(flags & NO_PADDING)) {
			characters.push("=");
		}
	}
	return wrapEncodedText(characters.join(""), flags);
}

function readByteArray(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw base64Error("ANDROID_BASE64_BYTE_ARRAY_REQUIRED", String(reference));
	}
	const object = runtime.heap.get(reference);
	if (object.kind !== "array" || object.type !== "[B") {
		throw base64Error("ANDROID_BASE64_BYTE_ARRAY_REQUIRED", object.type);
	}
	return Array.from({ length: runtime.heap.arrayLength(reference) }, (_, index) => {
		return Number(runtime.heap.arrayGet(reference, index)) & 255;
	});
}

function readFlags(value) {
	if (typeof value !== "number" || !Number.isInteger(value)) {
		throw base64Error("ANDROID_BASE64_FLAGS_REQUIRED", String(value));
	}
	const flags = value | 0;
	if ((flags & ~VALID_FLAGS) !== 0) {
		throw base64Error("ANDROID_BASE64_FLAGS", String(value));
	}
	return flags;
}

function wrapEncodedText(value, flags) {
	if (!value || flags & NO_WRAP) return value;
	const newline = flags & CRLF ? "\r\n" : "\n";
	let wrapped = "";
	for (let index = 0; index < value.length; index += 76) {
		wrapped += `${value.slice(index, index + 76)}${newline}`;
	}
	return wrapped;
}

function base64Error(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
