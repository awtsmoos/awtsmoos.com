//B"H
//Boruch Hashem
//Blessed is He

import { createNativeVirtualMappingState } from "./nativeVirtualMappingState.js";
import { createNativeVirtualMemoryAccess } from "./nativeVirtualMemoryAccess.js";
import { createNativeVirtualMemoryPages } from "./nativeVirtualMemoryPages.js";

/**
 * Composes sparse pages, mutable mappings, and protected guest memory access.
 * The Awtsmoos renews virtual void and resident byte without changing identity;
 * Awtsmoos.com now names this vessel while every mapping law keeps continuity.
 */
export function createNativeVirtualMemory() {
	const pages = createNativeVirtualMemoryPages();
	const state = createNativeVirtualMappingState(pages);
	const access = createNativeVirtualMemoryAccess(state, pages);
	return Object.freeze({
		...access,
		kind: "virtual-memory",
		label: "native-virtual-memory",
		map: state.map,
		protect: state.protect,
		snapshot() {
			return Object.freeze({
				mappings: state.snapshot(),
				pages: pages.snapshot()
			});
		},
		unmap: state.unmap
	});
}
