// B"H
// Boruch Hashem
// Blessed is He

import { CLexerError } from "./error.js";

/**
 * Reads bounded C integer literals: hexadecimal, binary, octal, and decimal,
 * each with optional u/l/ll suffixes in any case and order. The Awtsmoos
 * canonicalizes every base to decimal; malformed literals fail closed.
 *
 * Also reads C floating literals on the decimal road only: digits with a
 * fraction (12.5), a trailing dot (12.), and/or a decimal exponent (1e3,
 * 1.5e-3), with an optional f/F suffix selecting float over double. Hex,
 * binary, and octal forms never become floats; malformed floats fail closed.
 * Returns floatKind "float"|"double" for floating literals, null otherwise.
 */
export function readNumber(source, cursor, line, col) {
	const startCol = col;
	const startCursor = cursor;
	let value = "";
	let floatKind = null;
	if (/^0[xX]/.test(source.slice(cursor, cursor + 2))) {
		cursor += 2;
		col += 2;
		const start = cursor;
		while (/[0-9A-Fa-f]/.test(source[cursor] || "")) {
			value += source[cursor++];
			col += 1;
		}
		if (cursor === start) throw new CLexerError("C_HEX_LITERAL", "Hex literal has no digits", line, startCol);
		value = BigInt(`0x${value}`).toString(10);
	} else if (/^0[bB]/.test(source.slice(cursor, cursor + 2))) {
		cursor += 2;
		col += 2;
		const start = cursor;
		while (/[01]/.test(source[cursor] || "")) {
			value += source[cursor++];
			col += 1;
		}
		if (cursor === start) throw new CLexerError("C_BINARY_LITERAL", "Binary literal has no digits", line, startCol);
		value = BigInt(`0b${value}`).toString(10);
	} else {
		while (/[0-9]/.test(source[cursor] || "")) {
			value += source[cursor++];
			col += 1;
		}
		if (value.length > 1 && value.startsWith("0")) {
			if (!/^[0-7]+$/.test(value)) {
				throw new CLexerError("C_OCTAL_DIGIT", "Octal literal has non-octal digits", line, startCol);
			}
			value = BigInt(`0o${value}`).toString(10);
		} else {
			const scanned = scanFloatTail(source, cursor, line, col, startCol, value);
			if (scanned) {
				return scanned;
			}
		}
	}
	const suffix = readIntegerSuffix(source, cursor, line, col, startCol);
	cursor = suffix.cursor;
	col = suffix.col;
	return { value, raw: source.slice(startCursor, cursor), cursor, line, col, startCol, floatKind };
}

/**
 * Scans the floating tail after decimal digits: optional fraction, optional
 * exponent, optional f/F suffix. Returns null when no float marker follows
 * (the literal stays an integer); otherwise the complete float token scan.
 */
function scanFloatTail(source, cursor, line, col, startCol, leadingDigits) {
	const startCursor = cursor - leadingDigits.length;
	let text = leadingDigits;
	let isFloat = false;
	if (source[cursor] === "." && /[0-9]/.test(source[cursor + 1] || "")) {
		isFloat = true;
		text += source[cursor++];
		col += 1;
		while (/[0-9]/.test(source[cursor] || "")) {
			text += source[cursor++];
			col += 1;
		}
	} else if (source[cursor] === ".") {
		// Trailing dot: `12.` or `12.f` — but not `12.foo` (member-looking).
		const afterDot = source[cursor + 1] || "";
		const afterSuffix = source[cursor + 2] || "";
		if (afterDot === "f" || afterDot === "F") {
			if (/[0-9A-Za-z_]/.test(afterSuffix)) return null;
			isFloat = true;
			text += source[cursor++];
			col += 1;
		} else if (!/[0-9A-Za-z_]/.test(afterDot)) {
			isFloat = true;
			text += source[cursor++];
			col += 1;
		}
	}
	if (source[cursor] === "e" || source[cursor] === "E") {
		const afterE = source[cursor + 1] === "+" || source[cursor + 1] === "-"
			? cursor + 2
			: cursor + 1;
		if (/[0-9]/.test(source[afterE] || "")) {
			isFloat = true;
			text += source[cursor++];
			col += 1;
			if (source[cursor] === "+" || source[cursor] === "-") {
				text += source[cursor++];
				col += 1;
			}
			while (/[0-9]/.test(source[cursor] || "")) {
				text += source[cursor++];
				col += 1;
			}
		}
	}
	if (!isFloat) return null;
	let floatKind = "double";
	if (source[cursor] === "f" || source[cursor] === "F") {
		floatKind = "float";
		cursor += 1;
		col += 1;
	}
	return {
		value: text,
		raw: source.slice(startCursor, cursor),
		cursor,
		line,
		col,
		startCol,
		floatKind
	};
}

/** Consumes a C integer suffix (u, l, ll and case/order mixes); rejects junk. */
function readIntegerSuffix(source, cursor, line, col, startCol) {
	let suffix = "";
	while (/[uUlL]/.test(source[cursor] || "")) {
		suffix += source[cursor++];
		col += 1;
	}
	if (suffix && !/^(?:[uU](?:[lL]{1,2})?|[lL]{1,2}[uU]?)$/.test(suffix)) {
		throw new CLexerError("C_INTEGER_SUFFIX", `Invalid integer suffix '${suffix}'`, line, startCol);
	}
	return { cursor, col };
}
