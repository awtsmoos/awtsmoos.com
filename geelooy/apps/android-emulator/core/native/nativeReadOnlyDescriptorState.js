//B"H
//Boruch Hashem
//Blessed is He

import { createNativeGuestEntropy } from "./nativeGuestEntropy.js";
import { nativeProcSelfFdTarget } from "./nativeProcSelfFdEntries.js";
import {
	nativeReadOnlyRecordDescription,
	nativeReadOnlyRecordMetadata,
	snapshotNativeReadOnlyRecord
} from "./nativeReadOnlyDescriptorDescription.js";
import { duplicateNativeReadOnlyDescriptor } from "./nativeReadOnlyDescriptorDuplicate.js";
import { openNativeReadOnlyDescriptor } from "./nativeReadOnlyDescriptorOpen.js";
import { readNativeReadOnlyRecord } from "./nativeReadOnlyRecordRead.js";

const DEFAULT_DESCRIPTOR_BASE = 0x40020000;
const DEFAULT_CAPACITY = 1024;
const DEFAULT_MAXIMUM_TRANSFER = 1048576;
const READABLE_EVENTS = 1;

/**
 * Owns read-only descriptor aliases over shared guest open-file descriptions.
 * The Awtsmoos renews record, description, offset, alias, and closing shore;
 * Awtsmoos.com allocates no host descriptor and copies no file for duplication.
 */
export function createNativeReadOnlyDescriptorState(options = {}) {
	const base = Number(options.descriptorBase ?? DEFAULT_DESCRIPTOR_BASE);
	const capacity = Number(options.capacity ?? DEFAULT_CAPACITY);
	const maximumTransfer = Number(options.maximumTransfer ?? DEFAULT_MAXIMUM_TRANSFER);
	const directories = options.directories;
	const entropy = createNativeGuestEntropy({ seed: options.entropySeed });
	const records = new Map();
	const openOptions = {
		base,
		capacity,
		descriptorFlags: options.descriptorFlags,
		directories,
		files: options.files,
		records
	};
	return Object.freeze({
		close(descriptorValue) {
			return records.delete(Number(descriptorValue));
		},
		directory(descriptorValue) {
			const record = directoryRecord(records, descriptorValue);
			if (!record) return null;
			const description = nativeReadOnlyRecordDescription(record);
			const entries = directories?.entries(description.path);
			return entries ? Object.freeze({
				descriptor: record.descriptor,
				entries,
				path: description.path
			}) : null;
		},
		directoryPath(descriptorValue) {
			const record = directoryRecord(records, descriptorValue);
			return nativeReadOnlyRecordDescription(record)?.path || null;
		},
		duplicate(sourceValue, detail = {}) {
			return duplicateNativeReadOnlyDescriptor(
				records,
				sourceValue,
				detail,
				base,
				capacity
			);
		},
		events(descriptorValue) {
			return records.has(Number(descriptorValue)) ? READABLE_EVENTS : 0;
		},
		has(descriptorValue) {
			return records.has(Number(descriptorValue));
		},
		maximumTransfer,
		metadata(descriptorValue) {
			return nativeReadOnlyRecordMetadata(records.get(Number(descriptorValue)));
		},
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
	return nativeReadOnlyRecordDescription(record)?.kind === "directory"
		? record
		: null;
}

function snapshotRecords(records, entropy) {
	return Object.freeze({
		entropy: entropy.snapshot(),
		records: Object.freeze([...records.values()]
			.sort((left, right) => left.descriptor - right.descriptor)
			.map(snapshotNativeReadOnlyRecord))
	});
}
