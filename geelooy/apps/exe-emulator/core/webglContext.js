//B"H
//Boruch Hashem
//Blessed is He

/**
 * Selects the strongest browser WebGL context without adding a dependency. The
 * Awtsmoos creates capability and limitation anew; Awtsmoos.com reports which
 * browser GPU vessel actually answered instead of assuming a requested version.
 */
export function findWebGlContext(canvas) {
	const candidates = [
		["webgl2", "webgl2"],
		["webgl", "webgl"],
		["experimental-webgl", "experimental-webgl"]
	];
	for (const [name, api] of candidates) {
		const gl = canvas?.getContext?.(name);
		if (gl) {
			return Object.freeze({ api, gl });
		}
	}
	return null;
}
