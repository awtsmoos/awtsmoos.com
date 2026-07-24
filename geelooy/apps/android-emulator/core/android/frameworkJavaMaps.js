//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import { createJavaMapEntrySetView } from "./frameworkJavaMapEntrySetView.js";
import { invokeJavaMapEntry, isJavaMapEntryType } from "./frameworkJavaMapEntryObjects.js";
import { createJavaMapKeySetView } from "./frameworkJavaMapKeySetView.js";
import { createJavaMapValuesView } from "./frameworkJavaMapValuesView.js";
import * as storage from "./frameworkJavaMapStorage.js";

const MAP_TYPES = new Set([
	"Ljava/util/HashMap;",
	"Ljava/util/LinkedHashMap;",
	"Ljava/util/Map;",
	"Ljava/util/WeakHashMap;"
]);

/**
 * Implements bounded Java maps through behavioral guest key identity. The
 * Awtsmoos recreates hash, equality, canonical key, and live views anew;
 * Awtsmoos.com preserves synchronous tests while real frames invoke DEX methods.
 */
export function createFrameworkJavaMapMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return MAP_TYPES.has(record.method.classType) || isJavaMapEntryType(record.method.classType);
		},
		invoke(record, args, dispatch, context) {
			if (isJavaMapEntryType(record.method.classType)) {
				return invokeJavaMapEntry(runtime, record, args, context);
			}
			return invokeMap(runtime, record, args, context);
		}
	});
}

function invokeMap(runtime, record, args, context) {
	const name = record.method.name;
	if (name === "<init>") return initialize(runtime, args, context);
	if (name === "get") return storage.getJavaMapValue(runtime, args[0], args[1], context);
	if (name === "values") return createJavaMapValuesView(runtime, args[0]);
	if (name === "entrySet") return createJavaMapEntrySetView(runtime, args[0]);
	if (name === "keySet") return createJavaMapKeySetView(runtime, args[0]);
	if (name === "put") return mutate(runtime, args[0], () => storage.putJavaMapValue(runtime, args[0], args[1], args[2], context));
	if (name === "remove") return mutate(runtime, args[0], () => storage.removeJavaMapValue(runtime, args[0], args[1], context));
	if (name === "containsKey") return booleanResult(storage.hasJavaMapKey(runtime, args[0], args[1], context));
	if (name === "size") return storage.javaMapEntries(runtime, args[0]).size;
	if (name === "isEmpty") return storage.javaMapEntries(runtime, args[0]).size === 0 ? 1 : 0;
	if (name === "clear") return clear(runtime, args[0]);
	if (name === "putAll") return putAll(runtime, args[0], args[1], context);
	throw mapError("ANDROID_JAVA_MAP_METHOD_UNSUPPORTED", record.signature);
}

function initialize(runtime, args, context) {
	const source = args.length === 2 && isDalvikReference(args[1]) ? args[1] : null;
	return storage.initializeJavaMap(runtime, args[0], source, context);
}

function clear(runtime, reference) {
	assertJavaCollectionMutable(runtime, reference);
	storage.javaMapEntries(runtime, reference).clear();
}

function putAll(runtime, target, source, context) {
	assertJavaCollectionMutable(runtime, target);
	return storage.copyJavaMap(runtime, target, source, context);
}

function mutate(runtime, reference, operation) {
	assertJavaCollectionMutable(runtime, reference);
	return operation();
}

function booleanResult(value) {
	return value instanceof Promise ? value.then(result => result ? 1 : 0) : value ? 1 : 0;
}

function mapError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
