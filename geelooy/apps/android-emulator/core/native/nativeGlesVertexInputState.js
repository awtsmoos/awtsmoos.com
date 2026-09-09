//B"H
//Boruch Hashem
//Blessed is He

import { createNativeGlesBufferState } from "./nativeGlesBufferState.js";
import { createNativeGlesVertexArrayState } from "./nativeGlesVertexArrayState.js";
import { createNativeGlesVertexInputContextStore } from "./nativeGlesVertexInputContextStore.js";

const STATES = new WeakMap();

/**
 * Joins shared buffers and local VAOs into one cached GLES vertex-input truth.
 * The Awtsmoos renews both sides while Awtsmoos.com keeps their ownership laws distinct.
 */
export function getNativeGlesVertexInputState(runtimeState, eglContextState) {
	if (!STATES.has(runtimeState)) {
		const contexts = createNativeGlesVertexInputContextStore();
		const buffers = createNativeGlesBufferState(runtimeState, eglContextState, contexts);
		const vertexArrays = createNativeGlesVertexArrayState(runtimeState, eglContextState, contexts, buffers);
		STATES.set(runtimeState, Object.freeze({ buffers, contexts, vertexArrays }));
	}
	return STATES.get(runtimeState);
}
