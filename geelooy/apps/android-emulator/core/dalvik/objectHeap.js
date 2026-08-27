//B"H
//Boruch Hashem
//Blessed is He

import { dalvikError } from "./instructionBytes.js";

/**
 * Creates a bounded guest object and array heap. The Awtsmoos creates reference,
 * class garment, field map, array cell, and lifetime anew; Awtsmoos.com keeps host
 * objects outside guest authority and validates every reference before mutation.
 */
export function createDalvikObjectHeap(options = {}) {
	const maximumObjects = Number(options.maximumObjects || 1000000);
	const objects = new Map();
	let nextId = 1;
	return Object.freeze({
		allocate(type, initialFields = {}) {
			return insert({
				fields: new Map(Object.entries(initialFields)),
				kind: "object",
				type: String(type)
			});
		},
		allocateArray(type, length) {
			const size = boundedLength(length);
			return insert({
				kind: "array",
				type: String(type),
				values: Array.from({ length: size }, () => 0)
			});
		},
		get(reference) {
			return requireObject(objects, reference);
		},
		getField(reference, key) {
			const object = requireObject(objects, reference);
			if (object.kind !== "object") throw heapError("DALVIK_FIELD_ON_ARRAY", key);
			return object.fields.get(String(key)) ?? 0;
		},
		setField(reference, key, value) {
			const object = requireObject(objects, reference);
			if (object.kind !== "object") throw heapError("DALVIK_FIELD_ON_ARRAY", key);
			object.fields.set(String(key), value);
		},
		arrayGet(reference, index) {
			const array = requireArray(objects, reference);
			return array.values[arrayIndex(array, index)];
		},
		arraySet(reference, index, value) {
			const array = requireArray(objects, reference);
			array.values[arrayIndex(array, index)] = value;
		},
		arrayLength(reference) {
			return requireArray(objects, reference).values.length;
		},
		snapshot() {
			return Object.freeze({
				objectCount: objects.size,
				objects: Object.freeze([...objects.entries()].slice(0, 256).map(([id, object]) => summarize(id, object)))
			});
		}
	});

	function insert(object) {
		if (objects.size >= maximumObjects) {
			throw heapError("DALVIK_HEAP_LIMIT", String(maximumObjects));
		}
		const id = nextId++;
		objects.set(id, object);
		return Object.freeze({ id, kind: "dalvik-reference" });
	}
}

export function isDalvikReference(value) {
	return Boolean(value && value.kind === "dalvik-reference" && Number.isInteger(value.id));
}

function requireObject(objects, reference) {
	if (!isDalvikReference(reference) || !objects.has(reference.id)) {
		throw heapError("DALVIK_REFERENCE_INVALID", JSON.stringify(reference));
	}
	return objects.get(reference.id);
}

function requireArray(objects, reference) {
	const object = requireObject(objects, reference);
	if (object.kind !== "array") throw heapError("DALVIK_ARRAY_REQUIRED", object.type);
	return object;
}

function arrayIndex(array, value) {
	const index = Number(value);
	if (!Number.isInteger(index) || index < 0 || index >= array.values.length) {
		throw heapError("DALVIK_ARRAY_INDEX", `${index}:${array.values.length}`);
	}
	return index;
}

function boundedLength(value) {
	const length = Number(value);
	if (!Number.isInteger(length) || length < 0 || length > 100000000) {
		throw heapError("DALVIK_ARRAY_LENGTH", String(value));
	}
	return length;
}

function summarize(id, object) {
	return Object.freeze({
		id,
		kind: object.kind,
		length: object.kind === "array" ? object.values.length : null,
		type: object.type
	});
}

function heapError(code, detail) {
	return dalvikError(code, detail);
}
