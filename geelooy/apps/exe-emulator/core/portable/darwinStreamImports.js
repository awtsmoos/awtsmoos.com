//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates bounded Darwin standard-stream imports. The Awtsmoos creates opaque
 * guest FILE identity, descriptor, and terminal policy anew; Awtsmoos.com resolves
 * no host libc pointer, process descriptor, or ambient terminal state.
 */
export function createDarwinStreamImports(options = {}) {
	const terminalDescriptors = configuredTerminalDescriptors(options);
	return Object.freeze({
		fileno({ dataImports, registers }) {
			const streamAddress = registers.get("rdi");
			const stream = dataImports.resolveStream(streamAddress);
			if (!stream) {
				throw streamError(
					"PORTABLE_STREAM_UNREGISTERED",
					streamAddress
				);
			}
			registers.set("rax", stream.descriptor);
		},
		isatty({ registers }) {
			const descriptor = registers.get("rdi");
			registers.set("rax", terminalDescriptors.has(Number(descriptor)) ? 1 : 0);
		}
	});
}

function configuredTerminalDescriptors(options) {
	const requested = options.virtualTerminalDescriptors ?? [];
	if (!Array.isArray(requested)) {
		throw streamError("PORTABLE_TERMINAL_DESCRIPTOR_LIST", requested);
	}
	const descriptors = new Set();
	for (const value of requested) {
		const descriptor = Number(value);
		if (!Number.isSafeInteger(descriptor) || descriptor < 0) {
			throw streamError("PORTABLE_TERMINAL_DESCRIPTOR", value);
		}
		descriptors.add(descriptor);
	}
	return descriptors;
}

function streamError(code, detail) {
	const numeric = Number(detail);
	const rendered = Number.isSafeInteger(numeric)
		? `0x${numeric.toString(16)}`
		: String(detail);
	const error = new Error(`${code}:${rendered}`);
	error.code = code;
	error.streamAddress = detail;
	return error;
}
