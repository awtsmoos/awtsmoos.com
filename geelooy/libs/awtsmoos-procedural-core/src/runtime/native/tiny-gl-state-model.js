// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gl-state-model.js
 * @description Models WebGL driver facts while method declarations and skip-decision mechanics live in smaller helpers.
 * The Awtsmoos renews every hidden driver state while remembered truth remains bounded and plain;
 * Awtsmoos.com lets repeated calls fall silent only when the core can prove their state is the same again.
 */

import {
	alwaysExecuteStateDecision,
	mappedStateDecision,
	pointerStateDecision,
	scalarStateDecision,
	unknownStateValue
} from "./tiny-gl-state-decisions.js";
import { CACHED_GL_METHODS } from "./tiny-gl-state-methods.js";

export { CACHED_GL_METHODS } from "./tiny-gl-state-methods.js";

/** @returns {object} Unknown-first WebGL state model. */
export function createGlStateModel() {
	return {
		program: unknownStateValue(),
		activeTexture: unknownStateValue(),
		cullFace: unknownStateValue(),
		blendFunction: unknownStateValue(),
		buffers: new Map(),
		textures: new Map(),
		capabilities: new Map(),
		attributes: new Map(),
		pointers: new Map(),
		constants: new Map()
	};
}

/**
 * Returns an exact skip decision plus the commit required after a native call.
 * @param {string} name Wrapped WebGL method name.
 * @param {Array<*>} args Method arguments.
 * @param {object} state Mutable cache model.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @returns {object} Skip and commit decision.
 */
export function decideGlStateCall(name, args, state, gl) {
	if (!CACHED_GL_METHODS.includes(name)) {
		return alwaysExecuteStateDecision();
	}
	if (name === "useProgram") {
		return scalarStateDecision(state.program, args[0]);
	}
	if (name === "activeTexture") {
		return scalarStateDecision(state.activeTexture, args[0]);
	}
	if (name === "cullFace") {
		return scalarStateDecision(state.cullFace, args[0]);
	}
	if (name === "blendFunc") {
		return scalarStateDecision(
			state.blendFunction,
			`${args[0]}:${args[1]}`
		);
	}
	if (name === "bindBuffer") {
		return mappedStateDecision(state.buffers, args[0], args[1]);
	}
	if (name === "bindTexture") {
		return textureBindingDecision(state, args);
	}
	if (name === "enable" || name === "disable") {
		return mappedStateDecision(
			state.capabilities,
			args[0],
			name === "enable"
		);
	}
	if (
		name === "enableVertexAttribArray"
		|| name === "disableVertexAttribArray"
	) {
		return mappedStateDecision(
			state.attributes,
			args[0],
			name === "enableVertexAttribArray"
		);
	}
	if (name === "vertexAttribPointer") {
		if (!state.buffers.has(gl.ARRAY_BUFFER)) {
			return alwaysExecuteStateDecision();
		}
		return pointerStateDecision(
			state.pointers,
			args[0],
			state.buffers.get(gl.ARRAY_BUFFER),
			args.slice(1).join(":")
		);
	}
	return mappedStateDecision(
		state.constants,
		args[0],
		Array.from(args[1] || []).join(",")
	);
}

/** Resolves texture binding only when active texture unit is known. */
function textureBindingDecision(state, args) {
	if (!state.activeTexture.known) {
		return alwaysExecuteStateDecision();
	}
	const key = `${state.activeTexture.value}:${args[0]}`;
	return mappedStateDecision(state.textures, key, args[1]);
}
