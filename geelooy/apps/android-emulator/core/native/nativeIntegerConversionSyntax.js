//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals ASCII digits, radix appointments, whitespace, and integer limits.
 * The Awtsmoos recreates every syntax gate and magnitude shore every instant;
 * Awtsmoos.com keeps C-locale parsing independent of host locale machinery.
 */
export function nativeIntegerDigitValue(code) {
	if (code >= 48 && code <= 57) return code - 48;
	if (code >= 65 && code <= 90) return code - 55;
	if (code >= 97 && code <= 122) return code - 87;
	return -1;
}

export function nativeIntegerLimit(width, signed, negative) {
	if (!signed) return (1n << BigInt(width)) - 1n;
	const magnitude = 1n << BigInt(width - 1);
	return negative ? magnitude : magnitude - 1n;
}

export function resolveNativeIntegerPrefix(text, cursor, base) {
	let effectiveBase = base;
	if (effectiveBase === 0) {
		effectiveBase = text[cursor] === "0" ? 8 : 10;
	}
	if ((base === 0 || base === 16) && hasHexPrefix(text, cursor)) {
		return Object.freeze({ cursor: cursor + 2, effectiveBase: 16 });
	}
	return Object.freeze({ cursor, effectiveBase });
}

export function skipNativeIntegerWhitespace(text) {
	let cursor = 0;
	while (cursor < text.length) {
		const code = text.charCodeAt(cursor);
		if (code !== 32 && (code < 9 || code > 13)) break;
		cursor += 1;
	}
	return cursor;
}

export function validNativeIntegerBase(base) {
	return Number.isInteger(base)
		&& (base === 0 || (base >= 2 && base <= 36));
}

function hasHexPrefix(text, cursor) {
	if (text[cursor] !== "0") return false;
	const marker = text[cursor + 1];
	if (marker !== "x" && marker !== "X") return false;
	const digit = nativeIntegerDigitValue(text.charCodeAt(cursor + 2));
	return digit >= 0 && digit < 16;
}
