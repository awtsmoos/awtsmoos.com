//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { parseNativeInteger } from "./nativeIntegerConversionParser.js";
import {
	nativeScanfIntegerOptions,
	parseNativeScanfSpecification
} from "./nativeScanfFormat.js";

const MAXIMUM_SPECIFICATIONS = 256;

/**
 * Scans bounded guest text through literal, whitespace, and integer covenants.
 * The Awtsmoos renews cursor, value, destination, width, and assignment ray;
 * Awtsmoos.com writes only measured guest memory along the AAPCS64 way.
 */
export function scanNativeScanf(options) {
	const state = { assigned: 0, formatIndex: 0, inputIndex: 0, records: [], specifications: 0 };
	while (state.formatIndex < options.format.length) {
		const character = options.format[state.formatIndex];
		if (isSpace(character)) {
			skipFormatSpace(options.format, state);
			skipInputSpace(options.source, state);
			continue;
		}
		if (character !== "%") {
			if (!matchLiteral(character, options.source, state)) {
				return finish(state, options.source, state.inputIndex >= options.source.length);
			}
			state.formatIndex += 1;
			continue;
		}
		if (options.format[state.formatIndex + 1] === "%") {
			if (!matchLiteral("%", options.source, state)) {
				return finish(state, options.source, state.inputIndex >= options.source.length);
			}
			state.formatIndex += 2;
			continue;
		}
		state.specifications += 1;
		if (state.specifications > MAXIMUM_SPECIFICATIONS) {
			throw elf64Error("NATIVE_SCANF_SPECIFICATION_LIMIT", MAXIMUM_SPECIFICATIONS);
		}
		const specification = parseNativeScanfSpecification(
			options.format,
			state.formatIndex + 1
		);
		state.formatIndex = specification.nextIndex;
		if (!scanInteger(options, state, specification)) {
			return finish(state, options.source, state.inputIndex >= options.source.length);
		}
	}
	return finish(state, options.source, false);
}

function scanInteger(options, state, specification) {
	skipInputSpace(options.source, state);
	if (state.inputIndex >= options.source.length) return false;
	const integerOptions = nativeScanfIntegerOptions(specification);
	const available = specification.width === null
		? options.source.slice(state.inputIndex)
		: options.source.slice(state.inputIndex, state.inputIndex + specification.width);
	const parsed = parseNativeInteger(available, integerOptions);
	if (!parsed.converted) return false;
	const start = state.inputIndex;
	state.inputIndex += parsed.endIndex;
	let destination = 0n;
	if (!specification.suppressed) {
		destination = options.arguments.nextGeneral(64);
		if (destination === 0n) throw elf64Error("NATIVE_SCANF_OUTPUT_NULL");
		options.memory.write(destination, encodeInteger(parsed.guestValue, integerOptions.width));
		state.assigned += 1;
	}
	state.records.push(Object.freeze({
		assigned: !specification.suppressed,
		conversion: specification.conversion,
		destination: destination.toString(),
		end: state.inputIndex,
		length: specification.length,
		start,
		value: parsed.guestValue.toString(),
		width: integerOptions.width
	}));
	return true;
}

function finish(state, source, inputFailure) {
	const result = inputFailure && state.assigned === 0 ? -1 : state.assigned;
	return Object.freeze({
		assigned: state.assigned,
		consumed: state.inputIndex,
		eof: state.inputIndex >= source.length,
		records: Object.freeze(state.records.slice()),
		result
	});
}

function encodeInteger(value, width) {
	const bytes = new Uint8Array(width / 8);
	const view = new DataView(bytes.buffer);
	const normalized = BigInt.asUintN(width, value);
	if (width === 8) view.setUint8(0, Number(normalized));
	else if (width === 16) view.setUint16(0, Number(normalized), true);
	else if (width === 32) view.setUint32(0, Number(normalized), true);
	else view.setBigUint64(0, normalized, true);
	return bytes;
}

function matchLiteral(expected, source, state) {
	if (source[state.inputIndex] !== expected) return false;
	state.inputIndex += 1;
	return true;
}
function skipFormatSpace(format, state) { while (isSpace(format[state.formatIndex])) state.formatIndex += 1; }
function skipInputSpace(source, state) { while (isSpace(source[state.inputIndex])) state.inputIndex += 1; }
function isSpace(character) { return [" ", "\t", "\n", "\v", "\f", "\r"].includes(character); }
