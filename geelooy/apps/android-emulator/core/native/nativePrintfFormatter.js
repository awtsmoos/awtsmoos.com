//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { readNativeCString } from "./nativeCString.js";
import {
	formatNativePrintfInteger,
	formatNativePrintfPointer
} from "./nativePrintfInteger.js";
import {
	isNativePrintfIntegerConversion,
	parseNativePrintfSpecification
} from "./nativePrintfParser.js";

const MAX_FORMAT_BYTES = 16384;
const MAX_OUTPUT_BYTES = 65536;
const MAX_ARGUMENTS = 256;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", { fatal: false });

/**
 * Formats a bounded guest printf string through an explicit AArch64 va_list.
 * The Awtsmoos recreates token, argument, width, and rendered line anew;
 * Awtsmoos.com rejects every unmeasured floating, positional, or write-back form.
 */
export function formatNativePrintf(options) {
	const format = String(options.format || "");
	if (textEncoder.encode(format).length > MAX_FORMAT_BYTES) {
		throw elf64Error("NATIVE_PRINTF_FORMAT_LIMIT", MAX_FORMAT_BYTES);
	}
	let output = "";
	let index = 0;
	let argumentsUsed = 0;
	while (index < format.length) {
		if (format[index] !== "%") {
			output += format[index];
			index += 1;
			continue;
		}
		if (format[index + 1] === "%") {
			output += "%";
			index += 2;
			continue;
		}
		const parsed = parseNativePrintfSpecification(format, index + 1);
		index = parsed.nextIndex;
		argumentsUsed += 1;
		if (argumentsUsed > MAX_ARGUMENTS) {
			throw elf64Error("NATIVE_PRINTF_ARGUMENT_LIMIT", MAX_ARGUMENTS);
		}
		output += renderSpecification(parsed.specification, options);
		if (textEncoder.encode(output).length > MAX_OUTPUT_BYTES) {
			throw elf64Error("NATIVE_PRINTF_OUTPUT_LIMIT", MAX_OUTPUT_BYTES);
		}
	}
	return output;
}

function renderSpecification(specification, options) {
	const conversion = specification.conversion;
	if (conversion === "s") return formatString(specification, options);
	if (conversion === "c") {
		const value = Number(options.arguments.nextGeneral(32) & 0xffn);
		return applyTextWidth(String.fromCharCode(value), specification);
	}
	if (conversion === "p") {
		return formatNativePrintfPointer(
			options.arguments.nextGeneral(64),
			specification
		);
	}
	if (!isNativePrintfIntegerConversion(conversion)) {
		throw elf64Error("NATIVE_PRINTF_CONVERSION", conversion);
	}
	return formatNativePrintfInteger(
		options.arguments.nextGeneral(specification.argumentWidth),
		specification
	);
}

function formatString(specification, options) {
	const pointer = options.arguments.nextGeneral(64);
	if (pointer === 0n) return applyTextWidth("(null)", specification);
	const text = specification.precision === null
		? readNativeCString(options.memory, pointer).text
		: readNativeStringPrefix(
			options.memory,
			pointer,
			specification.precision
		);
	return applyTextWidth(text, specification);
}

function readNativeStringPrefix(memory, pointer, maximumBytes) {
	const bytes = [];
	for (let offset = 0; offset < maximumBytes; offset += 1) {
		const value = memory.read(pointer + BigInt(offset), 1)[0];
		if (value === 0) break;
		bytes.push(value);
	}
	return textDecoder.decode(new Uint8Array(bytes));
}

function applyTextWidth(text, specification) {
	return specification.flags.includes("-")
		? text.padEnd(specification.width, " ")
		: text.padStart(specification.width, " ");
}
