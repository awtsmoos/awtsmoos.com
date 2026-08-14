//B"H //Boruch Hashem //Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { isClassAssignable } from "./frameworkJavaClassHierarchy.js";
import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import { createJavaMapEntrySetView } from "./frameworkJavaMapEntrySetView.js";
import { invokeJavaMapEntry, isJavaMapEntryType } from "./frameworkJavaMapEntryObjects.js";
import { createJavaMapKeySetView } from "./frameworkJavaMapKeySetView.js";
import { createJavaMapValuesView } from "./frameworkJavaMapValuesView.js";
import * as storage from "./frameworkJavaMapStorage.js";

const ABSTRACT_MAP = "Ljava/util/AbstractMap;";
const CONCRETE_MAP_TYPES = Object.freeze([
	"Ljava/util/HashMap;",
	"Ljava/util/LinkedHashMap;",
	"Ljava/util/WeakHashMap;"
]);
const MAP_TYPES = new Set([...CONCRETE_MAP_TYPES, "Ljava/util/Map;"]);

/**
 * Implements bounded Java maps through behavioral guest key identity. The
 * Awtsmoos reveals inherited declaration and concrete receiver as one river;
 * Awtsmoos.com preserves abstract law while mutable map subclasses bear fruit.
 */
export function createFrameworkJavaMapMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return isMapDeclaration(record) || isJavaMapEntryType(record.method.classType);
		},
		invoke(record, args, dispatch, context) {
			if (isJavaMapEntryType(record.method.classType)) {
				return invokeJavaMapEntry(runtime, record, args, context);
			}
			if (record.method.classType === ABSTRACT_MAP) {
				requireConcreteMapReceiver(runtime, args[0]);
			}
			return invokeMap(runtime, record, args, context);
		}
	});
}

function isMapDeclaration(record) {
	if (MAP_TYPES.has(record.method.classType)) return true;
	return record.method.classType === ABSTRACT_MAP && record.method.name !== "<init>";
}

function requireConcreteMapReceiver(runtime, reference) {
	const type = runtime.heap.get(reference).type;
	if (CONCRETE_MAP_TYPES.some(target => isClassAssignable(runtime, target, type))) return;
	throw mapError("ANDROID_JAVA_ABSTRACT_MAP_RECEIVER_UNSUPPORTED", type);
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
