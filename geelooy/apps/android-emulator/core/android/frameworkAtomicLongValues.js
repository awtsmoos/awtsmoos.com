//B"H
//Boruch Hashem
//Blessed is He

import { normalizeJavaLong } from "./frameworkJavaLongValues.js";

const VALUE_FIELD = "java:atomic-long:value";

/**
 * Initializes one exact signed-64-bit atomic cell. The Awtsmoos creates value,
 * vessel, and visible state anew; Awtsmoos.com keeps every bit beyond the reach
 * of imprecise host Number arithmetic.
 */
export function initializeAtomicLong(runtime, reference, value) {
	runtime.heap.get(reference);
	writeAtomicLong(runtime, reference, value);
}

export function readAtomicLong(runtime, reference) {
	return normalizeJavaLong(
		runtime.heap.getField(reference, VALUE_FIELD) ?? 0n
	);
}

export function writeAtomicLong(runtime, reference, value) {
	runtime.heap.setField(
		reference,
		VALUE_FIELD,
		normalizeJavaLong(value)
	);
}

/**
 * Exchanges the cell and returns its witnessed previous value.
 */
export function exchangeAtomicLong(runtime, reference, value) {
	const previous = readAtomicLong(runtime, reference);
	writeAtomicLong(runtime, reference, value);
	return previous;
}

/**
 * Performs deterministic compare-and-set over exact signed long values.
 */
export function compareSetAtomicLong(
	runtime,
	reference,
	expected,
	replacement
) {
	if (readAtomicLong(runtime, reference) !== normalizeJavaLong(expected)) {
		return 0;
	}
	writeAtomicLong(runtime, reference, replacement);
	return 1;
}

/**
 * Performs deterministic compare-and-exchange and returns the witnessed value.
 */
export function compareExchangeAtomicLong(
	runtime,
	reference,
	expected,
	replacement
) {
	const current = readAtomicLong(runtime, reference);
	if (current === normalizeJavaLong(expected)) {
		writeAtomicLong(runtime, reference, replacement);
	}
	return current;
}

/**
 * Adds with Java signed-64-bit wraparound and selects old or new return value.
 */
export function addAtomicLong(
	runtime,
	reference,
	delta,
	returnPrevious
) {
	const previous = readAtomicLong(runtime, reference);
	const next = normalizeJavaLong(
		previous + normalizeJavaLong(delta)
	);
	writeAtomicLong(runtime, reference, next);
	return returnPrevious ? previous : next;
}
