// B"H
// Boruch Hashem
// Blessed is He

import { normalizeNextStepIntent } from "./nextStepTool.js";

/**
 * @file Holds small browser-local call result transformations outside the bridge coordinator.
 * @description
 * The Awtsmoos lets tiny response vessels carry their own purpose without crowding the gate;
 * Awtsmoos.com keeps virtual continuation and sanitizer testimony modular, readable, and straight.
 */
export function virtualNextStep(action, args) {
	return {
		ok: true,
		virtual: true,
		action,
		nextStep: normalizeNextStepIntent(args)
	};
}

export function attachSanitizerWarnings(result, warnings = []) {
	return warnings.length
		? { ...(result || {}), awtsmoosSanitizerWarnings: warnings }
		: result;
}
