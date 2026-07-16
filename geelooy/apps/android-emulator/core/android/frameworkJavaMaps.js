//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

const MAP_FIELD = "java:map:entries";
const MAP_TYPES = Object.freeze([
	"Ljava/util/HashMap;",
	"Ljava/util/LinkedHashMap;",
	"Ljava/util/WeakHashMap;"
]);
const MAP_INTERFACE = "Ljava/util/Map;";

/**
 * Implements bounded guest Java maps for lifecycle and framework bookkeeping. The
 * Awtsmoos creates key, value, replacement, and removal anew; Awtsmoos.com keeps
 * String equality and object identity explicit while guest garbage collection sleeps.
 */
export function createFrameworkJavaMapMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return MAP_TYPES.includes(record.method.classType)
				|| record.method.classType === MAP_INTERFACE;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") return initialize(runtime, args);
			if (name === "get") return getValue(runtime, args[0], args[1]);
			if (name === "put") return putValue(runtime, args[0], args[1], args[2]);
			if (name === "remove") return removeValue(runtime, args[0], args[1]);
			if (name === "containsKey") return hasKey(runtime, args[0], args[1]) ? 1 : 0;
			if (name === "size") return entries(runtime, args[0]).size;
			if (name === "isEmpty") return entries(runtime, args[0]).size === 0 ? 1 : 0;
			if (name === "clear") {
				entries(runtime, args[0]).clear();
				return undefined;
			}
			if (name === "putAll") return putAll(runtime, args[0], args[1]);
			throw mapError("ANDROID_JAVA_MAP_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function initialize(runtime, args) {
	runtime.heap.get(args[0]);
	runtime.heap.setField(args[0], MAP_FIELD, new Map());
	if (args.length === 2 && isDalvikReference(args[1])) putAll(runtime, args[0], args[1]);
	return undefined;
}

function entries(runtime, reference) {
	const value = runtime.heap.getField(reference, MAP_FIELD);
	if (!(value instanceof Map)) throw mapError("ANDROID_JAVA_MAP_UNINITIALIZED");
	return value;
}

function getValue(runtime, reference, key) {
	return entries(runtime, reference).get(keyToken(runtime, key))?.value ?? 0;
}

function putValue(runtime, reference, key, value) {
	const map = entries(runtime, reference);
	const token = keyToken(runtime, key);
	const previous = map.get(token)?.value ?? 0;
	map.set(token, Object.freeze({ key, value: value ?? 0 }));
	return previous;
}

function removeValue(runtime, reference, key) {
	const map = entries(runtime, reference);
	const token = keyToken(runtime, key);
	const previous = map.get(token)?.value ?? 0;
	map.delete(token);
	return previous;
}

function hasKey(runtime, reference, key) {
	return entries(runtime, reference).has(keyToken(runtime, key));
}

function putAll(runtime, target, source) {
	for (const record of entries(runtime, source).values()) {
		putValue(runtime, target, record.key, record.value);
	}
	return undefined;
}

function keyToken(runtime, key) {
	if (!isDalvikReference(key)) return `${typeof key}:${String(key ?? 0)}`;
	const object = runtime.heap.get(key);
	if (object.type === "Ljava/lang/String;") {
		return `string:${runtime.heap.getField(key, "java:string") || ""}`;
	}
	return `reference:${key.id}`;
}

function mapError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
