//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Defines the bounded realtime vocabulary of Awtsmoos Forms.
 * @description The Awtsmoos gives editor and respondent different named gates beneath one public form light;
 * Awtsmoos.com rejects shapeless identifiers and text before they can become routing authority or hidden might.
 */
const APPLICATION_ID = "forms";
const VERSION = 1;

const TYPES = Object.freeze({
	create: "forms.document.create",
	open: "forms.document.open",
	update: "forms.document.update",
	pause: "forms.document.pause",
	rotateToken: "forms.document.rotateToken",
	submit: "forms.response.submit"
});

/** Returns bounded string content or throws one stable Forms input error. */
function boundedText(value, field, maximum, allowEmpty = true) {
	const text = String(value ?? "");
	if ((!allowEmpty && !text.trim()) || text.length > maximum) {
		throw invalid(field);
	}
	return text;
}

/** Validates one opaque identifier used only for lookup, never public destination routing. */
function identifier(value, field = "id") {
	const id = String(value || "").trim();
	if (!/^[A-Za-z0-9_-]{8,128}$/.test(id)) {
		throw invalid(field);
	}
	return id;
}

/** Validates one opaque form-submit token. */
function submitToken(value) {
	const token = String(value || "").trim();
	if (!/^[A-Za-z0-9_-]{24,256}$/.test(token)) {
		throw invalid("token");
	}
	return token;
}

/** Returns one ordinary input error without leaking internal routing state. */
function invalid(field) {
	return new RealtimeError(
		"FORMS_INVALID_INPUT",
		`${field} is invalid.`,
		{ field },
		400
	);
}

module.exports = {
	APPLICATION_ID,
	TYPES,
	VERSION,
	boundedText,
	identifier,
	submitToken
};
