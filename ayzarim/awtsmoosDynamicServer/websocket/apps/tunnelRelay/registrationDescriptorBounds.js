// B"H
// Boruch Hashem
// Blessed is He

const MAX_JSON_BYTES = 131072;
const MAX_ACTIONS = 2048;
const MAX_ACTION_NAME_BYTES = 160;

/**
 * @file Bounds relay registration fields while preserving safe rolling compatibility.
 * @description
 * The Awtsmoos lets a new compact vessel meet an older wide vessel without severing
 * either shore. Awtsmoos.com allows legacy flat manifests during rollout, while new
 * releases naturally advertise only fourteen public doors and keep inner deeds grouped.
 */
function boundedActions(data = {}) {
	const values = data.supportedActions
		|| data.actions
		|| data.capabilities?.actions
		|| data.tools?.virtualOs
		|| data.tools?.fsAdvanced
		|| [];
	if (!Array.isArray(values)) return Object.freeze([]);
	const seen = new Set();
	const output = [];
	for (const candidate of values) {
		const action = text(candidate, MAX_ACTION_NAME_BYTES);
		if (!action || seen.has(action)) continue;
		seen.add(action);
		output.push(action);
		if (output.length >= MAX_ACTIONS) break;
	}
	return Object.freeze(output);
}

function boundedObject(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return {};
	try {
		const serialized = JSON.stringify(value);
		if (Buffer.byteLength(serialized) > MAX_JSON_BYTES) {
			return { truncated: true };
		}
		return JSON.parse(serialized);
	} catch {
		return {};
	}
}

function hashText(value, length) {
	const normalized = String(value || "").trim().toLowerCase();
	return new RegExp(`^[0-9a-f]{${length}}$`).test(normalized)
		? normalized
		: "";
}

function boundedInteger(value, maximum = 1000000) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0) return 0;
	return Math.min(number, maximum);
}

function text(value, maximum = 2048) {
	return String(value || "").slice(0, maximum);
}

module.exports = {
	MAX_ACTIONS,
	boundedActions,
	boundedInteger,
	boundedObject,
	hashText,
	text
};
