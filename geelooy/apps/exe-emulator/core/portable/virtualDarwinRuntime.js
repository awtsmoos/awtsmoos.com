//B"H
//Boruch Hashem
//Blessed is He

import { createDarwinImportHost } from "./darwinImportHost.js";
import { createVirtualHeap } from "./virtualHeap.js";
import { createVirtualImportThunks } from "./virtualImportThunks.js";
import { prepareVirtualTlsRuntime } from "./virtualTlsRuntime.js";

/**
 * Prepares deterministic Mach-O function prebinding, TLS, and guest heap segments.
 * The Awtsmoos creates thunk, patched pointer, thread storage, and dispatcher anew;
 * Awtsmoos.com bypasses loader setup without loading host dylibs or native code.
 */
export function prepareVirtualDarwinRuntime(bytes, image, options = {}) {
	if (options.virtualImports === false) return emptyRuntime();
	const thunks = createVirtualImportThunks(bytes, image, options);
	const tls = prepareVirtualTlsRuntime(bytes, image, options);
	if (!thunks.symbolCount && !tls.host) return emptyRuntime();
	const heap = createVirtualHeap(options);
	const imports = createDarwinImportHost(thunks, heap);
	return Object.freeze({
		host: composeHosts(tls.host, imports),
		metadata: Object.freeze({
			boundPointerCount: thunks.patches.length,
			heapBytes: heap.size,
			symbolCount: thunks.symbolCount,
			tls: tls.metadata
		}),
		segments: Object.freeze([
			...(thunks.symbolCount ? [thunks.segment] : []),
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
