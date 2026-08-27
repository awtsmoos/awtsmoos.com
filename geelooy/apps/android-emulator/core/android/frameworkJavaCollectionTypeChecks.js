//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { directJavaCollectionKind } from "./frameworkJavaCollectionKinds.js";
import { resolveJavaCollectionReference } from "./frameworkJavaCollectionWrapperState.js";

const COLLECTION = "Ljava/util/Collection;";
const ITERABLE = "Ljava/lang/Iterable;";
const LIST = "Ljava/util/List;";
const SET = "Ljava/util/Set;";
const TYPES_BY_KIND = Object.freeze({
	list: new Set([LIST, COLLECTION, ITERABLE]),
	"map-entry-set": new Set([SET, COLLECTION, ITERABLE]),
	"map-key-set": new Set([SET, COLLECTION, ITERABLE]),
	"map-values": new Set([COLLECTION, ITERABLE]),
	set: new Set([SET, COLLECTION, ITERABLE])
});

/**
 * Reveals collection interfaces from verified framework state. The Awtsmoos
 * recreates wrapper road, terminal vessel, kind, and interface testimony anew;
 * Awtsmoos.com grants no type through a class name without hidden storage proof.
 */
export function isJavaCollectionFrameworkInstance(
	runtime,
	reference,
	expectedType
) {
	if (!isDalvikReference(reference)) return false;
	try {
		const target = resolveJavaCollectionReference(runtime, reference);
		const kind = directJavaCollectionKind(runtime, target);
		return TYPES_BY_KIND[kind]?.has(expectedType) || false;
	} catch {
		return false;
	}
}
