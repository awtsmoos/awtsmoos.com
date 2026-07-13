//B"H
//Boruch Hashem
//Blessed is He

/**
 * A runtime report must reveal capability without dumping payload bytes. The
 * Awtsmoos creates result and testimony together; Awtsmoos.com removes bulky
 * binary fields while preserving format, architecture, mode, faults, and exits.
 */

/** Returns a JSON-safe evidence view of one executable-host outcome. */
export function executionReport(outcome) {
	return JSON.stringify(sanitize(outcome), null, 2);
}

/** Returns the visible execution-class label for the executable toolbar. */
export function executionLabel(outcome, fallback = {}) {
	const identity = outcome?.identity || fallback;
	const mode = outcome?.result?.executionClass
		|| outcome?.result?.mode
		|| identity?.executionMode
		|| "artifact-inspection";
	const format = identity?.format || fallback?.format || "unknown";
	const architecture = identity?.architecture || fallback?.architecture || "unknown";
	return `${mode} · ${format} · ${architecture}`;
}

function sanitize(value, key = "") {
	if (value === null || value === undefined) {
		return value;
	}
	if (["bytes", "payloadBytes", "payloadBase64"].includes(key)) {
		return byteSummary(value);
	}
	if (value instanceof Uint8Array) {
		return byteSummary(value);
	}
	if (value instanceof ArrayBuffer) {
		return byteSummary(new Uint8Array(value));
	}
	if (Array.isArray(value)) {
		return value.map(item => sanitize(item));
	}
	if (typeof value === "bigint") {
		return value.toString();
	}
	if (typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([name, item]) => [name, sanitize(item, name)])
		);
	}
	return value;
}

function byteSummary(value) {
	const byteLength = value?.byteLength ?? value?.length ?? null;
	return Object.freeze({ omitted: true, byteLength });
}
