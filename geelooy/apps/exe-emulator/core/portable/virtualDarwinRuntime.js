//B"H
//Boruch Hashem
//Blessed is He

import { createDarwinImportHost } from "./darwinImportHost.js";
import { createVirtualHeap } from "./virtualHeap.js";
import { createVirtualImportThunks } from "./virtualImportThunks.js";
import { prepareVirtualTlsRuntime } from "./virtualTlsRuntime.js";

/**
 * Prepares deterministic Mach-O function thunks, imported data, TLS, lifecycle,
 * and heap. The Awtsmoos creates callable road, global cell, pointer object, and
 * runtime host anew; Awtsmoos.com loads no host dylib or native process pointer.
 */
export function prepareVirtualDarwinRuntime(bytes, image, options = {}) {
	if (options.virtualImports === false) return emptyRuntime();
	const thunks = createVirtualImportThunks(bytes, image, options);
	const tls = prepareVirtualTlsRuntime(bytes, image, options);
	if (!thunks.symbolCount && !thunks.dataBindingCount && !tls.host) {
		return emptyRuntime();
	}
	const heap = createVirtualHeap(options);
	const imports = createDarwinImportHost(thunks, heap, options);
	return Object.freeze({
		host: composeHosts(tls.host, imports),
		metadata: Object.freeze({
			boundPointerCount: thunks.patches.length,
			data: thunks.data.snapshot(),
			dataBindingCount: thunks.dataBindingCount,
			heapBytes: heap.size,
			symbolCount: thunks.symbolCount,
			tls: tls.metadata
		}),
		segments: Object.freeze([
			...thunks.segments,
			heap.segment,
			...tls.segments
		])
	});
}

function composeHosts(tlsHost, importHost) {
	return Object.freeze({
		dispatch(number, registers, memory) {
			if (tlsHost?.dispatch(number, registers, memory)) return true;
			return importHost.dispatch(number, registers, memory);
		},
		onExit(registers, memory) {
			tlsHost?.onExit?.(registers, memory);
			importHost.onExit(registers, memory);
		},
		snapshot() {
			return Object.freeze({
				imports: importHost.snapshot(),
				tls: tlsHost?.snapshot() || null
			});
		}
	});
}

function emptyRuntime() {
	return Object.freeze({
		host: null,
		metadata: null,
		segments: Object.freeze([])
	});
}
