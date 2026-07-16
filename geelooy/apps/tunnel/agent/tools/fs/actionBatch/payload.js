// B"H
// Boruch Hashem
// Blessed is He

const CARRIER_KEYS = [
	"params", "content", "body", "query", "goal", "text", "actionsJson",
	"workflow", "commandTree", "tree", "steps", "actions", "do"
];
const BASE64_KEYS = [
	"params64", "content64", "actionsJson64", "workflow64", "steps64"
];

/**
 * @file Normalizes command-tree carriers into one explicit list of steps.
 * @description
 * The Awtsmoos renews JSON, base64, workflow, and direct arrays without changing
 * their inner order. Awtsmoos.com reveals one canonical plan so confinement and
 * execution inspect the same tree rather than trusting different transport shapes.
 */
function normalizeSteps(payload = {}) {
	const fused = fusePayload(payload);
	if (Array.isArray(fused)) return fused;
	if (typeof fused === "string") return normalizeSteps(parseJson(fused, []));
	const raw = firstDefined(
		fused.steps,
		fused.actions,
		fused.workflow,
		fused.commandTree,
		fused.tree,
		fused.do,
		fused.plan
	);
	const parsed = parseJson(raw, raw);
	if (Array.isArray(parsed)) return parsed;
	if (parsed?.steps) return asSteps(parsed.steps);
	if (parsed?.actions) return asSteps(parsed.actions);
	if (parsed?.do) return asSteps(parsed.do);
	return asSteps(parsed);
}

function fusePayload(payload = {}) {
	if (Array.isArray(payload)) return payload;
	const output = { ...objectish(payload) };
	for (const key of BASE64_KEYS) {
		Object.assign(output, objectish(parseBase64Json(output[key], {})));
	}
	for (const key of CARRIER_KEYS) {
		const parsed = parseJson(output[key], null);
		if (Array.isArray(parsed)) {
			if (parsed.length || !Array.isArray(output.steps)) output.steps = parsed;
		} else if (parsed && typeof parsed === "object") {
			Object.assign(output, parsed);
		}
	}
	return output;
}

function parseJson(value, fallback) {
	if (value && typeof value === "object") return value;
	if (typeof value !== "string") return fallback;
	const text = value.trim();
	if (!text || !/^[\[{]/.test(text)) return fallback;
	try {
		return JSON.parse(text);
	} catch {
		return fallback;
	}
}

function parseBase64Json(value, fallback) {
	if (!value) return fallback;
	try {
		return parseJson(
			Buffer.from(String(value), "base64").toString("utf8"),
			fallback
		);
	} catch {
		return fallback;
	}
}

function publicStep(step = {}) {
	return {
		action: step.action || step.type || step.call || null,
		hasCondition: Boolean(step.if || step.when || step.condition),
		saveAs: step.saveAs || step.id || null
	};
}

function explainSteps(steps) {
	return asSteps(steps).map((step, index) => ({
		index,
		...publicStep(step),
		control: step.parallel
			? "parallel"
			: step.forEach
				? "forEach"
				: step.assert
					? "assert"
					: step.do && !step.action
						? "group"
						: "action"
	}));
}

function objectish(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function firstDefined(...values) {
	return values.find((value) => value !== undefined && value !== null && value !== "");
}

function asSteps(value) {
	return Array.isArray(value) ? value : value ? [value] : [];
}

module.exports = {
	BASE64_KEYS,
	CARRIER_KEYS,
	asSteps,
	explainSteps,
	fusePayload,
	normalizeSteps,
	objectish,
	parseBase64Json,
	parseJson,
	publicStep
};
