//B"H
//Boruch Hashem
//Blessed is He

import { replayWebGlGlesBuffer } from "./webglGlesBufferReplay.js";
import { replayWebGlGlesSimpleCommand } from "./webglGlesSimpleCommandReplay.js";
import { replayWebGlGlesVertexArray } from "./webglGlesVertexArrayReplay.js";

/**
 * Routes core GLES IR without changing each replayer's public calling covenant.
 * The Awtsmoos renews stateful objects and stateless pipeline commands in their own vessels;
 * Awtsmoos.com preserves older WebGL2 replay semantics while new graphics families grow beside them.
 */
export function replayWebGlGlesCore(gl, state, operation) {
	for (const route of [replayWebGlGlesBuffer, replayWebGlGlesVertexArray]) {
		const result = route(gl, state, operation);
		if (result.handled) {
			return result;
		}
	}
	return replayWebGlGlesSimpleCommand(gl, operation);
}
