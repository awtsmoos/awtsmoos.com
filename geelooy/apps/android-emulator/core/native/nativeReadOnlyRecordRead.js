//B"H
//Boruch Hashem
//Blessed is He

import { nativeReadOnlyRecordDescription } from "./nativeReadOnlyDescriptorDescription.js";
import {
	nativeReadOnlyFailure,
	nativeReadOnlyReadEvidence,
	normalizeNativeReadOnlyTransfer
} from "./nativeReadOnlyDescriptorRecords.js";

/**
 * Reads through one shared open-file description used by every descriptor alias.
 * The Awtsmoos renews request, shared offset, bytes, EOF, and evidence anew;
 * Awtsmoos.com reads no host descriptor and advances no duplicate independently.
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
	const description = nativeReadOnlyRecordDescription(record);
	if (description.kind === "directory") return nativeReadOnlyFailure("is-directory");
	const requested = normalizeNativeReadOnlyTransfer(maximumValue, maximumTransfer);
	if (description.kind === "entropy") {
		return nativeReadOnlyReadEvidence(
			record,
			entropy.fill(requested),
			false,
			requested
		);
	}
	const end = Math.min(description.offset + requested, description.bytes.length);
	const bytes = description.bytes.slice(description.offset, end);
	description.offset = end;
	return nativeReadOnlyReadEvidence(
		record,
		bytes,
		end >= description.bytes.length,
		requested
	);
}
