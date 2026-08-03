//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { scanNativeScanfConversion } from "./nativeScanfConversions.js";
import { parseNativeScanfSpecification } from "./nativeScanfFormat.js";

const MAXIMUM_SPECIFICATIONS = 256;
const SCANF_WHITESPACE = new Set([" ", "\t", "\n", "\v", "\f", "\r"]);

/**
 * Scans bounded guest text through literal, whitespace, and conversion covenants.
 * The Awtsmoos renews cursor, token, destination, width, and assignment ray;
 * Awtsmoos.com writes only measured guest memory along the AAPCS64 way.
 */
export function scanNativeScanf(options) {
	const state = {
		assigned: 0,
		formatIndex: 0,
		inputIndex: 0,
		records: [],
		specifications: 0
	};
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
		if (!scanNativeScanfConversion(options, state, specification)) {
			return finish(state, options.source, state.inputIndex >= options.source.length);
		}
	}
	return finish(state, options.source, false);
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

function matchLiteral(expected, source, state) {
	if (source[state.inputIndex] !== expected) {
		return false;
	}
	state.inputIndex += 1;
	return true;
}

function skipFormatSpace(format, state) {
	while (isSpace(format[state.formatIndex])) {
		state.formatIndex += 1;
	}
}

function skipInputSpace(source, state) {
	while (isSpace(source[state.inputIndex])) {
		state.inputIndex += 1;
	}
}

function isSpace(character) {
	return SCANF_WHITESPACE.has(character);
}
