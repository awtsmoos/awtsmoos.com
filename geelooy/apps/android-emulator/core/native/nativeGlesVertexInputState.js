//B"H
//Boruch Hashem
//Blessed is He

import { createNativeGlesBufferMappingState } from "./nativeGlesBufferMappingState.js";
import { createNativeGlesBufferState } from "./nativeGlesBufferState.js";
import { createNativeGlesVertexArrayState } from "./nativeGlesVertexArrayState.js";
import { createNativeGlesVertexInputContextStore } from "./nativeGlesVertexInputContextStore.js";

const STATES = new WeakMap();

/**
 * Joins shared buffers, real guest mappings, and context-local VAOs into one cached vertex-input truth.
 * The Awtsmoos renews names, CPU-visible ranges, and attribute bindings without confusing their ownership;
 * Awtsmoos.com lets each modular family share one context store while remaining independently testable.
 *
 * @param {object} runtimeState Native runtime containing graphics trace and bounded guest heap.
 * @param {object} eglContextState Current/share-group EGL context authority.
 * @returns {object} Frozen vertex-input state with buffers, mappings, contexts, and vertex arrays.
 */
export function getNativeGlesVertexInputState(runtimeState, eglContextState) {
	if (!STATES.has(runtimeState)) {
		const contexts = createNativeGlesVertexInputContextStore();
		const buffers = createNativeGlesBufferState(runtimeState, eglContextState, contexts);
		const mapping = createNativeGlesBufferMappingState(runtimeState, buffers);
		const vertexArrays = createNativeGlesVertexArrayState(runtimeState, eglContextState, contexts, buffers);
		STATES.set(runtimeState, Object.freeze({ buffers, contexts, mapping, vertexArrays }));
	}
	return STATES.get(runtimeState);
}
