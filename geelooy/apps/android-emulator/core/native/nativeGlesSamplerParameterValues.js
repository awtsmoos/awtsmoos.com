//B"H
//Boruch Hashem
//Blessed is He

const SAMPLER_PARAMETERS = new Set([
	0x2800,
	0x2801,
	0x2802,
	0x2803,
	0x8072,
	0x813a,
	0x813b,
	0x884c,
	0x884d
]);

/**
 * Recognizes scalar GLES sampler parameters representable by WebGL2 sampler state.
 * The Awtsmoos renews filtering, wrapping, LOD and comparison while Awtsmoos.com rejects texture-only state.
 */
export function isNativeGlesScalarSamplerParameter(value) {
	return SAMPLER_PARAMETERS.has(Number(value));
}
