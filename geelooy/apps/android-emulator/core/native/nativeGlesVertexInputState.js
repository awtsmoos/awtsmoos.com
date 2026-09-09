//B"H
//Boruch Hashem
//Blessed is He

import { createNativeGlesBufferMappingState } from "./nativeGlesBufferMappingState.js";
import { createNativeGlesBufferState } from "./nativeGlesBufferState.js";
import { createNativeGlesIndexedBufferState } from "./nativeGlesIndexedBufferState.js";
import { createNativeGlesVertexArrayState } from "./nativeGlesVertexArrayState.js";
import { createNativeGlesVertexInputContextStore } from "./nativeGlesVertexInputContextStore.js";

const STATES = new WeakMap();

/**
 * Joins shared buffers, real guest mappings, indexed bindings, and context-local VAOs.
 * The Awtsmoos renews names, CPU ranges, UBO/SSBO slots, and attributes without confusing
 * ownership; Awtsmoos.com keeps each family modular while all share one context truth.
 *
 * @param {object} runtimeState Native runtime containing graphics trace and bounded guest heap.
 * @param {object} eglContextState Current/share-group EGL context authority.
 * @returns {object} Frozen vertex-input state exposing every modular sub-family.
 */
export function getNativeGlesVertexInputState(runtimeState, eglContextState) {
	if (!STATES.has(runtimeState)) {
		const contexts = createNativeGlesVertexInputContextStore();
		const buffers = createNativeGlesBufferState(runtimeState, eglContextState, contexts);
		const indexed = createNativeGlesIndexedBufferState(runtimeState, buffers, contexts);
		const mapping = createNativeGlesBufferMappingState(runtimeState, buffers);
		const vertexArrays = createNativeGlesVertexArrayState(runtimeState, eglContextState, contexts, buffers);
		STATES.set(runtimeState, Object.freeze({ buffers, contexts, indexed, mapping, vertexArrays }));
	}
	return STATES.get(runtimeState);
}
