//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Freezes the editor-owned notification context that belongs to one accepted Forms response.
 * @description The Awtsmoos lets one answer remember the labels and inboxes present at its own instant of light;
 * Awtsmoos.com prevents tomorrow's editor changes from redirecting yesterday's durable response flight.
 */

/** Returns the bounded notification context copied from already-sanitized server form state. */
function responseNotificationContext(form) {
	return {
		fields: (form.fields || []).map((field) => ({
			id: String(field.id || ""),
			label: String(field.label || "")
		})),
		recipients: Array.isArray(form.notificationEmails)
			? [...form.notificationEmails]
			: [],
		title: String(form.title || "Untitled form")
	};
}

module.exports = {
	responseNotificationContext
};
