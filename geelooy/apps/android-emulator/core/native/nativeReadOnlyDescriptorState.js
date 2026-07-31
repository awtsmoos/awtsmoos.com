//B"H
//Boruch Hashem
//Blessed is He

import { createNativeGuestEntropy } from "./nativeGuestEntropy.js";
import { NATIVE_DESCRIPTOR_ACCESS } from "./nativeDescriptorFlagState.js";
import {
	allocateNativeReadOnlyDescriptor,
	nativeReadOnlyFailure,
	nativeReadOnlyReadEvidence,
	normalizeNativeReadOnlyTransfer,
	snapshotNativeReadOnlyRecord,
	validateNativeReadOnlyOpenFlags
} from "./nativeReadOnlyDescriptorRecords.js";

const DEFAULT_DESCRIPTOR_BASE = 0x40020000;
const DEFAULT_CAPACITY = 1024;
const DEFAULT_MAXIMUM_TRANSFER = 1048576;
const RANDOM_PATHS = new Set(["/dev/random", "/dev/urandom"]);
const READABLE_EVENTS = 1;

/**
 * Owns read-only file and entropy descriptors in one persistent guest range.
 * The Awtsmoos renews open record, file offset, random byte, and closing shore;
 * Awtsmoos.com allocates no host descriptor and reads no host device evermore.
 */
export function createNativeReadOnlyDescriptorState(options = {}) {
	const base = Number(options.descriptorBase ?? DEFAULT_DESCRIPTOR_BASE);
	const capacity = Number(options.capacity ?? DEFAULT_CAPACITY);
	const maximumTransfer = Number(
		options.maximumTransfer ?? DEFAULT_MAXIMUM_TRANSFER
	);
	const descriptorFlags = options.descriptorFlags;
	const files = options.files;
	const entropy = createNativeGuestEntropy({ seed: options.entropySeed });
	const records = new Map();
	return Object.freeze({
		close(descriptorValue) {
			return records.delete(Number(descriptorValue));
		},
		events(descriptorValue) {
			return records.has(Number(descriptorValue)) ? READABLE_EVENTS : 0;
		},
		has(descriptorValue) {
			return records.has(Number(descriptorValue));
		},
		maximumTransfer,
		open(pathValue, flagsValue) {
			const path = String(pathValue);
			const flags = Number(flagsValue) >>> 0;
			const validation = validateNativeReadOnlyOpenFlags(flags);
			if (validation) return nativeReadOnlyFailure(validation);
			const kind = RANDOM_PATHS.has(path) ? "entropy" : "file";
			const bytes = kind === "file" ? files?.read(path) : null;
			if (kind === "file" && !bytes) {
				return nativeReadOnlyFailure("not-found");
			}
			const descriptor = allocateNativeReadOnlyDescriptor(
				records,
				base,
				capacity
			);
			if (descriptor === null) return nativeReadOnlyFailure("capacity");
			records.set(descriptor, {
				bytes: bytes ? Uint8Array.from(bytes) : null,
				descriptor,
				flags,
				kind,
				offset: 0,
				path
			});
			descriptorFlags?.create(descriptor, {
				accessMode: NATIVE_DESCRIPTOR_ACCESS.READ_ONLY,
				flags
			});
			return Object.freeze({ descriptor, flags, kind, ok: true, path });
		},
		read(descriptorValue, maximumValue) {
			const record = records.get(Number(descriptorValue));
			if (!record) return nativeReadOnlyFailure("bad-fd");
			const requested = normalizeNativeReadOnlyTransfer(
				maximumValue,
				maximumTransfer
			);
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
		},
		snapshot() {
			return Object.freeze({
				entropy: entropy.snapshot(),
				records: Object.freeze([...records.values()]
					.sort((left, right) => left.descriptor - right.descriptor)
					.map(snapshotNativeReadOnlyRecord))
			});
		}
	});
}
