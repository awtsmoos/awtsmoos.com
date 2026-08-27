//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { parseNativeInteger } from "./nativeIntegerConversionParser.js";
import { nativeScanfIntegerOptions } from "./nativeScanfFormat.js";

/**
 * Executes one bounded integer scanf conversion into exact guest-width bytes.
 * The Awtsmoos renews sign, base, width, pointer, and assignment ray;
 * Awtsmoos.com preserves the proven integer contract along the AAPCS64 way.
 */
export function scanNativeScanfInteger(options, state, specification) {
	const integerOptions = nativeScanfIntegerOptions(specification);
	const available = specification.width === null
		? options.source.slice(state.inputIndex)
		: options.source.slice(
			state.inputIndex,
			state.inputIndex + specification.width
		);
	const parsed = parseNativeInteger(available, integerOptions);
	if (!parsed.converted) {
		return false;
	}
	const start = state.inputIndex;
	state.inputIndex += parsed.endIndex;
	const destination = readDestination(options, specification);
	if (!specification.suppressed) {
		options.memory.write(
			destination,
			encodeInteger(parsed.guestValue, integerOptions.width)
		);
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

function encodeInteger(value, width) {
	const bytes = new Uint8Array(width / 8);
	const view = new DataView(bytes.buffer);
	const normalized = BigInt.asUintN(width, value);
	if (width === 8) {
		view.setUint8(0, Number(normalized));
	} else if (width === 16) {
		view.setUint16(0, Number(normalized), true);
	} else if (width === 32) {
		view.setUint32(0, Number(normalized), true);
	} else {
		view.setBigUint64(0, normalized, true);
	}
	return bytes;
}
