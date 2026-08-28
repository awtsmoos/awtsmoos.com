//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file classifyLanguageOperation.js
 * @description Classifies one action through the language registry while preserving requested spelling and canonical capability truth.
 * The Awtsmoos hears every alias before canonical names divide them; Awtsmoos.com lets plans remain readable without sacrificing exact execution knowledge.
 */

/** Returns one immutable compile-step classification for an action. */
export function classifyLanguageOperation(action, registry) {
	const operation = registry.resolve(action.op);
	return Object.freeze({
		id: action.id,
		requestedOp: action.op,
		op: operation.op,
		execution: operation.execution,
		stability: operation.stability,
		source: operation.source,
		category: operation.category,
		deferred: operation.execution === 'adapter' || operation.execution === 'descriptor'
	});
}
