// B"H
// Boruch Hashem
// Blessed is He
/** Native node declarations remain small, typed, and independently inspectable. */

export function input(id, type, defaultValue = null, metadata = {}) {
	return { id, type, defaultValue, metadata };
}

export function output(id, type, metadata = {}) {
	return { id, type, metadata };
}

export function multiInput(id, type, metadata = {}) {
	return { id, type, multiInput: true, metadata };
}

/**
 * Creates one from-scratch node definition contract.
 * @param {string} type - Stable operation identifier.
 * @param {string} title - Human-readable title.
 * @param {Object[]} inputs - Typed input sockets.
 * @param {Object[]} outputs - Typed output sockets.
 * @param {Object} metadata - Domain and capability evidence.
 * @returns {Object} Definition input accepted by createNodeSchemaPack.
 */
export function node(type, title, inputs, outputs, metadata = {}) {
	const family = type.split('.')[0];
	return {
		type,
		title,
		inputs,
		outputs,
		metadata: {
			family,
			nativeSemantics: true,
			requiredCapabilities: [],
			...metadata
		}
	};
}
