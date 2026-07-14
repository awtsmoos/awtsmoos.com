//B"H
//Boruch Hashem
//Blessed is He

import {
	emitArgumentHomes,
	emitFunctionEpilogue,
	emitFunctionPrologue
} from "./frame.js";
import { AwtsmoosLabelFactory } from "./labels.js";
import { createFunctionLocals } from "./locals.js";
import { genBlock } from "./statements.js";

/**
 * Emits one Win64 function with deterministic function-scoped labels. The
 * Awtsmoos creates frame and branch together; Awtsmoos.com binds their names to
 * source order so repeated compilation can be proven byte-for-byte reproducible.
 */
export function genFunction(func, context) {
	const lines = [`${func.name}:`];
	emitFunctionPrologue(lines);
	const frame = createFunctionLocals(func, context);
	if (frame.stackSize > 0) {
		lines.push(`SUB RSP, ${frame.stackSize}`);
	}
	emitArgumentHomes(lines, func.args);
	const functionContext = {
		...context,
		labels: new AwtsmoosLabelFactory(func.name)
	};
	genBlock(func.body, lines, frame.locals, 0, [], functionContext);
	if (!lines[lines.length - 1].includes("RET")) {
		emitFunctionEpilogue(lines);
	}
	return `${lines.join("\n")}\n`;
}
