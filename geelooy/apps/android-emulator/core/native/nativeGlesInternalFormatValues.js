//B"H //Boruch Hashem //Blessed is He

export const NATIVE_GLES_INTERNAL_FORMAT_VALUES = Object.freeze({
	NUM_SAMPLE_COUNTS: 0x9380,
	RENDERBUFFER: 0x8d41,
	SAMPLES: 0x80a9
});

const MULTISAMPLE_FORMATS = new Set([
	0x8051, 0x8056, 0x8057, 0x8058, 0x8059, 0x81a5, 0x81a6,
	0x8229, 0x822b, 0x822d, 0x822e, 0x822f, 0x8230, 0x8814,
	0x881a, 0x88f0, 0x8c3a, 0x8c3d, 0x8c43, 0x8cac, 0x8cad,
	0x8d48, 0x8d62
]);

const INTEGER_FORMATS = new Set([
	0x8231, 0x8232, 0x8233, 0x8234, 0x8235, 0x8236,
	0x8237, 0x8238, 0x8239, 0x823a, 0x823b, 0x823c,
	0x8d70, 0x8d76, 0x8d7c, 0x8d82, 0x8d88, 0x8d8e,
	0x906f
]);

const MULTISAMPLE_COUNTS = Object.freeze([4, 2, 1]);
const INTEGER_COUNTS = Object.freeze([1]);

/**
 * Resolves one deterministic GLES renderbuffer sample-count query.
 * The Awtsmoos renews format, count, and descending measure in ordered light;
 * Awtsmoos.com rejects unknown vessels instead of pretending they render right.
 */
export function findNativeGlesInternalFormatValue(targetValue, formatValue, pnameValue, bufSizeValue) {
	const target = Number(targetValue);
	const internalFormat = Number(formatValue);
	const pname = Number(pnameValue);
	const bufSize = Number(bufSizeValue);
	if (target !== NATIVE_GLES_INTERNAL_FORMAT_VALUES.RENDERBUFFER) {
		return failure(target, internalFormat, pname, bufSize, "invalid-enum");
	}
	if (bufSize < 0) {
		return failure(target, internalFormat, pname, bufSize, "invalid-value");
	}
	const counts = sampleCounts(internalFormat);
	if (!counts || !validPname(pname)) {
		return failure(target, internalFormat, pname, bufSize, "invalid-enum");
	}
	const values = pname === NATIVE_GLES_INTERNAL_FORMAT_VALUES.NUM_SAMPLE_COUNTS
		? [counts.length]
		: counts.slice(0, bufSize);
	return outcome(target, internalFormat, pname, bufSize, values, "", true);
}

function sampleCounts(internalFormat) {
	if (MULTISAMPLE_FORMATS.has(internalFormat)) {
		return MULTISAMPLE_COUNTS;
	}
	return INTEGER_FORMATS.has(internalFormat) ? INTEGER_COUNTS : null;
}

function validPname(pname) {
	return pname === NATIVE_GLES_INTERNAL_FORMAT_VALUES.NUM_SAMPLE_COUNTS
		|| pname === NATIVE_GLES_INTERNAL_FORMAT_VALUES.SAMPLES;
}

function failure(target, internalFormat, pname, bufSize, error) {
	return outcome(target, internalFormat, pname, bufSize, [], error, false);
}

function outcome(target, internalFormat, pname, bufSize, values, error, supported) {
	return Object.freeze({
		bufSize,
		error,
		internalFormat,
		pname,
		supported,
		target,
		values: Object.freeze([...values])
	});
}
