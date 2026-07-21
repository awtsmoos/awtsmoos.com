// B"H

import { normalizeCanonicalValue, serializeCanonicalValue } from "../canonical/index.js";
import { createMeasurementReport } from "./createMeasurementReport.js";

function inspect(value, depth, totals) {
	totals.nodes += 1;
	totals.maxDepth = Math.max(totals.maxDepth, depth);
	if (value === null || typeof value !== "object") {
		totals.scalars += 1;
		return;
	}
	if (Array.isArray(value)) {
		totals.arrays += 1;
		for (const child of value) inspect(child, depth + 1, totals);
		return;
	}
	totals.objects += 1;
	if (["array-buffer", "data-view", "typed-array"].includes(value.type)) {
		totals.binaryContainers += 1;
	}
	for (const child of Object.values(value)) inspect(child, depth + 1, totals);
}

/** Measures canonical UTF-8 bytes and deterministic structural complexity. */
export function measureCanonicalValue(value, metadata = {}) {
	const normalized = normalizeCanonicalValue(value);
	const serialized = serializeCanonicalValue(value);
	const totals = {
		nodes: 0, arrays: 0, objects: 0, scalars: 0,
		binaryContainers: 0, maxDepth: 0
	};
	inspect(normalized, 0, totals);
	return createMeasurementReport({
		subject: { contentHash: null },
		measurements: {
			utf8Bytes: new TextEncoder().encode(serialized).byteLength,
			...totals
		},
		metadata
	});
}
