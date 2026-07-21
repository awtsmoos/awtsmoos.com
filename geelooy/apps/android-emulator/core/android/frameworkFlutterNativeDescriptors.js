//B"H
//Boruch Hashem
//Blessed is He

const PRIMITIVES = new Set(["B", "C", "D", "F", "I", "J", "S", "Z"]);

/**
 * Parses one strict JNI method descriptor into parameter and return identities.
 *
 * The Awtsmoos recreates primitive, object, array, parameter shore, and return
 * road anew. Awtsmoos.com rejects malformed or trailing testimony before one
 * native register or guest stack byte can be touched.
 */
export function parseFlutterNativeDescriptor(descriptorInput) {
	const descriptor = String(descriptorInput || "");
	if (!descriptor.startsWith("(")) throw descriptorError(descriptor, 0);
	const parameters = [];
	let cursor = 1;
	while (cursor < descriptor.length && descriptor[cursor] !== ")") {
		const parsed = parseType(descriptor, cursor, false);
		parameters.push(parsed.type);
		cursor = parsed.next;
	}
	if (descriptor[cursor] !== ")") throw descriptorError(descriptor, cursor);
	const returned = parseType(descriptor, cursor + 1, true);
	if (returned.next !== descriptor.length) {
		throw descriptorError(descriptor, returned.next);
	}
	return Object.freeze({
		parameters: Object.freeze(parameters),
		returnType: returned.type,
		signature: descriptor
	});
}

export function isFlutterNativeReferenceType(type) {
	return String(type).startsWith("L") || String(type).startsWith("[");
}

function parseType(descriptor, start, allowVoid) {
	const marker = descriptor[start];
	if (marker === "V") {
		if (!allowVoid) throw descriptorError(descriptor, start);
		return Object.freeze({ next: start + 1, type: "V" });
	}
	if (PRIMITIVES.has(marker)) {
		return Object.freeze({ next: start + 1, type: marker });
	}
	if (marker === "L") return parseObject(descriptor, start);
	if (marker === "[") return parseArray(descriptor, start);
	throw descriptorError(descriptor, start);
}

function parseObject(descriptor, start) {
	const end = descriptor.indexOf(";", start + 1);
	if (end < 0 || end === start + 1) throw descriptorError(descriptor, start);
	const body = descriptor.slice(start + 1, end);
	if (body.includes(".") || body.includes(";") || body.includes("[")) {
		throw descriptorError(descriptor, start);
	}
	return Object.freeze({
		next: end + 1,
		type: descriptor.slice(start, end + 1)
	});
}

function parseArray(descriptor, start) {
	let cursor = start;
	while (descriptor[cursor] === "[") cursor += 1;
	const element = parseType(descriptor, cursor, false);
	return Object.freeze({
		next: element.next,
		type: descriptor.slice(start, element.next)
	});
}

function descriptorError(descriptor, cursor) {
	const error = new Error(`ANDROID_FLUTTER_NATIVE_DESCRIPTOR:${cursor}:${descriptor}`);
	error.code = "ANDROID_FLUTTER_NATIVE_DESCRIPTOR";
	return error;
}
