// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { ERROR_CODES } from "./constants.js";
import { UniversalApiError } from "./errors.js";

function matchesType(value, type) {
	if (type === "array") return Array.isArray(value);
	if (type === "integer") return Number.isInteger(value);
	if (type === "number") return typeof value === "number" && Number.isFinite(value);
	if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
	return typeof value === type;
}

function inspect(value, schema, path, errors) {
	if (!schema) return;
	if (schema.type && !matchesType(value, schema.type)) {
		errors.push({ path, code: "TYPE", expected: schema.type });
		return;
	}
	if (schema.enum && !schema.enum.includes(value)) {
		errors.push({ path, code: "ENUM", allowed: schema.enum });
	}
	if (schema.type === "object") {
		for (const key of schema.required ?? []) {
			if (value[key] === undefined) errors.push({ path: `${path}.${key}`, code: "REQUIRED" });
		}
		for (const [key, child] of Object.entries(schema.properties ?? {})) {
			if (value[key] !== undefined) inspect(value[key], child, `${path}.${key}`, errors);
		}
	}
	if (schema.type === "array" && schema.items) {
		value.forEach((item, index) => inspect(item, schema.items, `${path}.${index}`, errors));
	}
}

/** Validates a supported deterministic JSON Schema subset. */
export function validateSchema(value, schema, path = "params") {
	const errors = [];
	inspect(value, schema, path, errors);
	return { valid: errors.length === 0, errors, warnings: [] };
}

/** Throws a stable validation failure when a schema rejects parameters. */
export function assertSchema(value, schema) {
	const report = validateSchema(value, schema);
	if (!report.valid) {
		throw new UniversalApiError(
			ERROR_CODES.VALIDATION_FAILED,
			"Command parameters failed schema validation.",
			{ errors: report.errors, path: report.errors[0]?.path }
		);
	}
	return report;
}
