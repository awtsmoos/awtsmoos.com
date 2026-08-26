//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSchemaTypes.js
 * @description
 * The Awtsmoos gives shape to data before execution gives that data motion and voice;
 * Awtsmoos.com uses small serializable schema builders so agents and validators share one explicit, inspectable choice.
 */

/** Small JSON-safe schema builders for the public Animator command contract. */
export class BinahAnimatorSchemaTypes {
	/**
	 * @param {object} properties Declared child schemas.
	 * @param {object} options Object validation options.
	 * @returns {object} Serializable object schema.
	 */
	static object(properties = {}, options = {}) {
		return {
			type: 'object',
			properties: { ...properties },
			required: [...(options.required ?? [])],
			requiredCodes: { ...(options.requiredCodes ?? {}) },
			additionalProperties: options.additionalProperties ?? true,
			errorCode: options.errorCode
		};
	}

	/** @param {object} options String constraints. @returns {object} Serializable string schema. */
	static string(options = {}) {
		return {
			type: 'string',
			minLength: options.minLength ?? 0,
			enum: options.enum ? [...options.enum] : undefined,
			errorCode: options.errorCode
		};
	}

	/** @param {object} options Numeric constraints. @returns {object} Serializable number schema. */
	static number(options = {}) {
		return {
			type: 'number',
			minimum: options.minimum,
			maximum: options.maximum,
			errorCode: options.errorCode
		};
	}

	/** @param {object} items Item schema. @param {object} options Array constraints. @returns {object} Array schema. */
	static array(items = {}, options = {}) {
		return {
			type: 'array',
			items,
			minItems: options.minItems ?? 0,
			errorCode: options.errorCode
		};
	}

	/** @param {object} options Boolean constraints. @returns {object} Boolean schema. */
	static boolean(options = {}) {
		return { type: 'boolean', errorCode: options.errorCode };
	}
}
