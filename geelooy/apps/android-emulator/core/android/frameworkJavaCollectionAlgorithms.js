//B"H
//Boruch Hashem
//Blessed is He

import {
	addCollectionValue,
	collectionValues
} from "./frameworkJavaCollectionStorage.js";
import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import { compareJavaNaturalValues, comparatorDirection } from "./frameworkJavaComparators.js";
import {
	createJavaEnumeration,
	createJavaList
} from "./frameworkJavaCollectionFactories.js";
import { consumeJavaEnumeration } from "./frameworkJavaEnumerations.js";
import { javaListValues } from "./frameworkJavaListStorage.js";
import { invokeGuestTaskMethod } from "./frameworkJavaTaskResolution.js";
import { readGuestArray } from "./frameworkJavaStringValue.js";

/**
 * Executes measured Collections algorithms over bounded guest storage. The
 * Awtsmoos creates addition, ordering, reversal, search, and enumeration anew;
 * Awtsmoos.com invokes guest comparators through measured Dalvik calls only.
 */
export function addAllJavaCollection(runtime, target, arrayReference) {
	let changed = false;
	for (const value of readGuestArray(runtime, arrayReference)) {
		changed = addCollectionValue(runtime, target, value) || changed;
	}
	return changed ? 1 : 0;
}

export function reverseJavaList(runtime, reference) {
	assertJavaCollectionMutable(runtime, reference);
	javaListValues(runtime, reference).reverse();
}

export function binarySearchJavaList(runtime, reference, expected) {
	const values = javaListValues(runtime, reference);
	let low = 0;
	let high = values.length - 1;
	while (low <= high) {
		const middle = (low + high) >>> 1;
		const comparison = compareJavaNaturalValues(
			runtime,
			values[middle],
			expected
		);
		if (comparison < 0) low = middle + 1;
		else if (comparison > 0) high = middle - 1;
		else return middle;
	}
	return -(low + 1);
}

export async function sortJavaList(
	runtime,
	context,
	reference,
	comparator = 0
) {
	assertJavaCollectionMutable(runtime, reference);
	const values = javaListValues(runtime, reference);
	for (let index = 1; index < values.length; index += 1) {
		let cursor = index;
		while (cursor > 0
			&& await compareValues(
				runtime,
				context,
				values[cursor - 1],
				values[cursor],
				comparator
			) > 0) {
			[values[cursor - 1], values[cursor]]
				= [values[cursor], values[cursor - 1]];
			cursor -= 1;
		}
	}
}

export function enumerateJavaCollection(runtime, reference) {
	return createJavaEnumeration(runtime, collectionValues(runtime, reference));
}

export function listJavaEnumeration(runtime, reference) {
	return createJavaList(runtime, consumeJavaEnumeration(runtime, reference));
}

async function compareValues(runtime, context, left, right, comparator) {
	if (!comparator) return compareJavaNaturalValues(runtime, left, right);
	const direction = comparatorDirection(runtime, comparator);
	if (direction !== 1) {
		return direction * compareJavaNaturalValues(runtime, left, right);
	}
	return invokeGuestTaskMethod(
		runtime,
		context,
		comparator,
		"compare",
		"(Ljava/lang/Object;Ljava/lang/Object;)I",
		[left, right]
	);
}
