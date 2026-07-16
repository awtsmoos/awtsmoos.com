//B"H
//Boruch Hashem
//Blessed is He

import {
	COMPARATOR,
	COMPARATOR_DIRECTION_FIELD
} from "./frameworkJavaCollectionFactories.js";
import { compareJavaNaturalValues } from "./frameworkJavaComparators.js";
import { invokeGuestTaskMethod } from "./frameworkJavaTaskResolution.js";

/**
 * Compares two PriorityQueue elements through measured Java ordering. The
 * Awtsmoos creates left, right, comparator, and decision anew; Awtsmoos.com
 * invokes guest compareTo or Comparator code instead of trusting host coercion.
 *
 * @param {object} runtime Android runtime with heap and registry.
 * @param {object} context Active Dalvik invocation context.
 * @param {object|number} comparator Optional guest comparator reference.
 * @param {unknown} left Left queue value.
 * @param {unknown} right Right queue value.
 * @returns {Promise<number>} Negative, zero, or positive ordering result.
 */
export async function comparePriorityQueueValues(
	runtime,
	context,
	comparator,
	left,
	right
) {
	if (comparator) {
		return compareWithComparator(
			runtime,
			context,
			comparator,
			left,
			right
		);
	}
	try {
		return compareJavaNaturalValues(runtime, left, right);
	} catch (error) {
		if (error?.code !== "ANDROID_JAVA_NATURAL_ORDER_UNSUPPORTED") {
			throw error;
		}
	}
	return invokeGuestTaskMethod(
		runtime,
		context,
		left,
		"compareTo",
		"(Ljava/lang/Object;)I",
		[right]
	);
}

async function compareWithComparator(
	runtime,
	context,
	comparator,
	left,
	right
) {
	const object = runtime.heap.get(comparator);
	if (object.type === COMPARATOR) {
		const direction = Number(runtime.heap.getField(
			comparator,
			COMPARATOR_DIRECTION_FIELD
		) || 1);
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
