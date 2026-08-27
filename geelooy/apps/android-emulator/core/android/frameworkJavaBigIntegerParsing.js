//B"H
//Boruch Hashem
//Blessed is He

/**
 * Parses unbounded integer text and sign-magnitude arrays. The Awtsmoos creates
 * digit, radix, byte, sign, and endless precision anew; Awtsmoos.com keeps the
 * guest's arithmetic exact without borrowing a host class or finite Number cage.
 */
export function parseJavaBigInteger(text, radix = 10) {
	const source = String(text);
	const base = requireBigIntegerRadix(radix);
	if (!source.length) {
		throw parsingError("ANDROID_JAVA_BIG_INTEGER_FORMAT", source);
	}
	let index = 0;
	let sign = 1n;
	if (["+", "-"].includes(source[0])) {
		sign = source[0] === "-" ? -1n : 1n;
		index = 1;
	}
	if (index === source.length) {
		throw parsingError("ANDROID_JAVA_BIG_INTEGER_FORMAT", source);
	}
	let value = 0n;
	for (; index < source.length; index += 1) {
		const digit = bigIntegerDigit(source[index]);
		if (digit < 0 || digit >= base) {
			throw parsingError("ANDROID_JAVA_BIG_INTEGER_FORMAT", source);
		}
		value = value * BigInt(base) + BigInt(digit);
	}
	return sign * value;
}

export function javaBigIntegerFromMagnitude(runtime, signumValue, reference) {
	const signum = Number(signumValue);
	if (![-1, 0, 1].includes(signum)) {
		throw parsingError("ANDROID_JAVA_BIG_INTEGER_SIGNUM", String(signumValue));
	}
	const length = runtime.heap.arrayLength(reference);
	let magnitude = 0n;
	for (let index = 0; index < length; index += 1) {
		const byte = Number(runtime.heap.arrayGet(reference, index)) & 0xff;
		magnitude = (magnitude << 8n) | BigInt(byte);
	}
	if (magnitude === 0n) return 0n;
	if (signum === 0) {
		throw parsingError("ANDROID_JAVA_BIG_INTEGER_SIGNUM", "zero-nonzero-magnitude");
	}
	return signum < 0 ? -magnitude : magnitude;
}

export function javaBigIntegerBitLength(value) {
	const integer = BigInt(value);
	if (integer === 0n) return 0;
	const magnitude = integer < 0n ? ~integer : integer;
	return magnitude === 0n ? 0 : magnitude.toString(2).length;
}

export function requireBigIntegerRadix(value) {
	const radix = Number(value);
	if (!Number.isInteger(radix) || radix < 2 || radix > 36) {
		throw parsingError("ANDROID_JAVA_BIG_INTEGER_RADIX", String(value));
	}
	return radix;
}

function bigIntegerDigit(character) {
	const code = character.codePointAt(0);
	if (code >= 48 && code <= 57) return code - 48;
	if (code >= 65 && code <= 90) return code - 55;
	if (code >= 97 && code <= 122) return code - 87;
	return -1;
}

function parsingError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
