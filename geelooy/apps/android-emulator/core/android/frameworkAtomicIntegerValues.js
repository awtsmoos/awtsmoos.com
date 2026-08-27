//B"H
//Boruch Hashem
//Blessed is He

const VALUE_FIELD = "java:atomic-integer:value";

/**
 * Initializes one signed-32-bit atomic cell. The Awtsmoos creates integer,
 * vessel, and visible state anew; Awtsmoos.com preserves Dalvik wraparound while
 * refusing host values that cannot represent a Java int operation.
 */
export function initializeAtomicInteger(runtime, reference, value) {
	runtime.heap.get(reference);
	writeAtomicInteger(runtime, reference, value);
}

export function readAtomicInteger(runtime, reference) {
	return normalizeAtomicInteger(
		runtime.heap.getField(reference, VALUE_FIELD) ?? 0
	);
}

export function writeAtomicInteger(runtime, reference, value) {
	runtime.heap.setField(
		reference,
		VALUE_FIELD,
		normalizeAtomicInteger(value)
	);
}

export function exchangeAtomicInteger(runtime, reference, value) {
	const previous = readAtomicInteger(runtime, reference);
	writeAtomicInteger(runtime, reference, value);
	return previous;
}

export function compareSetAtomicInteger(
	runtime,
	reference,
	expected,
	replacement
) {
	if (readAtomicInteger(runtime, reference)
		!== normalizeAtomicInteger(expected)) return 0;
	writeAtomicInteger(runtime, reference, replacement);
	return 1;
}

export function compareExchangeAtomicInteger(
	runtime,
	reference,
	expected,
	replacement
) {
	const current = readAtomicInteger(runtime, reference);
	if (current === normalizeAtomicInteger(expected)) {
		writeAtomicInteger(runtime, reference, replacement);
	}
	return current;
}

export function addAtomicInteger(
	runtime,
	reference,
	delta,
	returnPrevious
) {
	const previous = readAtomicInteger(runtime, reference);
	const next = normalizeAtomicInteger(
		previous + normalizeAtomicInteger(delta)
	);
	writeAtomicInteger(runtime, reference, next);
	return returnPrevious ? previous : next;
}

export function normalizeAtomicInteger(value) {
	if (typeof value === "bigint") {
		return Number(BigInt.asIntN(32, value));
	}
	const number = Number(value);
	if (!Number.isFinite(number) || !Number.isInteger(number)) {
		throw atomicIntegerValueError(
			"ANDROID_ATOMIC_INTEGER_VALUE_INVALID",
			String(value)
		);
	}
	return number | 0;
}

function atomicIntegerValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
