// B"H

import { createStableId } from "../artifacts/index.js";
import { hashCanonicalValue, normalizeCanonicalValue } from "../canonical/index.js";

const METRIC_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;

function normalizeMeasurements(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Measurements must be an object.");
	}
	const result = {};
	for (const name of Object.keys(input).sort()) {
		if (!METRIC_PATTERN.test(name)) {
			throw new TypeError(`Measurement name is invalid: ${name}`);
		}
		const value = input[name];
		if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
			throw new RangeError(`Measurement must be a finite non-negative number: ${name}`);
		}
		result[name] = value;
	}
	return Object.freeze(result);
}

/** Creates an immutable, content-addressed machine measurement report. */
export function createMeasurementReport(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Measurement report input must be an object.");
	}
	const measurements = normalizeMeasurements(input.measurements ?? {});
	const content = Object.freeze({
		subject: normalizeCanonicalValue(input.subject ?? null),
		measurements,
		metadata: normalizeCanonicalValue(input.metadata ?? {})
	});
	const contentHash = hashCanonicalValue(content);
	return Object.freeze({
		reportSchema: "awtsmoos.measurement-report",
		id: input.id ?? createStableId("measurement", content),
		contentHash,
		...content
	});
}
