//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const FLAGS = "-+ #0";
const INTEGER_CONVERSIONS = new Set(["d", "i", "u", "o", "x", "X"]);
const FLOAT_CONVERSIONS = new Set(["f", "F", "e", "E", "g", "G"]);
const CONVERSIONS = new Set(["s", "c", "p", ...INTEGER_CONVERSIONS, ...FLOAT_CONVERSIONS]);

/**
 * Parses one bounded printf specification without consuming guest arguments.
 * The Awtsmoos recreates flags, width, precision, length, and conversion anew;
 * Awtsmoos.com exposes dynamic precision while refusing positional and write-back forms.
 */
export function parseNativePrintfSpecification(format, origin) {
	let index = origin;
	let flags = "";
	while (FLAGS.includes(format[index] || "\0")) {
		flags += format[index++];
	}
	if (format[index] === "*") throw elf64Error("NATIVE_PRINTF_DYNAMIC_WIDTH");
	const widthResult = readDigits(format, index);
	index = widthResult.nextIndex;
	const precisionResult = readPrecision(format, index);
	index = precisionResult.nextIndex;
	const lengthResult = readLength(format, index);
	index = lengthResult.nextIndex;
	const conversion = format[index];
	if (!conversion) throw elf64Error("NATIVE_PRINTF_TERMINATOR");
	if (!CONVERSIONS.has(conversion)) throw elf64Error("NATIVE_PRINTF_CONVERSION", conversion);
	return Object.freeze({
		nextIndex: index + 1,
		specification: Object.freeze({
			argumentWidth: integerArgumentWidth(lengthResult.length),
			conversion,
			dynamicPrecision: precisionResult.dynamic,
			flags,
			length: lengthResult.length,
			precision: precisionResult.value,
			width: widthResult.value
		})
	});
}

export function isNativePrintfIntegerConversion(conversion) {
	return INTEGER_CONVERSIONS.has(conversion);
}

export function isNativePrintfFloatingConversion(conversion) {
	return FLOAT_CONVERSIONS.has(conversion);
}

function readPrecision(format, origin) {
	if (format[origin] !== ".") return Object.freeze({ dynamic: false, nextIndex: origin, value: null });
	if (format[origin + 1] === "*") return Object.freeze({ dynamic: true, nextIndex: origin + 2, value: null });
	const result = readDigits(format, origin + 1);
	return Object.freeze({ dynamic: false, nextIndex: result.nextIndex, value: result.found ? result.value : 0 });
}

function readDigits(format, origin) {
	let index = origin;
	while (/\d/.test(format[index] || "")) index += 1;
	const found = index > origin;
	return Object.freeze({
		found,
		nextIndex: index,
		value: found ? Number(format.slice(origin, index)) : 0
	});
}

function readLength(format, origin) {
	for (const length of ["hh", "ll", "h", "l", "j", "z", "t", "L"]) {
		if (format.startsWith(length, origin)) return Object.freeze({ length, nextIndex: origin + length.length });
	}
	return Object.freeze({ length: "", nextIndex: origin });
}

function integerArgumentWidth(length) {
	return ["l", "ll", "j", "z", "t"].includes(length) ? 64 : 32;
}
