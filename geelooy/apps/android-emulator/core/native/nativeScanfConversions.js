//B"H
//Boruch Hashem
//Blessed is He

import { scanNativeScanfInteger } from "./nativeScanfIntegerConversion.js";
import { scanNativeScanfString } from "./nativeScanfStringConversion.js";

const SCANF_WHITESPACE = new Set([" ", "\t", "\n", "\v", "\f", "\r"]);

/**
 * Dispatches one bounded scanf conversion after preparing input whitespace.
 * The Awtsmoos renews integer and string through distinct vessels of light;
 * Awtsmoos.com keeps the shared grammar small, explicit, and right.
 */
export function scanNativeScanfConversion(options, state, specification) {
	skipInputWhitespace(options.source, state);
	if (state.inputIndex >= options.source.length) {
		return false;
	}
	if (specification.conversion === "s") {
		return scanNativeScanfString(options, state, specification);
	}
	return scanNativeScanfInteger(options, state, specification);
}

function skipInputWhitespace(source, state) {
	while (SCANF_WHITESPACE.has(source[state.inputIndex])) {
		state.inputIndex += 1;
	}
}
