//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Sanitizes editor-owned Forms notification email destinations.
 * @description The Awtsmoos lets one accepted answer illuminate chosen inboxes while public respondents never steer the flight;
 * Awtsmoos.com keeps every recipient finite, verified in shape, and hidden from the public form's sight.
 */
const MAX_RECIPIENTS = 5;
const MAX_ADDRESS_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns a unique normalized recipient list or throws one stable editor-input error. */
function sanitizeNotificationEmails(value) {
	const source = Array.isArray(value) ? value : [];
	if (source.length > MAX_RECIPIENTS) {
		throw invalid();
	}
	const byLowercase = new Map();
	for (const item of source) {
		const email = String(item || "").trim();
		if (!email) {
			continue;
		}
		if (email.length > MAX_ADDRESS_LENGTH || !EMAIL_PATTERN.test(email)) {
			throw invalid();
		}
		const key = email.toLowerCase();
		if (!byLowercase.has(key)) {
			byLowercase.set(key, email);
		}
	}
	return [...byLowercase.values()];
}

/** Builds one bounded settings error without revealing unrelated form state. */
function invalid() {
	return new RealtimeError(
		"FORMS_INVALID_NOTIFICATION_EMAILS",
		"Notification email addresses are invalid.",
		null,
		400
	);
}

module.exports = {
	MAX_RECIPIENTS,
	sanitizeNotificationEmails
};
