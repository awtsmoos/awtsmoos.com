//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Owns normalized Forms browser state while editor settings and respondent definition remain separate vessels.
 * @description The Awtsmoos renews one form beneath changing questions and private inbox choices in light;
 * Awtsmoos.com keeps stable field identity and editor routing outside the public definition's sight.
 */
export class MalchusFormModel extends EventTarget {
	constructor(form = null) {
		super();
		this.form = form ? normalizeForm(form) : null;
	}

	/** Replaces the current server snapshot and announces one model change. */
	load(form) {
		this.form = normalizeForm(form);
		this.dispatchEvent(new CustomEvent("change"));
	}

	/** Returns only editable public definition fields, deliberately excluding email and destination settings. */
	definition() {
		const form = this.form || defaultDefinition();
		return {
			confirmationMessage: form.confirmationMessage,
			description: form.description,
			fields: structuredClone(form.fields),
			title: form.title
		};
	}

	/** Returns whether the loaded snapshot is an editor snapshot with a public-link capability. */
	get isEditor() {
		return Boolean(this.form?.submitToken);
	}
}

/** Creates the minimal valid new-form definition used when launched from Sheets. */
export function defaultDefinition() {
	return {
		confirmationMessage: "Response received.",
		description: "",
		fields: [newField("shortText")],
		title: "Untitled form"
	};
}

/** Creates one stable browser-generated field id acceptable to the server schema. */
export function newField(type = "shortText") {
	const id = `field-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
	return {
		description: "",
		id,
		label: "Question",
		required: false,
		type,
		...(isChoiceType(type) ? { options: ["Option 1", "Option 2"] } : {})
	};
}

/** Reports whether one field type owns a server-validated option list. */
export function isChoiceType(type) {
	return ["singleChoice", "checkboxes", "dropdown"].includes(type);
}

/** Normalizes optional snapshot fields while preserving server-owned editor metadata. */
function normalizeForm(value) {
	const form = structuredClone(value || {});
	form.title ||= "Untitled form";
	form.description ||= "";
	form.confirmationMessage ||= "Response received.";
	form.fields = Array.isArray(form.fields) ? form.fields : [];
	form.notificationEmails = Array.isArray(form.notificationEmails)
		? form.notificationEmails
		: [];
	form.acceptingResponses = form.acceptingResponses !== false;
	return form;
}
