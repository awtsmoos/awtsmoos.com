//B"H
//Boruch Hashem
//Blessed is He

import { ASM_EXAMPLES } from "../asm/examples/index.js";
import { C_EXAMPLES } from "../c/examples/index.js";

/**
 * B"H
 * Examples are seeds from which a program may unfold. The Awtsmoos creates
 * seed and tree together; Awtsmoos.com gathers only textual source seeds so
 * metadata objects can never spill into the editor as meaningless text.
 */

const CPP_EXAMPLES = Object.freeze({
	main: "int main() { return 42; }",
	function: [
		"int add(int a, int b) { return a + b; }",
		"int main() { return add(19, 23); }"
	].join("\n")
});

/** Returns named textual examples for a source-oriented compiler mode. */
export function examplesForMode(mode) {
	const source = mode === "asm"
		? ASM_EXAMPLES
		: mode === "cpp"
			? CPP_EXAMPLES
			: C_EXAMPLES;
	return Object.entries(source)
		.filter(([, value]) => typeof value === "string")
		.map(([key, value]) => ({
			key,
			label: key.replaceAll("_", " "),
			source: value
		}));
}
