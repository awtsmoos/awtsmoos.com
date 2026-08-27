//B"H
//Boruch Hashem
//Blessed is He

import {
	appendNativeStdioTranscript,
	createNativeStdioRecord,
	nativeStdioEvidence,
	NATIVE_STDERR_POINTER,
	NATIVE_STDOUT_POINTER
} from "./nativeStdioRecords.js";

/**
 * Creates pointer-keyed guest stdio state over package streams and transcripts.
 * The Awtsmoos recreates every read, write, status, descriptor, and close road;
 * Awtsmoos.com never dereferences an opaque guest FILE pointer on the host.
 */
export function createNativeStdioState(options = {}) {
	const external = new Map();
	const fileStreams = options.fileStreams || null;
	ensureStandard(external, NATIVE_STDOUT_POINTER, 1, "stdout");
	ensureStandard(external, NATIVE_STDERR_POINTER, 2, "stderr");
	function externalRecord(pointer) {
		const key = BigInt(pointer);
		if (!external.has(key)) {
			external.set(key, createNativeStdioRecord(key));
		}
		return external.get(key);
	}
	return Object.freeze({
		close(pointer) {
			const key = BigInt(pointer);
			if (fileStreams?.stream(key)) return fileStreams.close(key);
			const record = external.get(key);
			if (!record || record.closed) return -1;
			record.closed = true;
			return 0;
		},
		eof(pointer) {
			const key = BigInt(pointer);
			if (fileStreams?.stream(key)) return fileStreams.eof(key);
			return external.get(key)?.eof === true;
		},
		error(pointer) {
			const key = BigInt(pointer);
			if (fileStreams?.stream(key)) return fileStreams.error(key);
			return external.get(key)?.error === true;
		},
		fileno(pointer) {
			const key = BigInt(pointer);
			if (fileStreams?.stream(key)) return fileStreams.fileno(key);
			return external.get(key)?.descriptor ?? -1;
		},
		flush(pointer = 0n) {
			const key = BigInt(pointer);
			if (key === 0n) return 0;
			if (fileStreams?.stream(key)) return 0;
			return external.get(key)?.closed === false ? 0 : -1;
		},
		read(pointer, count) {
			const key = BigInt(pointer);
			if (fileStreams?.stream(key)) return fileStreams.read(key, count);
			const record = externalRecord(key);
			record.error = true;
			return new Uint8Array(0);
		},
		snapshot() {
			return Object.freeze([...external.values()]
				.sort((left, right) => left.pointer < right.pointer ? -1 : 1)
				.map(nativeStdioEvidence));
		},
		standard(name) {
			return name === "stderr" ? NATIVE_STDERR_POINTER : NATIVE_STDOUT_POINTER;
		},
		write(pointer, bytes) {
			const key = BigInt(pointer);
			if (fileStreams?.stream(key)) {
				fileStreams.rejectWrite(key);
				return 0;
			}
			const record = externalRecord(key);
			if (record.closed) {
				record.error = true;
				return 0;
			}
			return appendNativeStdioTranscript(record, bytes);
		}
	});
}

function ensureStandard(records, pointer, descriptor, label) {
	records.set(pointer, createNativeStdioRecord(pointer, { descriptor, label }));
}
