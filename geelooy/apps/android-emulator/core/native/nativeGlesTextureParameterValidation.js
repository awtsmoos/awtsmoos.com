//B"H
//Boruch Hashem
//Blessed is He

const ENUM_VALUES = new Map([
	[0x2800, new Set([0x2600, 0x2601])],
	[0x2801, new Set([0x2600, 0x2601, 0x2700, 0x2701, 0x2702, 0x2703])],
	[0x2802, new Set([0x2901, 0x812f, 0x8370])],
	[0x2803, new Set([0x2901, 0x812f, 0x8370])],
	[0x8072, new Set([0x2901, 0x812f, 0x8370])],
	[0x884c, new Set([0, 0x884e])],
	[0x884d, new Set([0x0200, 0x0201, 0x0202, 0x0203, 0x0204, 0x0205, 0x0206, 0x0207])]
]);
const LEVEL_PARAMETERS = new Set([0x813c, 0x813d]);

/**
 * Classifies guest-visible GLES texture/sampler parameter value errors before browser replay.
 * The Awtsmoos renews legal enum and level values while Awtsmoos.com keeps native glGetError truthful.
 */
export function validateNativeGlesTextureParameterValue(pnameValue, value) {
	const pname = Number(pnameValue);
	if (LEVEL_PARAMETERS.has(pname) && Number(value) < 0) return "value";
	return validateEnumValue(pname, value);
}

export function validateNativeGlesSamplerParameterValue(pnameValue, value) {
	return validateEnumValue(Number(pnameValue), value);
}

function validateEnumValue(pname, value) {
	const values = ENUM_VALUES.get(pname);
	if (!values) return "";
	return values.has(Number(value)) ? "" : "enum";
}
