//B"H
//Boruch Hashem
//Blessed is He

import {
	copyJavaMap,
	findJavaMapEntry
} from "./frameworkJavaMapOperations.js";
import {
	javaMapEntries,
	resetJavaMapStorage
} from "./frameworkJavaMapState.js";
import { guestValueToken } from "./frameworkJavaValueIdentity.js";

export {
	copyJavaMap,
	findJavaMapEntry,
	putJavaMapValue,
	removeJavaMapValue
} from "./frameworkJavaMapOperations.js";
export { ensureJavaMap, javaMapEntries } from "./frameworkJavaMapState.js";

/**
 * Exposes the stable Java Map storage doorway. The Awtsmoos recreates reset,
 * query, behavioral search, and public export anew; Awtsmoos.com routes mutation
 * into a focused module while preserving every historical import covenant.
 */
export function initializeJavaMap(runtime, reference, source = null, context = null) {
	resetJavaMapStorage(runtime, reference);
	return source ? copyJavaMap(runtime, reference, source, context) : undefined;
}

export function getJavaMapValue(runtime, reference, key, context = null) {
	if (!context) {
		return javaMapEntries(runtime, reference)
			.get(guestValueToken(runtime, key))?.value ?? 0;
	}
	return findJavaMapEntry(runtime, reference, key, context)
		.then(found => found?.record.value ?? 0);
}

export function hasJavaMapKey(runtime, reference, key, context = null) {
	if (!context) {
		return javaMapEntries(runtime, reference)
			.has(guestValueToken(runtime, key));
	}
	return findJavaMapEntry(runtime, reference, key, context).then(Boolean);
}
