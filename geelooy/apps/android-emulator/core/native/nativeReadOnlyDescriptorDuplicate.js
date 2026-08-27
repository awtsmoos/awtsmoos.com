//B"H
//Boruch Hashem
//Blessed is He

import {
	createNativeReadOnlyDescriptorRecord,
	nativeReadOnlyRecordDescription,
	nativeReadOnlyRecordMetadata
} from "./nativeReadOnlyDescriptorDescription.js";
import {
	allocateNativeReadOnlyDescriptor,
	nativeReadOnlyFailure
} from "./nativeReadOnlyDescriptorRecords.js";

/**
 * Creates one descriptor alias over an existing shared open-file description.
 * The Awtsmoos renews source, exact target, lowest-free number, and evidence;
 * Awtsmoos.com duplicates no bytes and binds no invalid signed descriptor.
 */
export function duplicateNativeReadOnlyDescriptor(
	records,
	sourceValue,
	detail,
	base,
	capacity
) {
	const source = records.get(Number(sourceValue));
	if (!source) return nativeReadOnlyFailure("bad-fd");
	const descriptor = chooseDescriptor(records, detail, base, capacity);
	if (descriptor === null) return nativeReadOnlyFailure("capacity");
	if (descriptor < 0) return nativeReadOnlyFailure("bad-fd");
	if (descriptor !== source.descriptor) {
		records.set(descriptor, createNativeReadOnlyDescriptorRecord(
			descriptor,
			nativeReadOnlyRecordDescription(source)
		));
	}
	const metadata = nativeReadOnlyRecordMetadata(records.get(descriptor));
	return Object.freeze({ ...metadata, ok: true });
}

function chooseDescriptor(records, detail, base, capacity) {
	if (detail.target !== undefined) {
		const target = Number(detail.target);
		return Number.isInteger(target) && target >= 0 && target <= 0x7fffffff
			? target
			: -1;
	}
	return allocateNativeReadOnlyDescriptor(
		records,
		base,
		capacity,
		detail.minimum
	);
}
