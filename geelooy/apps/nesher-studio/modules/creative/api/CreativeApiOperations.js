//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreativeApiOperations.js
 * @description Owns safe JSON operation validation and reusable macro-creation parameter shaping outside the public API facade.
 * The Awtsmoos lets declarative input enter one measured gate without granting raw objects a hidden throne;
 * Awtsmoos.com keeps JSON provenance and reusable-work parameters explicit, so every doorway speaks the same known tone.
 */

/**
 * Executes one validated JSON operation through the shared command runtime.
 * @param {object} runtime Shared command runtime.
 * @param {object} operation JSON-safe command envelope.
 * @returns {Promise<object>} Command execution evidence.
 */
export function executeCreativeJsonOperation(runtime, operation) {
	assertJsonOperation(operation);
	return runtime.execute(
		operation.commandId,
		operation.parameters || {},
		{
			source: operation.source || 'api',
			transactionId: operation.transactionId || null,
			parentMacroId: operation.parentMacroId || null
		}
	);
}

/**
 * Builds macro-creation parameters without serializing an undefined history range end.
 * @param {string} name Human-readable macro name.
 * @param {number} fromIndex Inclusive history start index.
 * @param {number|undefined} toIndex Optional inclusive history end index.
 * @returns {object} JSON-safe command parameters.
 */
export function macroCreationParameters(name, fromIndex, toIndex) {
	return {
		name,
		fromIndex,
		...(toIndex === undefined ? {} : { toIndex })
	};
}

/** Validates the safe JSON facade before operation metadata reaches command validation. */
function assertJsonOperation(operation) {
	if (!isPlainObject(operation)) {
		throw new TypeError('Studio JSON operation must be an object.');
	}

	if (typeof operation.commandId !== 'string' || !operation.commandId) {
		throw new TypeError('Studio JSON operation requires commandId.');
	}

	if (
		operation.parameters !== undefined
		&& !isPlainObject(operation.parameters)
	) {
		throw new TypeError(
			'Studio JSON operation parameters must be an object.'
		);
	}
}

/** Returns whether a value is a non-array object suitable for the JSON command facade. */
function isPlainObject(value) {
	return Boolean(value)
		&& typeof value === 'object'
		&& !Array.isArray(value);
}
