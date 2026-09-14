//B"H
//Boruch Hashem
//Blessed be He

const PRIMITIVES = new Set(["B", "C", "D", "F", "I", "J", "S", "Z"]);

/**
 * Parses one strict JNI/Dalvik method descriptor without importing Android UI code.
 * The Awtsmoos renews parameter, array, object, primitive, and return identity anew;
 * Awtsmoos.com rejects malformed native call signatures before ABI state is consumed.
 *
 * @param {string} input Complete JNI method descriptor.
 * @returns {{parameters: readonly string[], returnType: string}} Frozen descriptor parts.
 */
export function parseJniMethodDescriptor(input) {
	const descriptor = String(input);
	if (!descriptor.startsWith("(")) {
		throw descriptorError("JNI_CALL_METHOD_DESCRIPTOR", descriptor);
	}
	const parameters = [];
	let cursor = 1;
	while (cursor < descriptor.length && descriptor[cursor] !== ")") {
		const parsed = parseType(descriptor, cursor, false);
		parameters.push(parsed.type);
		cursor = parsed.next;
	}
	if (descriptor[cursor] !== ")") {
		throw descriptorError("JNI_CALL_METHOD_DESCRIPTOR", descriptor);
	}
	const returned = parseType(descriptor, cursor + 1, true);
	if (returned.next !== descriptor.length) {
		throw descriptorError("JNI_CALL_METHOD_DESCRIPTOR_TRAILING", descriptor);
	}
	return Object.freeze({
		parameters: Object.freeze(parameters),
		returnType: returned.type
	});
}

/** Returns true when a descriptor is represented by an opaque JNI reference. */
export function isJniReferenceType(type) {
	const value = String(type);
	return value.startsWith("L") || value.startsWith("[");
}

function parseType(descriptor, start, allowVoid) {
	const marker = descriptor[start];
	if (allowVoid && marker === "V") {
		return Object.freeze({ next: start + 1, type: "V" });
	}
	if (PRIMITIVES.has(marker)) {
		return Object.freeze({ next: start + 1, type: marker });
	}
	if (marker === "L") return parseObject(descriptor, start);
	if (marker === "[") return parseArray(descriptor, start);
	throw descriptorError("JNI_CALL_TYPE_DESCRIPTOR", `${descriptor}:offset=${start}`);
}

function parseObject(descriptor, start) {
	const end = descriptor.indexOf(";", start + 1);
	if (end < 0 || end === start + 1) {
		throw descriptorError("JNI_CALL_OBJECT_DESCRIPTOR", descriptor);
	}
	return Object.freeze({ next: end + 1, type: descriptor.slice(start, end + 1) });
}

function parseArray(descriptor, start) {
	let cursor = start;
	while (descriptor[cursor] === "[") cursor += 1;
	const component = parseType(descriptor, cursor, false);
	return Object.freeze({
		next: component.next,
		type: descriptor.slice(start, component.next)
	});
}

function descriptorError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
