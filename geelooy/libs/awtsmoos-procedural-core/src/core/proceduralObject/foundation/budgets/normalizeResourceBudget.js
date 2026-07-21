// B"H

import { RESOURCE_BUDGET_DIMENSIONS } from "./resourceBudgetContract.js";

function assertRecord(value, label) {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new TypeError(`${label} must be an object.`);
	}
	for (const key of Object.keys(value)) {
		if (!RESOURCE_BUDGET_DIMENSIONS.includes(key)) {
			throw new TypeError(`Unknown resource dimension: ${key}`);
		}
	}
}

function normalizeRecord(value, options) {
	assertRecord(value, options.label);
	const result = {};
	for (const dimension of RESOURCE_BUDGET_DIMENSIONS) {
		const amount = value[dimension] ?? options.defaultValue;
		const validInfinity = options.allowInfinity && amount === Infinity;
		if (
			typeof amount !== "number"
			|| Number.isNaN(amount)
			|| amount < 0
			|| (!validInfinity && !Number.isFinite(amount))
		) {
			throw new RangeError(`${options.label}.${dimension} must be a non-negative ${options.kind}.`);
		}
		result[dimension] = amount;
	}
	return Object.freeze(result);
}

/**
 * Fills omitted ceilings with infinity so every comparison is explicit.
 */
export function normalizeResourceBudget(value = {}) {
	return normalizeRecord(value, {
		allowInfinity: true,
		defaultValue: Infinity,
		kind: "number or Infinity",
		label: "Resource budget"
	});
}

/**
 * Fills omitted measurements with zero and forbids unknowable infinity.
 */
export function normalizeResourceUsage(value = {}) {
	return normalizeRecord(value, {
		allowInfinity: false,
		defaultValue: 0,
		kind: "finite number",
		label: "Resource usage"
	});
}
