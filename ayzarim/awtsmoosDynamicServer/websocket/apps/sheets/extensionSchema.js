//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { boundedText, cellAddress } = require("./protocol.js");

/**
 * @file Sanitizes the declarative extension language before it can enter shared workbook state.
 * @description The Awtsmoos gives automation power a finite grammar rather than unbounded executable night;
 * Awtsmoos.com stores only named capabilities and measured steps, so authority stays visible in light.
 */
const CAPABILITIES = new Set([
	"range.read", "range.write", "sheet.append", "ui.notify"
]);
const TRIGGERS = new Set(["manual", "edit", "open"]);
const STEP_TYPES = new Set([
	"setValue", "setFormula", "appendRow", "notify", "trimSelection", "sequenceSelection"
]);

/** Returns one sanitized immutable-shape extension manifest or throws a stable input error. */
function sanitizeExtension(value) {
	const source = value && typeof value === "object" ? value : {};
	return {
		capabilities: limitedNames(source.capabilities, CAPABILITIES, 8, "capability"),
		description: boundedText(source.description, "description", 280),
		enabled: source.enabled !== false,
		id: extensionId(source.id),
		name: boundedText(source.name, "name", 80, false).trim(),
		steps: limitedSteps(source.steps),
		triggers: limitedNames(source.triggers, TRIGGERS, 4, "trigger"),
		version: boundedText(source.version || "1.0.0", "version", 24, false).trim()
	};
}

/** Validates one extension identifier without granting workbook-routing semantics. */
function extensionId(value) {
	const id = String(value || "").trim();
	if (!/^[A-Za-z0-9_-]{3,64}$/.test(id)) {
		throw invalid("extensionId");
	}
	return id;
}

/** Keeps only unique allowlisted names beneath a hard count. */
function limitedNames(value, allowed, maximum, field) {
	const source = Array.isArray(value) ? value : [];
	const result = [...new Set(source.map((item) => String(item || "")))]
		.filter((item) => allowed.has(item));
	if (result.length > maximum || source.some((item) => !allowed.has(String(item || "")))) {
		throw invalid(field);
	}
	return result;
}

/** Sanitizes at most forty declarative automation steps. */
function limitedSteps(value) {
	const source = Array.isArray(value) ? value : [];
	if (source.length > 40) {
		throw invalid("steps");
	}
	return source.map(sanitizeStep);
}

/** Sanitizes one step according to its finite action type. */
function sanitizeStep(value) {
	const source = value && typeof value === "object" ? value : {};
	const type = String(source.type || "");
	if (!STEP_TYPES.has(type)) {
		throw invalid("step.type");
	}
	if (type === "setValue" || type === "setFormula") {
		return {
			address: cellAddress(source.address),
			type,
			value: boundedText(source.value, "step.value", 4000)
		};
	}
	if (type === "appendRow") {
		return {
			type,
			values: limitedValues(source.values)
		};
	}
	if (type === "notify") {
		return {
			message: boundedText(source.message, "step.message", 240),
			type
		};
	}
	if (type === "sequenceSelection") {
		return {
			start: finiteNumber(source.start, 1),
			step: finiteNumber(source.step, 1),
			type
		};
	}
	return { type };
}

/** Sanitizes one append-row value list without allowing nested executable objects. */
function limitedValues(value) {
	const source = Array.isArray(value) ? value : [];
	if (source.length > 64) {
		throw invalid("step.values");
	}
	return source.map((item) => boundedText(item, "step.value", 4000));
}

/** Returns a finite number or one benign fallback for sequence steps. */
function finiteNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/** Creates one stable schema-validation error. */
function invalid(field) {
	return new RealtimeError(
		"SHEETS_INVALID_EXTENSION",
		`${field} is invalid.`,
		{ field },
		400
	);
}

module.exports = {
	extensionId,
	sanitizeExtension
};
