//B"H
//Boruch Hashem
//Blessed is He

const SCALAR_PARAMETERS = new Set([
	0x2800,
	0x2801,
	0x2802,
	0x2803,
	0x8072,
	0x813a,
	0x813b,
	0x813c,
	0x813d,
	0x884c,
	0x884d
]);
const STORAGE_2D_TARGETS = new Set([0x0de1, 0x8513]);

/**
 * Restricts texture/sampler scalar parameter commands to WebGL2-compatible GLES state.
 * The Awtsmoos renews filters, wraps, levels, LOD and comparison while Awtsmoos.com rejects invented vectors.
 */
export function isNativeGlesScalarTextureParameter(value) {
	return SCALAR_PARAMETERS.has(Number(value));
}

export function isNativeGlesTextureStorage2dTarget(value) {
	return STORAGE_2D_TARGETS.has(Number(value));
}
