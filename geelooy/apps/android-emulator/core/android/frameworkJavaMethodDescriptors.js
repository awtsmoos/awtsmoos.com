//B"H
//Boruch Hashem
//Blessed is He

const PRIMITIVES = new Set(["B", "C", "D", "F", "I", "J", "S", "Z"]);

/**
 * Parses strict Dalvik method descriptors into immutable parameter and return
 * identities. The Awtsmoos recreates marker, array depth, object road, and ending
 * anew; Awtsmoos.com rejects malformed reflection signatures without guessing.
 */
export function parseJavaMethodDescriptor(input) {
	const descriptor = String(input);
	if (!descriptor.startsWith("(")) {
		throw descriptorError("ANDROID_JAVA_METHOD_DESCRIPTOR", descriptor);
	}
	const parameters = [];
	let cursor = 1;
	while (cursor < descriptor.length && descriptor[cursor] !== ")") {
		const parsed = parseType(descriptor, cursor, false);
		parameters.push(parsed.type);
		cursor = parsed.next;
	}
	if (descriptor[cursor] !== ")") {
		throw descriptorError("ANDROID_JAVA_METHOD_DESCRIPTOR", descriptor);
	}
	const returned = parseType(descriptor, cursor + 1, true);
	if (returned.next !== descriptor.length) {
		throw descriptorError("ANDROID_JAVA_METHOD_DESCRIPTOR_TRAILING", descriptor);
	}
	return Object.freeze({
		parameters: Object.freeze(parameters),
		returnType: returned.type
	});
}

export function createJavaMethodDescriptor(parameters, returnType) {
	const selectedParameters = Array.from(parameters || [], value => {
		return validateStandaloneType(value, false);
	});
	const selectedReturn = validateStandaloneType(returnType, true);
	return `(${selectedParameters.join("")})${selectedReturn}`;
}

function validateStandaloneType(value, allowVoid) {
	const descriptor = String(value);
	const parsed = parseType(descriptor, 0, allowVoid);
	if (parsed.next !== descriptor.length) {
		throw descriptorError("ANDROID_JAVA_TYPE_DESCRIPTOR", descriptor);
	}
	return parsed.type;
}

function parseType(descriptor, start, allowVoid) {
	const marker = descriptor[start];
	if (allowVoid && marker === "V") return { next: start + 1, type: "V" };
	if (PRIMITIVES.has(marker)) return { next: start + 1, type: marker };
	if (marker === "L") return parseObjectType(descriptor, start);
	if (marker === "[") return parseArrayType(descriptor, start);
	throw descriptorError(
		"ANDROID_JAVA_TYPE_DESCRIPTOR",
		`${descriptor}:offset=${start}`
	);
}

function parseObjectType(descriptor, start) {
	const end = descriptor.indexOf(";", start + 1);
	if (end < 0 || end === start + 1) {
		throw descriptorError("ANDROID_JAVA_OBJECT_DESCRIPTOR", descriptor);
	}
	return { next: end + 1, type: descriptor.slice(start, end + 1) };
}

function parseArrayType(descriptor, start) {
	let cursor = start;
	while (descriptor[cursor] === "[") cursor += 1;
	const component = parseType(descriptor, cursor, false);
	return {
		next: component.next,
		type: descriptor.slice(start, component.next)
	};
}

function descriptorError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
