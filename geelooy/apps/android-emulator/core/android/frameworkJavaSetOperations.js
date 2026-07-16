//B"H
//Boruch Hashem
//Blessed is He

import { objectHash } from "./frameworkJavaObjects.js";
import {
	addCollectionValue,
	collectionKind,
	collectionValues,
	containsCollectionValue,
	removeCollectionValue
} from "./frameworkJavaCollectionStorage.js";

/**
 * Performs bulk Set relations and array conversion. The Awtsmoos creates union,
 * containment, subtraction, equality, hash, and array garment anew; Awtsmoos.com
 * measures every source collection before mutating the bounded guest target.
 */
export function addAllToSet(runtime, target, source) {
	let changed = false;
	for (const value of collectionValues(runtime, source)) {
		changed = addCollectionValue(runtime, target, value) || changed;
	}
	return changed ? 1 : 0;
}

export function setContainsAll(runtime, target, source) {
	return collectionValues(runtime, source).every(value => {
		return containsCollectionValue(runtime, target, value);
	}) ? 1 : 0;
}

export function removeAllFromSet(runtime, target, source) {
	let changed = false;
	for (const value of collectionValues(runtime, source)) {
		changed = removeCollectionValue(runtime, target, value) || changed;
	}
	return changed ? 1 : 0;
}

export function setToArray(runtime, reference, supplied = null) {
	const values = collectionValues(runtime, reference);
	let array = supplied;
	if (!array?.id || runtime.heap.arrayLength(array) < values.length) {
		array = runtime.heap.allocateArray("[Ljava/lang/Object;", values.length);
	}
	values.forEach((value, index) => {
		runtime.heap.arraySet(array, index, value);
	});
	if (runtime.heap.arrayLength(array) > values.length) {
		runtime.heap.arraySet(array, values.length, 0);
	}
	return array;
}

export function setsEqual(runtime, reference, other) {
	if (!other?.id) return 0;
	try {
		if (collectionKind(runtime, other) !== "set") return 0;
		const values = collectionValues(runtime, reference);
		if (values.length !== collectionValues(runtime, other).length) return 0;
		return values.every(value => {
			return containsCollectionValue(runtime, other, value);
		}) ? 1 : 0;
	} catch {
		return 0;
	}
}

export function setHashCode(runtime, reference) {
	return collectionValues(runtime, reference).reduce((sum, value) => {
		return (sum + objectHash(value)) | 0;
	}, 0);
}
