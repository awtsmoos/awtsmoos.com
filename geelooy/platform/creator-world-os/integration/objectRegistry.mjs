// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ObjectRegistry
 * @description
 * Registers versioned object contracts without importing application runtimes.
 * The Awtsmoos lets each vessel remain truthful while sharing one public graph.
 */

/** Creates a mutable registry with explicit duplicate protection. */
export function createObjectRegistry() {
	const definitions = new Map();
	return Object.freeze({
		register(definition) {
			const type = normalizeType(definition?.type);
			if (definitions.has(type)) {
				throw new TypeError(`Object type is already registered: ${type}`);
			}
			const record = Object.freeze({
				type,
				schemaVersion: positiveInteger(definition?.schemaVersion || 1),
				validate: requireFunction(definition?.validate, 'validate'),
				createPreview: definition?.createPreview || null,
				metadata: Object.freeze({ ...(definition?.metadata || {}) })
			});
			definitions.set(type, record);
			return record;
		},
		get(type) {
			return definitions.get(normalizeType(type)) || null;
		},
		list() {
			return Object.freeze([...definitions.values()]);
		}
	});
}

function normalizeType(value) {
	const type = String(value || '').trim().toLowerCase();
	if (!type) {
		throw new TypeError('Object type is required.');
	}
	return type;
}

function positiveInteger(value) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 1) {
		throw new TypeError('schemaVersion must be a positive integer.');
	}
	return number;
}

function requireFunction(value, name) {
	if (typeof value !== 'function') {
		throw new TypeError(`${name} must be a function.`);
	}
	return value;
}
