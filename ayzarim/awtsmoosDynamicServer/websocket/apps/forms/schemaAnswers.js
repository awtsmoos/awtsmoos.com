//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { boundedText } = require("./protocol.js");
const { isCalendarDate } = require("./schemaCalendar.js");
const { CHOICE_TYPES } = require("./schemaTypes.js");

/**
 * @file Normalizes public Forms answers against server-owned field truth while calendar law remains separately testable.
 * @description The Awtsmoos lets each answer enter only through the question that names its measured light;
 * Awtsmoos.com rejects unknown fields, malformed values, and impossible choices before Sheet or inbox comes in sight.
 */

/** Normalizes answers strictly against known ids, required state, type, and total payload bounds. */
function normalizeAnswers(form, value) {
	const answers = value
		&& typeof value === "object"
		&& !Array.isArray(value)
		? value
		: {};
	const fields = Array.isArray(form.fields) ? form.fields : [];
	const known = new Set(fields.map((field) => field.id));
	if (Object.keys(answers).some((id) => !known.has(id))) {
		throw invalid("answers");
	}
	const result = {};
	let total = 0;
	for (const field of fields) {
		const answer = normalizeAnswer(field, answers[field.id]);
		if (field.required && isEmpty(field, answer)) {
			throw invalid(field.id);
		}
		result[field.id] = answer;
		total += JSON.stringify(answer).length;
	}
	if (total > 24000) {
		throw invalid("answers.size");
	}
	return result;
}

/** Normalizes one answer according to its already-sanitized field definition. */
function normalizeAnswer(field, value) {
	if (field.type === "checkboxes") {
		return normalizeCheckboxes(field, value);
	}
	const limit = field.type === "paragraph" ? 8000 : 1000;
	const text = boundedText(value, field.id, limit).trim();
	if (!text) {
		return "";
	}
	if (CHOICE_TYPES.has(field.type) && !field.options.includes(text)) {
		throw invalid(field.id);
	}
	if (field.type === "number" && !Number.isFinite(Number(text))) {
		throw invalid(field.id);
	}
	if (field.type === "email" && !isEmail(text)) {
		throw invalid(field.id);
	}
	if (field.type === "date" && !isCalendarDate(text)) {
		throw invalid(field.id);
	}
	return text;
}

/** Normalizes checkbox answers as a unique subset of server-owned options. */
function normalizeCheckboxes(field, value) {
	const values = Array.isArray(value)
		? value.map(String)
		: [];
	if (
		values.length > field.options.length
		|| values.some((item) => !field.options.includes(item))
	) {
		throw invalid(field.id);
	}
	return [...new Set(values)];
}

/** Validates one conservative external email-address shape. */
function isEmail(value) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Returns whether one normalized answer is semantically empty for required validation. */
function isEmpty(field, answer) {
	return field.type === "checkboxes"
		? !answer.length
		: answer === "";
}

/** Returns one stable invalid-answer error without exposing destination state. */
function invalid(field) {
	return new RealtimeError(
		"FORMS_INVALID_INPUT",
		`${field} is invalid.`,
		{ field },
		400
	);
}

module.exports = {
	isCalendarDate,
	normalizeAnswers
};
