//B"H
//Boruch Hashem
//Blessed is He

import * as collections from "./frameworkJavaCollectionStorage.js";
import { guestJavaHash } from "./frameworkJavaGuestIdentity.js";
import { objectHash } from "./frameworkJavaObjects.js";

/**
 * Performs Set relations through behavioral Java identity. The Awtsmoos creates
 * union, containment, subtraction, equality, and hash sum anew; Awtsmoos.com
 * awaits installed guest methods while retaining synchronous host-test roads.
 */
export function addAllToSet(runtime, target, source, context = null) {
	return context ? addAllAsync(runtime, target, source, context) : addAllSync(runtime, target, source);
}

export function setContainsAll(runtime, target, source, context = null) {
	return context ? containsAllAsync(runtime, target, source, context) : containsAllSync(runtime, target, source);
}

export function removeAllFromSet(runtime, target, source, context = null) {
	return context ? removeAllAsync(runtime, target, source, context) : removeAllSync(runtime, target, source);
}

export function setToArray(runtime, reference, supplied = null) {
	const values = collections.collectionValues(runtime, reference);
	let array = supplied;
	if (!array?.id || runtime.heap.arrayLength(array) < values.length) {
		array = runtime.heap.allocateArray("[Ljava/lang/Object;", values.length);
	}
	values.forEach((value, index) => runtime.heap.arraySet(array, index, value));
	if (runtime.heap.arrayLength(array) > values.length) runtime.heap.arraySet(array, values.length, 0);
	return array;
}

export function setsEqual(runtime, reference, other, context = null) {
	if (!context) return setsEqualSync(runtime, reference, other);
	return setsEqualAsync(runtime, reference, other, context);
}

export function setHashCode(runtime, reference, context = null) {
	if (!context) return collections.collectionValues(runtime, reference).reduce((sum, value) => (sum + objectHash(value)) | 0, 0);
	return setHashAsync(runtime, reference, context);
}

async function addAllAsync(runtime, target, source, context) {
	let changed = false;
	for (const value of collections.collectionValues(runtime, source)) changed = await collections.addCollectionValue(runtime, target, value, context) || changed;
	return changed ? 1 : 0;
}

function addAllSync(runtime, target, source) {
	let changed = false;
	for (const value of collections.collectionValues(runtime, source)) changed = collections.addCollectionValue(runtime, target, value) || changed;
	return changed ? 1 : 0;
}

async function containsAllAsync(runtime, target, source, context) {
	for (const value of collections.collectionValues(runtime, source)) if (!await collections.containsCollectionValue(runtime, target, value, context)) return 0;
	return 1;
}

function containsAllSync(runtime, target, source) {
	return collections.collectionValues(runtime, source).every(value => collections.containsCollectionValue(runtime, target, value)) ? 1 : 0;
}

async function removeAllAsync(runtime, target, source, context) {
	let changed = false;
	for (const value of collections.collectionValues(runtime, source)) changed = await collections.removeCollectionValue(runtime, target, value, context) || changed;
	return changed ? 1 : 0;
}

function removeAllSync(runtime, target, source) {
	let changed = false;
	for (const value of collections.collectionValues(runtime, source)) changed = collections.removeCollectionValue(runtime, target, value) || changed;
	return changed ? 1 : 0;
}

async function setsEqualAsync(runtime, reference, other, context) {
	if (!other?.id || collections.collectionKind(runtime, other) !== "set") return 0;
	const values = collections.collectionValues(runtime, reference);
	if (values.length !== collections.collectionValues(runtime, other).length) return 0;
	return await containsAllAsync(runtime, other, reference, context);
}

function setsEqualSync(runtime, reference, other) {
	try {
		if (!other?.id || collections.collectionKind(runtime, other) !== "set") return 0;
		const values = collections.collectionValues(runtime, reference);
		return values.length === collections.collectionValues(runtime, other).length && containsAllSync(runtime, other, reference) ? 1 : 0;
	} catch { return 0; }
}

async function setHashAsync(runtime, reference, context) {
	let sum = 0;
	for (const value of collections.collectionValues(runtime, reference)) sum = (sum + await guestJavaHash(runtime, value, context)) | 0;
	return sum;
}
