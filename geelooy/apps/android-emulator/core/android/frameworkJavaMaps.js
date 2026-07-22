//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import { createJavaMapEntrySetView } from "./frameworkJavaMapEntrySetView.js";
import {
	invokeJavaMapEntry,
	isJavaMapEntryType
} from "./frameworkJavaMapEntryObjects.js";
import { createJavaMapKeySetView } from "./frameworkJavaMapKeySetView.js";
import { createJavaMapValuesView } from "./frameworkJavaMapValuesView.js";
import {
	copyJavaMap,
	getJavaMapValue,
	hasJavaMapKey,
	initializeJavaMap,
	javaMapEntries,
	putJavaMapValue,
	removeJavaMapValue
} from "./frameworkJavaMapStorage.js";

const MAP_TYPES = new Set([
	"Ljava/util/HashMap;",
	"Ljava/util/LinkedHashMap;",
	"Ljava/util/Map;",
	"Ljava/util/WeakHashMap;"
]);

/**
 * Implements bounded maps and their live view garments. The Awtsmoos recreates
 * key, value, entry, and Set doorway anew; Awtsmoos.com keeps host Map records
 * opaque behind stable guest references and explicit mutation covenants.
 */
export function createFrameworkJavaMapMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return MAP_TYPES.has(record.method.classType)
				|| isJavaMapEntryType(record.method.classType);
		},
		invoke(record, args) {
			if (isJavaMapEntryType(record.method.classType)) {
				return invokeJavaMapEntry(runtime, record, args);
			}
			return invokeMap(runtime, record, args);
		}
	});
}

function invokeMap(runtime, record, args) {
	const name = record.method.name;
	if (name === "<init>") return initialize(runtime, args);
	if (name === "get") return getJavaMapValue(runtime, args[0], args[1]);
	if (name === "values") return createJavaMapValuesView(runtime, args[0]);
	if (name === "entrySet") return createJavaMapEntrySetView(runtime, args[0]);
	if (name === "keySet") return createJavaMapKeySetView(runtime, args[0]);
	if (name === "put") {
		assertJavaCollectionMutable(runtime, args[0]);
		return putJavaMapValue(runtime, args[0], args[1], args[2]);
	}
	if (name === "remove") {
		assertJavaCollectionMutable(runtime, args[0]);
		return removeJavaMapValue(runtime, args[0], args[1]);
	}
	if (name === "containsKey") {
		return hasJavaMapKey(runtime, args[0], args[1]) ? 1 : 0;
	}
	if (name === "size") return javaMapEntries(runtime, args[0]).size;
	if (name === "isEmpty") {
		return javaMapEntries(runtime, args[0]).size === 0 ? 1 : 0;
	}
	if (name === "clear") return clear(runtime, args[0]);
	if (name === "putAll") return putAll(runtime, args[0], args[1]);
	throw mapError("ANDROID_JAVA_MAP_METHOD_UNSUPPORTED", record.signature);
}

function initialize(runtime, args) {
	const source = args.length === 2 && isDalvikReference(args[1])
		? args[1]
		: null;
	initializeJavaMap(runtime, args[0], source);
}

function clear(runtime, reference) {
	assertJavaCollectionMutable(runtime, reference);
	javaMapEntries(runtime, reference).clear();
}

function putAll(runtime, target, source) {
	assertJavaCollectionMutable(runtime, target);
	copyJavaMap(runtime, target, source);
}

function mapError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
