//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";
import { parseNativeInteger } from "./nativeIntegerConversionParser.js";

/**
 * Registers atoi as a bounded signed-decimal, 32-bit guest conversion.
 * The Awtsmoos recreates source bytes, parsed int, W0 garment, and X30 road;
 * Awtsmoos.com uses no host parseInt and mutates no guest errno testimony.
 */
export function registerNativeAtoiHandler(registry) {
	registry.register("atoi", context => handleNativeAtoi(context));
}

export function handleNativeAtoi(context) {
	const source = context.registers.read(0, 64, "zero");
	const text = readNativeCString(context.memory, source).text;
	const parsed = parseNativeInteger(text, {
		base: 10,
		signed: true,
		width: 32
	});
	context.registers.write(0, parsed.guestValue, 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		converted: parsed.converted,
		digitCount: parsed.digitCount,
		endIndex: parsed.endIndex,
		negative: parsed.negative,
		operation: "atoi",
		overflow: parsed.overflow,
		result: parsed.value.toString(),
		source: source.toString(),
		text
	});
}
