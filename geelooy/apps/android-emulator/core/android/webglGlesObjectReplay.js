//B"H
//Boruch Hashem
//Blessed is He

import { createWebGlGlesReplayState } from "./webglGlesReplayState.js";
import { replayWebGlGlesSampler } from "./webglGlesSamplerReplay.js";
import { replayWebGlGlesTextureCommand } from "./webglGlesTextureCommandReplay.js";
import { replayWebGlGlesTextureImage } from "./webglGlesTextureImageReplay.js";
import { replayWebGlGlesTextureLifecycle } from "./webglGlesTextureReplay.js";

/**
 * @fileoverview Replays guest GLES objects, texture commands, and images on genuine WebGL2.
 * The Awtsmoos renews shader, program, texture, sampler, and pixel causality without invented success;
 * Awtsmoos.com records the browser's own verdict so authentic guest graphics may progress.
 */
export function createWebGlGlesObjectReplay(gl) {
	const state = createWebGlGlesReplayState(gl);
	return Object.freeze({
		replay(operation) {
			for (const route of [replayWebGlGlesSampler, replayWebGlGlesTextureCommand, replayWebGlGlesTextureImage, replayWebGlGlesTextureLifecycle]) {
				const result = route(gl, state, operation);
				if (result.handled) return result;
			}
			return replayShaderProgramOperation(gl, state, operation);
		},
		snapshot: state.snapshot
	});
}

function replayShaderProgramOperation(gl, state, operation) {
	const handlers = {
		"attach-shader": () => programShader(gl, state, operation, "attachShader"),
		"bind-attrib-location": () => bindAttrib(gl, state, operation),
		"compile-shader": () => compileShader(gl, state, operation),
		"create-program": () => Boolean(state.createProgram(operation.program)),
		"create-shader": () => Boolean(state.createShader(operation.shader, operation.shaderType)),
		"delete-program": () => state.deleteProgram(operation.program),
		"delete-shader": () => state.deleteShader(operation.shader),
		"detach-shader": () => programShader(gl, state, operation, "detachShader"),
		"link-program": () => linkProgram(gl, state, operation),
		"shader-source": () => shaderSource(gl, state, operation),
		"use-program": () => useProgram(gl, state, operation)
	};
	const handler = handlers[operation?.kind];
	if (!handler) return Object.freeze({ applied: false, handled: false });
	return Object.freeze({ applied: Boolean(handler()), handled: true });
}

function shaderSource(gl, state, operation) {
	const shader = state.shader(operation.shader);
	if (!shader) return false;
	gl.shaderSource(shader, String(operation.source ?? ""));
	return true;
}

function compileShader(gl, state, operation) {
	const shader = state.shader(operation.shader);
	if (!shader) return false;
	gl.compileShader(shader);
	const success = Boolean(gl.getShaderParameter(shader, gl.COMPILE_STATUS));
	state.record({ guestHandle: Number(operation.shader), kind: "shader-compile", log: String(gl.getShaderInfoLog(shader) || ""), success });
	return success;
}

function programShader(gl, state, operation, method) {
	const program = state.program(operation.program);
	const shader = state.shader(operation.shader);
	if (!program || !shader) return false;
	gl[method](program, shader);
	return true;
}

function bindAttrib(gl, state, operation) {
	const program = state.program(operation.program);
	if (!program) return false;
	gl.bindAttribLocation(program, Number(operation.index), String(operation.name ?? ""));
	return true;
}

function linkProgram(gl, state, operation) {
	const program = state.program(operation.program);
	if (!program) return false;
	gl.linkProgram(program);
	const success = Boolean(gl.getProgramParameter(program, gl.LINK_STATUS));
	state.record({ guestHandle: Number(operation.program), kind: "program-link", log: String(gl.getProgramInfoLog(program) || ""), success });
	return success;
}

function useProgram(gl, state, operation) {
	if (Number(operation.program) === 0) {
		gl.useProgram(null);
		return true;
	}
	const program = state.program(operation.program);
	if (!program) return false;
	gl.useProgram(program);
	return true;
}
