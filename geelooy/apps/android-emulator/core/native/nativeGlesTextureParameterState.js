//B"H
//Boruch Hashem
//Blessed be He

const STATES = new WeakMap();
const DEFAULTS = new Map([
	[0x2800, 0x2601],
	[0x2801, 0x2702],
	[0x2802, 0x2901],
	[0x2803, 0x2901],
	[0x8072, 0x2901],
	[0x813a, -1000],
	[0x813b, 1000],
	[0x813c, 0],
	[0x813d, 1000],
	[0x884c, 0],
	[0x884d, 0x0203]
]);

/**
 * Retains scalar texture parameters by context, object name, target, and pname.
 * Default-object name zero is intentionally represented too, so queries remain
 * correct even when an application configures the target's default texture.
 */
export function getNativeGlesTextureParameterState(textureState) {
	if (!STATES.has(textureState)) STATES.set(textureState, createState());
	return STATES.get(textureState);
}

/** Creates one isolated texture-parameter map. */
function createState() {
	const values = new Map();
	return Object.freeze({
		get(context, handle, target, pname) {
			const key = parameterKey(context, handle, target, pname);
			return values.has(key) ? values.get(key) : DEFAULTS.get(Number(pname));
		},
		set(context, handle, target, pname, value) {
			values.set(parameterKey(context, handle, target, pname), Number(value));
		}
	});
}

/** Forms a collision-free context/object/target/property identity. */
function parameterKey(context, handle, target, pname) {
	return `${BigInt(context)}:${Number(handle)}:${Number(target)}:${Number(pname)}`;
}
