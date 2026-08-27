// B"H

import { createDiagnostic } from "../diagnostics/index.js";
import { RESOURCE_BUDGET_DIMENSIONS } from "./resourceBudgetContract.js";
import {
	normalizeResourceBudget,
	normalizeResourceUsage
} from "./normalizeResourceBudget.js";

/**
 * Compares measured usage with declared ceilings without mutating execution.
 *
 * The report is the courtroom record: every exceeded dimension is named,
 * measured, bounded, and carried into a stable diagnostic.
 */
export function evaluateResourceBudget(budgetInput = {}, usageInput = {}) {
	const budget = normalizeResourceBudget(budgetInput);
	const usage = normalizeResourceUsage(usageInput);
	const exceeded = [];
	const remaining = {};
	const diagnostics = [];
	for (const dimension of RESOURCE_BUDGET_DIMENSIONS) {
		const limit = budget[dimension];
		const actual = usage[dimension];
		remaining[dimension] = limit === Infinity
			? Infinity
			: Math.max(0, limit - actual);
		if (actual > limit) {
			exceeded.push(dimension);
			diagnostics.push(createDiagnostic({
				code: "RESOURCE.BUDGET_EXCEEDED",
				message: `Resource usage exceeded ${dimension}.`,
				path: ["usage", dimension],
				metadata: { actual, dimension, limit }
			}));
		}
	}
	return Object.freeze({
		ok: exceeded.length === 0,
		budget,
		usage,
		remaining: Object.freeze(remaining),
		exceeded: Object.freeze(exceeded),
		diagnostics: Object.freeze(diagnostics)
	});
}

/** Throws a range error carrying the immutable budget report when exceeded. */
export function assertResourceBudget(budgetInput = {}, usageInput = {}) {
	const report = evaluateResourceBudget(budgetInput, usageInput);
	if (!report.ok) {
		const error = new RangeError(`Resource budget exceeded: ${report.exceeded.join(", ")}`);
		Object.defineProperty(error, "report", { value: report });
		throw error;
	}
	return report;
}
