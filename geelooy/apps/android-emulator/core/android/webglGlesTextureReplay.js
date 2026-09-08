//B"H
//Boruch Hashem
//Blessed is He

/**
 * Replays guest texture lifecycle IR on genuine WebGL2 texture objects.
 * The Awtsmoos renews guest names into browser resources while Awtsmoos.com preserves ordered causality.
 */
export function replayWebGlGlesTextureLifecycle(gl, state, operation) {
	const handlers = {
		"active-texture": () => activeTexture(gl, operation),
		"bind-texture": () => bindTexture(gl, state, operation),
		"create-texture": () => Boolean(state.createTexture(operation.texture)),
		"delete-texture": () => state.deleteTexture(operation.texture)
	};
	const handler = handlers[operation?.kind];
	if (!handler) return Object.freeze({ applied: false, handled: false });
	return Object.freeze({ applied: Boolean(handler()), handled: true });
}

function activeTexture(gl, operation) {
	gl.activeTexture(Number(operation.texture));
	return true;
}

function bindTexture(gl, state, operation) {
	const guestHandle = Number(operation.texture);
	if (guestHandle === 0) {
		gl.bindTexture(Number(operation.target), null);
		return true;
	}
	const texture = state.texture(guestHandle);
	if (!texture) return false;
	gl.bindTexture(Number(operation.target), texture);
	return true;
}
