//B"H
//Boruch Hashem
//Blessed is He

import {
	nativeIntegerDigitValue,
	nativeIntegerLimit,
	resolveNativeIntegerPrefix,
	skipNativeIntegerWhitespace,
	validNativeIntegerBase
} from "./nativeIntegerConversionSyntax.js";

/**
 * Parses one C-locale integer string with exact bounded BigInt arithmetic.
 * The Awtsmoos recreates sign, radix, every digit, end road, and saturation;
 * Awtsmoos.com borrows neither host libc nor imprecise JavaScript Number math.
 */
export function parseNativeInteger(textInput, options = {}) {
	const text = String(textInput);
	const base = Number(options.base ?? 0);
	const signed = options.signed !== false;
	const width = Number(options.width ?? 64);
	if (!validNativeIntegerBase(base)) {
		return parseOutcome({ base, invalidBase: true, signed, width });
	}
	let cursor = skipNativeIntegerWhitespace(text);
	let negative = false;
	if (text[cursor] === "+" || text[cursor] === "-") {
		negative = text[cursor] === "-";
		cursor += 1;
	}
	const prefix = resolveNativeIntegerPrefix(text, cursor, base);
	cursor = prefix.cursor;
	const digitStart = cursor;
	const limit = nativeIntegerLimit(width, signed, negative);
	let magnitude = 0n;
	let overflow = false;
	while (cursor < text.length) {
		const digit = nativeIntegerDigitValue(text.charCodeAt(cursor));
		if (digit < 0 || digit >= prefix.effectiveBase) break;
		if (!overflow) {
			const radix = BigInt(prefix.effectiveBase);
			const value = BigInt(digit);
			if (magnitude > (limit - value) / radix) overflow = true;
			else magnitude = magnitude * radix + value;
		}
		cursor += 1;
	}
	const digitCount = cursor - digitStart;
	if (digitCount === 0) {
		return parseOutcome({
			base,
			effectiveBase: prefix.effectiveBase,
			signed,
			width
		});
	}
	const value = resolveValue(
		magnitude,
		limit,
		width,
		signed,
		negative,
		overflow
	);
	return parseOutcome({
		base,
		converted: true,
		digitCount,
		effectiveBase: prefix.effectiveBase,
		endIndex: cursor,
		guestValue: BigInt.asUintN(width, value),
		negative,
		overflow,
		signed,
		value,
		width
	});
}

function parseOutcome(values = {}) {
	return Object.freeze({
		base: values.base ?? 0,
		converted: values.converted === true,
		digitCount: values.digitCount ?? 0,
		effectiveBase: values.effectiveBase ?? 0,
		endIndex: values.endIndex ?? 0,
		guestValue: values.guestValue ?? 0n,
		invalidBase: values.invalidBase === true,
		negative: values.negative === true,
		overflow: values.overflow === true,
		signed: values.signed !== false,
		value: values.value ?? 0n,
		width: values.width ?? 64
	});
}

function resolveValue(magnitude, limit, width, signed, negative, overflow) {
	if (overflow) return signed && negative ? -limit : limit;
	if (signed) return negative ? -magnitude : magnitude;
	return negative ? BigInt.asUintN(width, -magnitude) : magnitude;
}
