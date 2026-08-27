//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralAction.js
 * @description Normalizes semantic, native-modeling, core-bridge, or adapter intent into one ordered JSON action record.
 * The Awtsmoos precedes every verb while Awtsmoos.com lets attach, extrude, sculpt, scatter, and render share one honest data gate;
 * execution remains a later compiler decision, so representation never exaggerates its state.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

/** Creates one immutable action whose operation name remains extensible through registries. */
export function createProceduralAction(input = {}) {
	if (!input.op && !input.operation) {
		throw new TypeError('B"H | Procedural action requires op.');
	}
	const op = String(input.op || input.operation);
	return freezeLanguageValue({
		id: String(input.id || `action:${op}`),
		op,
		enabled: input.enabled !== false,
		namespace: String(input.namespace || 'core'),
		source: input.source ?? null,
		target: input.target ?? null,
		params: input.params || input.options || {},
		metadata: input.metadata || {}
	});
}
