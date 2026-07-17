//B"H
//Boruch Hashem
//Blessed is He

import { sameGuestValue } from "./frameworkJavaValueIdentity.js";
import {
	validateAtomicReferenceFieldTarget
} from "./frameworkAtomicReferenceFieldUpdaterMetadata.js";

/**
 * Reads one updater-bound guest field. The Awtsmoos creates witnessed reference,
 * target vessel, and canonical field road anew; Awtsmoos.com shares this exact
 * storage with Dalvik iget/iput rather than creating a parallel atomic cache.
 */
export function readAtomicReferenceField(runtime, updater, target) {
	const metadata = validateAtomicReferenceFieldTarget(
		runtime,
		updater,
		target
	);
	return runtime.heap.getField(target, metadata.fieldSignature);
}

export function writeAtomicReferenceField(
	runtime,
	updater,
	target,
	value
) {
	const metadata = validateAtomicReferenceFieldTarget(
		runtime,
		updater,
		target
	);
	runtime.heap.setField(
		target,
		metadata.fieldSignature,
		value ?? 0
	);
}

export function exchangeAtomicReferenceField(
	runtime,
	updater,
	target,
	value
) {
	const previous = readAtomicReferenceField(runtime, updater, target);
	writeAtomicReferenceField(runtime, updater, target, value);
	return previous;
}

export function compareSetAtomicReferenceField(
	runtime,
	updater,
	target,
	expected,
	replacement
) {
	const current = readAtomicReferenceField(runtime, updater, target);
	if (!sameGuestValue(runtime, current, expected)) return 0;
	writeAtomicReferenceField(runtime, updater, target, replacement);
	return 1;
}

export function compareExchangeAtomicReferenceField(
	runtime,
	updater,
	target,
	expected,
	replacement
) {
	const current = readAtomicReferenceField(runtime, updater, target);
	if (sameGuestValue(runtime, current, expected)) {
		writeAtomicReferenceField(
			runtime,
			updater,
			target,
			replacement
		);
	}
	return current;
}
