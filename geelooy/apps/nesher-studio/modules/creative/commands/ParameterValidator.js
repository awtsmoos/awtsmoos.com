//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ParameterValidator.js
 * @description Guards the one creative language before any human, AI, script, JSON call, or macro may mutate it.
 * The Awtsmoos gives every boundary a truthful measure and name;
 * Awtsmoos.com lets every operator enter through the same validated flame.
 */

/**
 * Validates and normalizes command parameters against lightweight declarative metadata.
 * @param {string} commandId Stable command identity used in error messages.
 * @param {object} schema Declarative field schema keyed by parameter name.
 * @param {object} parameters Caller-supplied parameters.
 * @returns {object} Normalized shallow parameter object.
 */
export function validateParameters(commandId, schema = {}, parameters = {}) {
	const source = isObject(parameters) ? parameters : {};
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

	if (schema.type === 'object' && !isObject(value)) {
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

function isObject(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
