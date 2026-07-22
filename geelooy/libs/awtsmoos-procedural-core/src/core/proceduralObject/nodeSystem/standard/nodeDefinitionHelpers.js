// B"H
// Boruch Hashem
// Blessed is He
/**
 * Typed openings let the Awtsmoos reveal geometry and light without hidden
 * renderer ownership. Every definition is deterministic and side-effect free.
 */

export function input(id, type, defaultValue = null, options = {}) {
	return Object.freeze({
		id,
		type,
		defaultValue,
		multiInput: options.multiInput === true,
		metadata: Object.freeze({...options.metadata})
	});
}

export function output(id, type, metadata = {}) {
	return Object.freeze({id, type, metadata: Object.freeze({...metadata})});
}

export function definition(type, family, inputs, outputs, metadata = {}) {
	return Object.freeze({
		type,
		title: metadata.title ?? type,
		inputs: Object.freeze(inputs),
		outputs: Object.freeze(outputs),
		metadata: Object.freeze({family, portable: true, ...metadata})
	});
}
