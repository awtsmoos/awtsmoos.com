//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const SCANF_WHITESPACE = new Set([" ", "\t", "\n", "\v", "\f", "\r"]);
const textEncoder = new TextEncoder();

/**
 * Executes one bounded narrow-string scanf conversion with a guest NUL byte.
 * The Awtsmoos renews token, width, pointer, byte, and assignment ray;
 * Awtsmoos.com writes measured UTF-8 guest memory along the AAPCS64 way.
 */
export function scanNativeScanfString(options, state, specification) {
	if (specification.length !== "") {
		throw elf64Error(
			"NATIVE_SCANF_STRING_LENGTH",
			specification.length
		);
	}
	const start = state.inputIndex;
	const maximumCharacters = specification.width ?? Number.MAX_SAFE_INTEGER;
	while (canConsume(options.source, state.inputIndex, start, maximumCharacters)) {
		state.inputIndex += 1;
	}
	if (state.inputIndex === start) {
		return false;
	}
	const value = options.source.slice(start, state.inputIndex);
	const destination = readDestination(options, specification);
	const bytes = textEncoder.encode(value);
	if (!specification.suppressed) {
		const terminated = new Uint8Array(bytes.length + 1);
		terminated.set(bytes);
		options.memory.write(destination, terminated);
		state.assigned += 1;
	}
	state.records.push(Object.freeze({
		assigned: !specification.suppressed,
		byteLength: bytes.length,
		conversion: "s",
		destination: destination.toString(),
		end: state.inputIndex,
		length: specification.length,
		start,
		value,
		width: specification.width
	}));
	return true;
}

function canConsume(source, inputIndex, start, maximumCharacters) {
	return inputIndex < source.length
		&& !SCANF_WHITESPACE.has(source[inputIndex])
		&& inputIndex - start < maximumCharacters;
}

function readDestination(options, specification) {
	if (specification.suppressed) {
		return 0n;
	}
	const destination = options.arguments.nextGeneral(64);
	if (destination === 0n) {
		throw elf64Error("NATIVE_SCANF_OUTPUT_NULL");
	}
	return destination;
}
