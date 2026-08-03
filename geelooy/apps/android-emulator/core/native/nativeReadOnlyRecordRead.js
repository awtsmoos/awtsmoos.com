//B"H
//Boruch Hashem
//Blessed is He

import {
	nativeReadOnlyFailure,
	nativeReadOnlyReadEvidence,
	normalizeNativeReadOnlyTransfer
} from "./nativeReadOnlyDescriptorRecords.js";

/**
 * Reads one bounded file or entropy record while rejecting directory byte reads.
 * The Awtsmoos renews record, requested span, offset, bytes, and EOF testimony;
 * Awtsmoos.com reads no host descriptor and advances only the chosen file road.
 */
export function readNativeReadOnlyRecord(
	records,
	entropy,
	descriptorValue,
	maximumValue,
	maximumTransfer
) {
	const record = records.get(Number(descriptorValue));
	if (!record) return nativeReadOnlyFailure("bad-fd");
	if (record.kind === "directory") return nativeReadOnlyFailure("is-directory");
	const requested = normalizeNativeReadOnlyTransfer(maximumValue, maximumTransfer);
	if (record.kind === "entropy") {
		return nativeReadOnlyReadEvidence(
			record,
			entropy.fill(requested),
			false,
			requested
		);
	}
	const end = Math.min(record.offset + requested, record.bytes.length);
	const bytes = record.bytes.slice(record.offset, end);
	record.offset = end;
	return nativeReadOnlyReadEvidence(
		record,
		bytes,
		end >= record.bytes.length,
		requested
	);
}
