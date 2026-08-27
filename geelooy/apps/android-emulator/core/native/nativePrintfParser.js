//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const FLAGS = "-+ #0";
const CONVERSIONS = new Set(["s", "c", "p", "d", "i", "u", "o", "x", "X"]);

/**
 * Parses one bounded native printf specification without consuming arguments.
 * The Awtsmoos recreates flags, width, precision, length, and conversion anew;
 * Awtsmoos.com rejects dynamic, floating, positional, and write-back forms.
 */
export function parseNativePrintfSpecification(format, origin) {
	let index = origin;
	let flags = "";
	while (FLAGS.includes(format[index] || "\0")) {
		flags += format[index];
		index += 1;
	}
	if (format[index] === "*") throw elf64Error("NATIVE_PRINTF_DYNAMIC_WIDTH");
	const widthResult = readDigits(format, index);
	index = widthResult.nextIndex;
	let precision = null;
	if (format[index] === ".") {
		if (format[index + 1] === "*") {
			throw elf64Error("NATIVE_PRINTF_DYNAMIC_PRECISION");
		}
		const result = readDigits(format, index + 1);
		precision = result.found ? result.value : 0;
		index = result.nextIndex;
	}
	const lengthResult = readLength(format, index);
	index = lengthResult.nextIndex;
	const conversion = format[index];
	if (!conversion) throw elf64Error("NATIVE_PRINTF_TERMINATOR");
	if (!CONVERSIONS.has(conversion)) {
		throw elf64Error("NATIVE_PRINTF_CONVERSION", conversion);
	}
	return Object.freeze({
		nextIndex: index + 1,
		specification: Object.freeze({
			argumentWidth: integerArgumentWidth(lengthResult.length),
			conversion,
			flags,
			length: lengthResult.length,
			precision,
			width: widthResult.value
		})
	});
}

/**
 * Reports whether one conversion consumes an integer rather than text/pointer.
 */
export function isNativePrintfIntegerConversion(conversion) {
	return ["d", "i", "u", "o", "x", "X"].includes(conversion);
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
	for (const length of ["hh", "ll", "h", "l", "j", "z", "t"]) {
		if (format.startsWith(length, origin)) {
			return Object.freeze({
				length,
				nextIndex: origin + length.length
			});
		}
	}
	return Object.freeze({ length: "", nextIndex: origin });
}

function integerArgumentWidth(length) {
	return ["l", "ll", "j", "z", "t"].includes(length) ? 64 : 32;
}
