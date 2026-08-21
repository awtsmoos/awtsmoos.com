//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Projects one durable form into deliberately different editor and public snapshots.
 * @description The Awtsmoos contains destination, inbox choices, and public doorway while code separates their sight;
 * Awtsmoos.com reveals notification routing only to editors and gives respondents exactly the form they need in light.
 */

/** Returns the complete bounded editor projection, including public-link, destination, and notification metadata. */
function editorSnapshot(form) {
	return {
		acceptingResponses: form.acceptingResponses !== false,
		confirmationMessage: String(form.confirmationMessage || "Response received."),
		createdAt: form.createdAt,
		description: String(form.description || ""),
		destination: structuredClone(form.destination || {}),
		fields: publicFields(form.fields),
		id: form.id,
		notificationEmails: Array.isArray(form.notificationEmails)
			? [...form.notificationEmails]
			: [],
		responseCount: Number(form.responseCount || 0),
		revision: Number(form.revision || 0),
		submitToken: String(form.submitToken || ""),
		title: String(form.title || "Untitled form"),
		updatedAt: form.updatedAt
	};
}

/** Returns respondent state without owner, destination, recipient, ACL, response, or stored-token metadata. */
function publicSnapshot(form) {
	return {
		acceptingResponses: form.acceptingResponses !== false,
		confirmationMessage: String(form.confirmationMessage || "Response received."),
		description: String(form.description || ""),
		fields: publicFields(form.fields),
		id: form.id,
		revision: Number(form.revision || 0),
		title: String(form.title || "Untitled form")
	};
}

/** Clones only declarative public field metadata. */
function publicFields(value) {
	return (Array.isArray(value) ? value : []).map((field) => ({
		description: String(field.description || ""),
		id: String(field.id || ""),
		label: String(field.label || ""),
		options: Array.isArray(field.options) ? [...field.options] : undefined,
		required: Boolean(field.required),
		type: String(field.type || "shortText")
	}));
}

module.exports = {
	editorSnapshot,
	publicSnapshot
};
