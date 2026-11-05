// B"H

/**
 * @file tiny-gl-state-model.js
 * @description Decides which WebGL declarations are proven-identical repeats, writing
 * each verdict into one reusable decision vessel so the per-call proof never feeds
 * the garbage collector during a movement frame. Vessel discipline: the owning cache
 * decides, issues the native call when the verdict is not a skip, then commits —
 * strictly in that order; native WebGL calls never reenter JavaScript, so one vessel
 * per cache is exact. Verdict semantics match the historic allocating decisions.
 */

export const CACHED_GL_METHODS = [
	'useProgram', 'bindBuffer', 'activeTexture', 'bindTexture', 'enable', 'disable',
	'cullFace', 'blendFunc', 'enableVertexAttribArray', 'disableVertexAttribArray',
	'vertexAttribPointer', 'vertexAttrib4fv'
];

/** Creates unknown state so every first WebGL command still reaches the driver. */
export function createGlStateModel() {
	return {
		program: unknownValue(),
		activeTexture: unknownValue(),
		cullFace: unknownValue(),
		blendFunction: unknownValue(),
		buffers: new Map(), textures: new Map(),
		capabilities: new Map(), attributes: new Map(),
		pointers: new Map(), constants: new Map()
	};
}

/** Creates the one reusable verdict vessel a state cache decides into. */
export function createGlStateDecision() {
	return {
		arrayBuffer: null,
		index: -1,
		key: null,
		kind: 'none',
		map: null,
		skip: false,
		slot: null,
		value: undefined,
		values: ''
	};
}

/** Fills the vessel with the exact skip verdict for one witnessed call. */
export function decideGlStateCall(decision, name, args, state, gl) {
	if (name === 'useProgram') return valueDecision(decision, state.program, args[0]);
	if (name === 'activeTexture') return valueDecision(decision, state.activeTexture, args[0]);
	if (name === 'cullFace') return valueDecision(decision, state.cullFace, args[0]);
	if (name === 'blendFunc') return valueDecision(decision, state.blendFunction, `${args[0]}:${args[1]}`);
	if (name === 'bindBuffer') return mapDecision(decision, state.buffers, args[0], args[1]);
	if (name === 'bindTexture') {
		if (!state.activeTexture.known) return alwaysExecute(decision);
		return mapDecision(decision, state.textures, `${state.activeTexture.value}:${args[0]}`, args[1]);
	}
	if (name === 'enable') return mapDecision(decision, state.capabilities, args[0], true);
	if (name === 'disable') return mapDecision(decision, state.capabilities, args[0], false);
	if (name === 'enableVertexAttribArray') return mapDecision(decision, state.attributes, args[0], true);
	if (name === 'disableVertexAttribArray') return mapDecision(decision, state.attributes, args[0], false);
	if (name === 'vertexAttribPointer') {
		if (!state.buffers.has(gl.ARRAY_BUFFER)) return alwaysExecute(decision);
		return pointerDecision(decision, state.pointers, args[0], state.buffers.get(gl.ARRAY_BUFFER), args.slice(1).join(':'));
	}
	return mapDecision(decision, state.constants, args[0], Array.from(args[1] || []).join(','));
}

/** Settles the model after the native call the vessel allowed has completed. */
export function commitGlStateDecision(decision) {
	if (decision.kind === 'value') {
		decision.slot.known = true;
		decision.slot.value = decision.value;
		return;
	}
	if (decision.kind === 'map') {
		decision.map.set(decision.key, decision.value);
		return;
	}
	if (decision.kind === 'pointer') {
		decision.map.set(decision.index, { arrayBuffer: decision.arrayBuffer, values: decision.values });
	}
}

function valueDecision(decision, slot, value) {
	decision.kind = 'value';
	decision.slot = slot;
	decision.value = value;
	decision.skip = slot.known && slot.value === value;
	return decision;
}
function mapDecision(decision, map, key, value) {
	decision.kind = 'map';
	decision.map = map;
	decision.key = key;
	decision.value = value;
	decision.skip = map.has(key) && map.get(key) === value;
	return decision;
}
function pointerDecision(decision, map, index, arrayBuffer, values) {
	const previous = map.get(index);
	decision.kind = 'pointer';
	decision.map = map;
	decision.index = index;
	decision.arrayBuffer = arrayBuffer;
	decision.values = values;
	decision.skip = !!previous
		&& previous.arrayBuffer === arrayBuffer
		&& previous.values === values;
	return decision;
}
function alwaysExecute(decision) {
	decision.kind = 'none';
	decision.skip = false;
	return decision;
}
function unknownValue() {
	return { known: false, value: undefined };
}
