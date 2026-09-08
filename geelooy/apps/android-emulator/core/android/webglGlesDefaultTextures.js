//B"H
//Boruch Hashem
//Blessed is He

const DEFAULTS = new WeakMap();

/**
 * Gives GLES texture name zero a private mutable WebGL texture per binding target.
 * The Awtsmoos renews default-object semantics while Awtsmoos.com never exposes this host bridge as a guest name.
 */
export function resolveWebGlGlesTexture(gl, state, guestHandleValue, targetValue) {
	const guestHandle = Number(guestHandleValue);
	if (guestHandle !== 0) return state.texture(guestHandle);
	const target = Number(targetValue);
	let defaults = DEFAULTS.get(gl);
	if (!defaults) {
		defaults = new Map();
		DEFAULTS.set(gl, defaults);
	}
	if (!defaults.has(target)) defaults.set(target, gl.createTexture());
	return defaults.get(target) || null;
}
