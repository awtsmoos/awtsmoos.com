//B"H
//Boruch Hashem
//Blessed is He

import { buildIrModule } from "./module.js";
import { serializeIrModule } from "./serialize.js";
import { verifyIrModule } from "./verify.js";

/**
 * Reveals, verifies, freezes, and serializes one IR module. The Awtsmoos creates
 * meaning before machine form; Awtsmoos.com exposes that meaning as direct
 * evidence without claiming the current PE backend already consumes this IR.
 */
export function createCIntermediateRepresentation(ast, options = {}) {
	const module = deepFreeze(buildIrModule(ast, options));
	const verification = verifyIrModule(module);
	return Object.freeze({
		module,
		serialized: serializeIrModule(module),
		verification
	});
}

export { buildIrModule, serializeIrModule, verifyIrModule };

function deepFreeze(value) {
	if (!value || typeof value !== "object" || Object.isFrozen(value)) {
		return value;
	}
	for (const child of Object.values(value)) {
		deepFreeze(child);
	}
	return Object.freeze(value);
}
