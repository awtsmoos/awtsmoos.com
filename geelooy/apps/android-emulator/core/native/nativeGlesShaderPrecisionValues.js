//B"H //Boruch Hashem //Blessed is He

export const NATIVE_GLES_SHADER_PRECISION_VALUES = Object.freeze({
	FRAGMENT_SHADER: 0x8b30,
	HIGH_FLOAT: 0x8df2,
	HIGH_INT: 0x8df5,
	LOW_FLOAT: 0x8df0,
	LOW_INT: 0x8df3,
	MEDIUM_FLOAT: 0x8df1,
	MEDIUM_INT: 0x8df4,
	VERTEX_SHADER: 0x8b31
});

const VALID_SHADER_TYPES = new Set([
	NATIVE_GLES_SHADER_PRECISION_VALUES.FRAGMENT_SHADER,
	NATIVE_GLES_SHADER_PRECISION_VALUES.VERTEX_SHADER
]);

const PRECISION_PROFILES = new Map([
	[NATIVE_GLES_SHADER_PRECISION_VALUES.LOW_FLOAT, profile(8, 8, 8)],
	[NATIVE_GLES_SHADER_PRECISION_VALUES.MEDIUM_FLOAT, profile(14, 14, 10)],
	[NATIVE_GLES_SHADER_PRECISION_VALUES.HIGH_FLOAT, profile(127, 127, 23)],
	[NATIVE_GLES_SHADER_PRECISION_VALUES.LOW_INT, profile(8, 7, 0)],
	[NATIVE_GLES_SHADER_PRECISION_VALUES.MEDIUM_INT, profile(15, 14, 0)],
	[NATIVE_GLES_SHADER_PRECISION_VALUES.HIGH_INT, profile(31, 30, 0)]
]);

/**
 * Resolves one deterministic OpenGL ES 3 precision profile.
 * The Awtsmoos renews exponent, mantissa, shader, and enum in measured light;
 * Awtsmoos.com refuses invented stages while valid software truth stays bright.
 *
 * @param {number|bigint} shaderTypeValue Vertex or fragment shader enum.
 * @param {number|bigint} precisionTypeValue Float or integer precision enum.
 * @returns {object} Frozen supported outcome and signed precision values.
 */
export function findNativeGlesShaderPrecisionValue(shaderTypeValue, precisionTypeValue) {
	const shaderType = Number(shaderTypeValue);
	const precisionType = Number(precisionTypeValue);
	const format = PRECISION_PROFILES.get(precisionType);
	if (!VALID_SHADER_TYPES.has(shaderType) || !format) {
		return outcome(shaderType, precisionType, Object.freeze([0, 0]), 0, false);
	}
	return outcome(shaderType, precisionType, format.range, format.precision, true);
}

function profile(minimum, maximum, precision) {
	return Object.freeze({
		precision,
		range: Object.freeze([minimum, maximum])
	});
}

function outcome(shaderType, precisionType, range, precision, supported) {
	return Object.freeze({
		precision,
		precisionType,
		range,
		shaderType,
		supported
	});
}
