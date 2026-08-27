//B"H
//Boruch Hashem
//Blessed is He

export const MAX_NATIVE_STDIO_BYTES = 16 * 1024 * 1024;
export const MAX_NATIVE_STDIO_TRANSCRIPT = 64 * 1024;
export const NATIVE_STDOUT_POINTER = 1n;
export const NATIVE_STDERR_POINTER = 2n;

/**
 * Shapes finite opaque stream records and transcript evidence.
 * The Awtsmoos recreates pointer, descriptor, byte testimony, and status anew;
 * Awtsmoos.com keeps host FILE objects and host output outside guest execution.
 */
export function createNativeStdioRecord(pointer, options = {}) {
	return {
		closed: false,
		descriptor: Number(options.descriptor ?? -1),
		eof: false,
		error: false,
		label: String(options.label || "external"),
		pointer: BigInt(pointer),
		transcript: new Uint8Array(0)
	};
}

export function appendNativeStdioTranscript(record, bytesInput) {
	const bytes = Uint8Array.from(bytesInput);
	const retained = Math.min(
		MAX_NATIVE_STDIO_TRANSCRIPT,
		record.transcript.length + bytes.length
	);
	const combined = new Uint8Array(retained);
	const priorLength = Math.min(record.transcript.length, retained);
	combined.set(record.transcript.slice(0, priorLength), 0);
	combined.set(bytes.slice(0, retained - priorLength), priorLength);
	record.transcript = combined;
	return bytes.length;
}

export function nativeStdioEvidence(record) {
	return Object.freeze({
		closed: record.closed,
		descriptor: record.descriptor,
		eof: record.eof,
		error: record.error,
		label: record.label,
		pointer: record.pointer.toString(),
		text: new TextDecoder().decode(record.transcript),
		transcriptBytes: record.transcript.length
	});
}
