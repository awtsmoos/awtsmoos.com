//B"H
//Boruch Hashem
//Blessed is He

import { createNativeGuestEntropy } from "./nativeGuestEntropy.js";
import { nativeProcSelfFdTarget } from "./nativeProcSelfFdEntries.js";
import { openNativeReadOnlyDescriptor } from "./nativeReadOnlyDescriptorOpen.js";
import { snapshotNativeReadOnlyRecord } from "./nativeReadOnlyDescriptorRecords.js";
import { readNativeReadOnlyRecord } from "./nativeReadOnlyRecordRead.js";

const DEFAULT_DESCRIPTOR_BASE = 0x40020000;
const DEFAULT_CAPACITY = 1024;
const DEFAULT_MAXIMUM_TRANSFER = 1048576;
const READABLE_EVENTS = 1;

/**
 * Owns read-only file, entropy, and directory descriptors in one guest range.
 * The Awtsmoos renews record, path, offset, proc link, and closing shore;
 * Awtsmoos.com allocates no host descriptor and reads no host device evermore.
 */
export function createNativeReadOnlyDescriptorState(options = {}) {
	const base = Number(options.descriptorBase ?? DEFAULT_DESCRIPTOR_BASE);
	const capacity = Number(options.capacity ?? DEFAULT_CAPACITY);
	const maximumTransfer = Number(options.maximumTransfer ?? DEFAULT_MAXIMUM_TRANSFER);
	const descriptorFlags = options.descriptorFlags;
	const directories = options.directories;
	const files = options.files;
	const entropy = createNativeGuestEntropy({ seed: options.entropySeed });
	const records = new Map();
	const openOptions = {
		base,
		capacity,
		descriptorFlags,
		directories,
		files,
		records
	};
	return Object.freeze({
		close(descriptorValue) {
			return records.delete(Number(descriptorValue));
		},
		directory(descriptorValue) {
			const record = directoryRecord(records, descriptorValue);
			if (!record) return null;
			const entries = directories?.entries(record.path);
			return entries ? Object.freeze({
				descriptor: record.descriptor,
				entries,
				path: record.path
			}) : null;
		},
		directoryPath(descriptorValue) {
			return directoryRecord(records, descriptorValue)?.path || null;
		},
		events(descriptorValue) {
			return records.has(Number(descriptorValue)) ? READABLE_EVENTS : 0;
		},
		has(descriptorValue) {
			return records.has(Number(descriptorValue));
		},
		maximumTransfer,
		open(pathValue, flagsValue) {
			return openNativeReadOnlyDescriptor(openOptions, pathValue, flagsValue);
		},
		read(descriptorValue, maximumValue) {
			return readNativeReadOnlyRecord(
				records,
				entropy,
				descriptorValue,
				maximumValue,
				maximumTransfer
			);
		},
		readLink(pathValue) {
			return nativeProcSelfFdTarget(pathValue, {
				snapshot: () => snapshotRecords(records, entropy)
			});
		},
		snapshot() {
			return snapshotRecords(records, entropy);
		}
	});
}

function directoryRecord(records, descriptorValue) {
	const record = records.get(Number(descriptorValue));
	return record?.kind === "directory" ? record : null;
}

function snapshotRecords(records, entropy) {
	return Object.freeze({
		entropy: entropy.snapshot(),
		records: Object.freeze([...records.values()]
			.sort((left, right) => left.descriptor - right.descriptor)
			.map(snapshotNativeReadOnlyRecord))
	});
}
