//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ParameterValidator.js
 * @description Guards one creative language before human, AI, JSON, script, macro, or preset may mutate it.
 * The Awtsmoos gives each boundary a truthful measure and name;
 * Awtsmoos.com lets every operator enter through the same validated flame.
 */

/**
 * Validates and normalizes parameters from declarative command metadata.
 * @param {string} commandId Stable command identity used in diagnostics.
 * @param {object} schema Field schema keyed by parameter name.
 * @param {object} parameters Caller-supplied values.
 * @returns {object} Validated values containing only declared fields.
 */
export function validateParameters(commandId, schema = {}, parameters = {}) {
	const source = isPlainObject(parameters) ? parameters : {};
	const normalized = {};

	for (const [fieldName, fieldSchema] of Object.entries(schema)) {
		const hasValue = Object.prototype.hasOwnProperty.call(source, fieldName);
		const value = hasValue ? source[fieldName] : fieldSchema.default;

		if (value === undefined && fieldSchema.required) {
			throw fieldError(commandId, fieldName, 'is required');
		}

		if (value !== undefined) {
			normalized[fieldName] = validateValue(commandId, fieldName, value, fieldSchema);
		}
	}

	return normalized;
}

function validateValue(commandId, fieldName, value, schema) {
	if (schema.type === 'number') {
		return validateNumber(commandId, fieldName, value, schema);
	}

	if (schema.type === 'boolean' && typeof value !== 'boolean') {
		throw fieldError(commandId, fieldName, 'must be a boolean');
	}

	if (schema.type === 'string' && typeof value !== 'string') {
		throw fieldError(commandId, fieldName, 'must be a string');
	}

	if (schema.type === 'object' && !isPlainObject(value)) {
		throw fieldError(commandId, fieldName, 'must be an object');
	}

	if (schema.enum && !schema.enum.includes(value)) {
		throw fieldError(commandId, fieldName, `must be one of: ${schema.enum.join(', ')}`);
	}

	return value;
}

function validateNumber(commandId, fieldName, value, schema) {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw fieldError(commandId, fieldName, 'must be a finite number');
	}

	if (schema.min !== undefined && value < schema.min) {
		throw fieldError(commandId, fieldName, `must be at least ${schema.min}`);
	}

	if (schema.max !== undefined && value > schema.max) {
		throw fieldError(commandId, fieldName, `must be at most ${schema.max}`);
	}

	return value;
}

function fieldError(commandId, fieldName, message) {
	return new TypeError(`${commandId}: parameter "${fieldName}" ${message}.`);
}

function isPlainObject(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
