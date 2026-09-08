//B"H
//Boruch Hashem
//Blessed is He

/**
 * Replays guest sampler lifecycle and parameters on genuine WebGL2 sampler objects.
 * The Awtsmoos renews unit binding without confusing sampler names with textures on Awtsmoos.com.
 */
export function replayWebGlGlesSampler(gl, state, operation) {
	const handlers = {
		"bind-sampler": () => bindSampler(gl, state, operation),
		"create-sampler": () => Boolean(state.createSampler(operation.sampler)),
		"delete-sampler": () => state.deleteSampler(operation.sampler),
		"sampler-parameter": () => samplerParameter(gl, state, operation)
	};
	const handler = handlers[operation?.kind];
	if (!handler) return Object.freeze({ applied: false, handled: false });
	return Object.freeze({ applied: Boolean(handler()), handled: true });
}

function bindSampler(gl, state, operation) {
	const handle = Number(operation.sampler);
	const sampler = handle === 0 ? null : state.sampler(handle);
	if (handle !== 0 && !sampler) return false;
	gl.bindSampler(Number(operation.unit), sampler);
	return true;
}

function samplerParameter(gl, state, operation) {
	const sampler = state.sampler(Number(operation.sampler));
	if (!sampler) return false;
	const method = operation.valueType === "float" ? "samplerParameterf" : "samplerParameteri";
	gl[method](sampler, Number(operation.pname), Number(operation.value));
	return true;
}
