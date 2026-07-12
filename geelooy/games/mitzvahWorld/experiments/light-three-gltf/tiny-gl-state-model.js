// B"H

export const CACHED_GL_METHODS = [
	'useProgram', 'bindBuffer', 'activeTexture', 'bindTexture',
	'enable', 'disable', 'cullFace', 'blendFunc',
	'enableVertexAttribArray', 'disableVertexAttribArray',
	'vertexAttribPointer', 'vertexAttrib4fv'
];

/** Creates unknown state so every first WebGL command still reaches the driver. */
export function createGlStateModel() {
	return {
		program: unknownValue(),
		activeTexture: unknownValue(),
		cullFace: unknownValue(),
		blendFunction: unknownValue(),
		buffers: new Map(),
		textures: new Map(),
		capabilities: new Map(),
		attributes: new Map(),
		pointers: new Map(),
		constants: new Map()
	};
}

/** Returns an exact skip decision plus the commit needed after a native call. */
export function decideGlStateCall(name, args, state, gl) {
	if (name === 'useProgram') return valueDecision(state.program, args[0]);
	if (name === 'activeTexture') return valueDecision(state.activeTexture, args[0]);
	if (name === 'cullFace') return valueDecision(state.cullFace, args[0]);
	if (name === 'blendFunc') {
		return valueDecision(
			state.blendFunction,
			`${args[0]}:${args[1]}`
		);
	}
	if (name === 'bindBuffer') {
		return mapDecision(state.buffers, args[0], args[1]);
	}
	if (name === 'bindTexture') {
		if (!state.activeTexture.known) return alwaysExecute();
		const key = `${state.activeTexture.value}:${args[0]}`;
		return mapDecision(state.textures, key, args[1]);
	}
	if (name === 'enable') {
		return mapDecision(state.capabilities, args[0], true);
	}
	if (name === 'disable') {
		return mapDecision(state.capabilities, args[0], false);
	}
	if (name === 'enableVertexAttribArray') {
		return mapDecision(state.attributes, args[0], true);
	}
	if (name === 'disableVertexAttribArray') {
		return mapDecision(state.attributes, args[0], false);
	}
	if (name === 'vertexAttribPointer') {
		if (!state.buffers.has(gl.ARRAY_BUFFER)) return alwaysExecute();
		return pointerDecision(
			state.pointers,
			args[0],
			state.buffers.get(gl.ARRAY_BUFFER),
			args.slice(1).join(':')
		);
	}
	return mapDecision(
		state.constants,
		args[0],
		Array.from(args[1] || []).join(',')
	);
}

function valueDecision(slot, value) {
	return {
		skip: slot.known && slot.value === value,
		commit() {
			slot.known = true;
			slot.value = value;
		}
	};
}

function mapDecision(map, key, value) {
	return {
		skip: map.has(key) && map.get(key) === value,
		commit: () => { map.set(key, value); }
	};
}

function pointerDecision(map, index, arrayBuffer, values) {
	const previous = map.get(index);
	return {
		skip: !!previous
			&& previous.arrayBuffer === arrayBuffer
			&& previous.values === values,
		commit: () => { map.set(index, { arrayBuffer, values }); }
	};
}

function alwaysExecute() {
	return { skip: false, commit() {} };
}

function unknownValue() {
	return { known: false, value: undefined };
}
