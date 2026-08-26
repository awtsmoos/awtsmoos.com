//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSchemaValidator.js
 * @description
 * The Awtsmoos lets boundaries reveal freedom when every public value knows the gate through which it may pass;
 * Awtsmoos.com validates lightweight schemas without dragging heavyweight runtime dependencies into the animation glass.
 */

/** Lightweight recursive validator for the intentionally small public Animator schema vocabulary. */
export class GevurahAnimatorSchemaValidator {
	/** @param {object} keliSchema Schema. @param {*} orValue Value. @param {string} sodPath Path. @returns {object[]} Issues. */
	static inspect(keliSchema = {}, orValue, sodPath = 'payload') {
		const sederIssues = [];
		this.inspectType(keliSchema, orValue, sodPath, sederIssues);
		return sederIssues;
	}

	/** @param {object} schema Schema. @param {*} value Value. @param {string} path Path. @param {object[]} issues Issues. */
	static inspectType(schema, value, path, issues) {
		if (schema.type === 'object') return this.inspectObject(schema, value, path, issues);
		if (schema.type === 'array') return this.inspectArray(schema, value, path, issues);
		if (schema.type === 'string') return this.inspectString(schema, value, path, issues);
		if (schema.type === 'number') return this.inspectNumber(schema, value, path, issues);
		if (schema.type === 'boolean' && typeof value !== 'boolean') {
			this.issue(issues, schema.errorCode ?? 'invalid_payload', path, 'Expected a boolean.');
		}
	}

	/** Inspects plain object structure, required fields, and declared child schemas. */
	static inspectObject(schema, value, path, issues) {
		if (!value || typeof value !== 'object' || Array.isArray(value)) {
			this.issue(issues, schema.errorCode ?? 'invalid_payload', path, 'Expected an object.');
			return;
		}
		for (const shemRequired of schema.required ?? []) {
			const orRequired = value[shemRequired];
			if (orRequired === undefined || orRequired === null || String(orRequired).trim() === '') {
				this.issue(issues, schema.requiredCodes?.[shemRequired] ?? 'invalid_payload', `${path}.${shemRequired}`, `Missing required field ${shemRequired}.`);
			}
		}
		for (const [shemKey, keliChild] of Object.entries(schema.properties ?? {})) {
			if (value[shemKey] !== undefined) this.inspectType(keliChild, value[shemKey], `${path}.${shemKey}`, issues);
		}
		if (schema.additionalProperties === false) this.inspectAdditional(schema, value, path, issues);
	}

	/** Rejects undeclared object properties only for explicitly strict schemas. */
	static inspectAdditional(schema, value, path, issues) {
		for (const shemKey of Object.keys(value)) {
			if (!Object.hasOwn(schema.properties ?? {}, shemKey)) {
				this.issue(issues, schema.errorCode ?? 'invalid_payload', `${path}.${shemKey}`, `Unknown field ${shemKey}.`);
			}
		}
	}

	/** Inspects array shape, minimum size, and item schemas. */
	static inspectArray(schema, value, path, issues) {
		if (!Array.isArray(value)) {
			this.issue(issues, schema.errorCode ?? 'invalid_payload', path, 'Expected an array.');
			return;
		}
		if (value.length < (schema.minItems ?? 0)) {
			this.issue(issues, schema.errorCode ?? 'invalid_payload', path, `Expected at least ${schema.minItems} items.`);
		}
		value.forEach((item, index) => this.inspectType(schema.items ?? {}, item, `${path}[${index}]`, issues));
	}

	/** Inspects trimmed string length and optional normalized enum membership. */
	static inspectString(schema, value, path, issues) {
		if (typeof value !== 'string') return this.issue(issues, schema.errorCode ?? 'invalid_payload', path, 'Expected a string.');
		const orTrimmed = value.trim();
		if (orTrimmed.length < (schema.minLength ?? 0)) this.issue(issues, schema.errorCode ?? 'invalid_payload', path, 'String is shorter than allowed.');
		if (schema.enum && !schema.enum.includes(orTrimmed)) this.issue(issues, schema.errorCode ?? 'invalid_payload', path, `Unsupported value ${orTrimmed}.`);
	}

	/** Inspects finite numeric type and authored minimum/maximum bounds. */
	static inspectNumber(schema, value, path, issues) {
		if (typeof value !== 'number' || !Number.isFinite(value)) return this.issue(issues, schema.errorCode ?? 'invalid_payload', path, 'Expected a finite number.');
		if (schema.minimum !== undefined && value < schema.minimum) this.issue(issues, schema.errorCode ?? 'invalid_payload', path, `Value must be at least ${schema.minimum}.`);
		if (schema.maximum !== undefined && value > schema.maximum) this.issue(issues, schema.errorCode ?? 'invalid_payload', path, `Value must be at most ${schema.maximum}.`);
	}

	/** Pushes one stable issue record. */
	static issue(issues, code, path, message) {
		issues.push({ code, path, message });
	}
}
