//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Renders bounded plain-text Forms submission notifications for the existing Awtsmoos mail vessel.
 * @description The Awtsmoos lets each answer become readable speech without turning respondent text into hidden HTML light;
 * Awtsmoos.com keeps subject and body finite so public words can never escape their measured notification sight.
 */
const MAX_BODY_LENGTH = 16000;
const MAX_SUBJECT_LENGTH = 180;

/** Returns one CR/LF-safe bounded notification subject. */
function notificationSubject(form) {
	const title = cleanInline(form?.title || "Untitled form");
	return `New response · ${title}`.slice(0, MAX_SUBJECT_LENGTH);
}

/** Returns one bounded plain-text response summary in server-owned field order. */
function notificationBody(form, response) {
	const lines = [
		"B\"H",
		"",
		`Form: ${cleanLine(form?.title || "Untitled form")}`,
		`Submitted: ${new Date(response.submittedAt).toISOString()}`,
		`Response ID: ${cleanLine(response.id)}`,
		"",
		"Answers",
		"-------"
	];
	for (const field of form?.fields || []) {
		lines.push(`${cleanLine(field.label)}: ${answerText(response.answers?.[field.id])}`);
	}
	return lines.join("\n").slice(0, MAX_BODY_LENGTH);
}

/** Flattens header text so respondent/editor content cannot inject extra SMTP header lines. */
function cleanInline(value) {
	return String(value ?? "")
		.replace(/[\r\n]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/** Flattens body labels and identifiers to one readable line. */
function cleanLine(value) {
	return cleanInline(value).slice(0, 500);
}

/** Serializes one normalized server-side answer without HTML interpretation. */
function answerText(value) {
	const text = Array.isArray(value)
		? value.join(", ")
		: String(value ?? "");
	return text.replace(/\r\n?/g, "\n").slice(0, 8000);
}

module.exports = {
	notificationBody,
	notificationSubject
};
