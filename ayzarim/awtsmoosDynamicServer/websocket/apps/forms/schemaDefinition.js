//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { boundedText } = require("./protocol.js");
const {
	CHOICE_TYPES,
	FIELD_TYPES
} = require("./schemaTypes.js");

/**
 * @file Sanitizes editor-owned Forms definitions without accepting any response-destination authority.
 * @description The Awtsmoos lets questions receive name, shape, obligation, and option within a bounded vessel of light;
 * Awtsmoos.com keeps definition truth separate from submitted answers so each law stays readable and right.
 */

/** Sanitizes editable public-facing form metadata. */
function sanitizeDefinition(value) {
	const source = value && typeof value === "object" ? value : {};
	const fields = Array.isArray(source.fields) ? source.fields : [];
	if (!fields.length || fields.length > 64) {
		throw invalid("fields");
	}
	const sanitized = fields.map(sanitizeField);
	if (new Set(sanitized.map((field) => field.id)).size !== sanitized.length) {
		throw invalid("field.id");
	}
	return {
		confirmationMessage: boundedText(
			source.confirmationMessage || "Response received.",
			"confirmationMessage",
			500
		),
		description: boundedText(source.description, "description", 2000),
		fields: sanitized,
		title: boundedText(
			source.title || "Untitled form",
			"title",
			120,
			false
		).trim()
	};
}

/** Sanitizes one stable declarative field. */
function sanitizeField(value) {
	const source = value && typeof value === "object" ? value : {};
	const id = String(source.id || "").trim();
	const type = String(source.type || "shortText");
	if (!/^[A-Za-z0-9_-]{6,64}$/.test(id) || !FIELD_TYPES.has(type)) {
		throw invalid("field");
	}
	const field = {
		description: boundedText(
			source.description,
			"field.description",
			500
		),
		id,
		label: boundedText(
			source.label,
			"field.label",
			180,
			false
		).trim(),
		required: Boolean(source.required),
		type
	};
	if (CHOICE_TYPES.has(type)) {
		field.options = sanitizeOptions(source.options);
	}
	return field;
}

/** Sanitizes one bounded unique option list. */
function sanitizeOptions(value) {
	const source = Array.isArray(value) ? value : [];
	if (!source.length || source.length > 50) {
		throw invalid("field.options");
	}
	const options = source.map((item) => boundedText(
		item,
		"field.option",
		160,
		false
	).trim());
	if (new Set(options).size !== options.length) {
		throw invalid("field.options");
	}
	return options;
}

/** Returns one stable invalid-definition error. */
function invalid(field) {
	return new RealtimeError(
		"FORMS_INVALID_INPUT",
		`${field} is invalid.`,
		{ field },
		400
	);
}

module.exports = {
	sanitizeDefinition,
	sanitizeField
};
