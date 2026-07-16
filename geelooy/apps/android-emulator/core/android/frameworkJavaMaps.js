//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
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
 * Implements bounded guest Java maps for lifecycle and framework bookkeeping. The
 * Awtsmoos creates key, value, replacement, and removal anew; Awtsmoos.com keeps
 * map storage opaque and protects immutable snapshots before every mutation.
 */
export function createFrameworkJavaMapMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return MAP_TYPES.has(record.method.classType);
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") return initialize(runtime, args);
			if (name === "get") return getJavaMapValue(runtime, args[0], args[1]);
			if (name === "put") {
				assertJavaCollectionMutable(runtime, args[0]);
				return putJavaMapValue(runtime, args[0], args[1], args[2]);
			}
			if (name === "remove") {
				assertJavaCollectionMutable(runtime, args[0]);
				return removeJavaMapValue(runtime, args[0], args[1]);
			}
			if (name === "containsKey") return hasJavaMapKey(runtime, args[0], args[1]) ? 1 : 0;
			if (name === "size") return javaMapEntries(runtime, args[0]).size;
			if (name === "isEmpty") return javaMapEntries(runtime, args[0]).size === 0 ? 1 : 0;
			if (name === "clear") {
				assertJavaCollectionMutable(runtime, args[0]);
				javaMapEntries(runtime, args[0]).clear();
				return undefined;
			}
			if (name === "putAll") {
				assertJavaCollectionMutable(runtime, args[0]);
				copyJavaMap(runtime, args[0], args[1]);
				return undefined;
			}
			throw mapError("ANDROID_JAVA_MAP_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function initialize(runtime, args) {
	const source = args.length === 2 && isDalvikReference(args[1]) ? args[1] : null;
	initializeJavaMap(runtime, args[0], source);
}

function mapError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
