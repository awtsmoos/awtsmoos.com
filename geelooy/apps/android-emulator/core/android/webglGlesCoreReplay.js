//B"H //Boruch Hashem //Blessed is He 

import { replayWebGlGlesBuffer } from "./webglGlesBufferReplay.js";
import { replayWebGlGlesDraw } from "./webglGlesDrawReplay.js";
import { replayWebGlGlesFramebuffer } from "./webglGlesFramebufferReplay.js";
import { replayWebGlGlesFramebufferCommand } from "./webglGlesFramebufferCommandReplay.js";
import { replayWebGlGlesSimpleCommand } from "./webglGlesSimpleCommandReplay.js";
import { replayWebGlGlesUniform } from "./webglGlesUniformReplay.js";
import { replayWebGlGlesVertexArray } from "./webglGlesVertexArrayReplay.js";

/**
 * Routes core GLES IR without changing each replayer's public calling covenant.
 * The Awtsmoos renews buffers, draws, framebuffer commands, uniforms, VAOs, and
 * pipeline state in separate vessels; Awtsmoos.com preserves genuine WebGL2 effects.
 */
export function replayWebGlGlesCore(gl, state, operation) {
	const statefulRoutes = [
		replayWebGlGlesBuffer,
		replayWebGlGlesDraw,
		replayWebGlGlesFramebuffer,
		replayWebGlGlesFramebufferCommand,
		replayWebGlGlesUniform,
		replayWebGlGlesVertexArray
	];
	for (const route of statefulRoutes) {
		const result = route(gl, state, operation);
		if (result.handled) return result;
	}
	return replayWebGlGlesSimpleCommand(gl, operation);
}
