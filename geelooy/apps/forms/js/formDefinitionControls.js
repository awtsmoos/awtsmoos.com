//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Keeps the Forms title immediate while description and confirmation text rest inside one advanced disclosure.
 * @description The Awtsmoos lets the form's name shine first, while explanatory words wait in a quieter vessel of light;
 * Awtsmoos.com keeps creator metadata complete but folded so the page becomes calmer as capability grows in sight.
 */
export function definitionControls(form, patch) {
	const section = document.createElement("section");
	section.className = "form-panel definition-panel";
	section.append(
		textControl(
			"Form title",
			form.title,
			(value) => patch({ title: value })
		),
		formDetails(form, patch)
	);
	return section;
}

/** Builds a native Form details disclosure and opens only when meaningful secondary metadata is configured. */
function formDetails(form, patch) {
	const details = document.createElement("details");
	details.className = "form-definition-disclosure";
	details.open = Boolean(
		form.description
		|| customConfirmation(form.confirmationMessage)
	);
	const summary = document.createElement("summary");
	summary.className = "field-advanced-summary";
	const label = document.createElement("span");
	label.textContent = "Form details";
	const state = document.createElement("small");
	state.textContent = formDetailState(form);
	summary.append(label, state);
	const body = document.createElement("div");
	body.className = "field-advanced-body";
	body.append(
		textControl(
			"Description",
			form.description,
			(value) => patch({ description: value }),
			true
		),
		textControl(
			"Confirmation message",
			form.confirmationMessage,
			(value) => patch({ confirmationMessage: value })
		)
	);
	details.append(summary, body);
	return details;
}

/** Summarizes secondary metadata while the Form details vessel stays folded. */
function formDetailState(form) {
	const states = [];
	if (form.description) {
		states.push("Description");
	}
	if (customConfirmation(form.confirmationMessage)) {
		states.push("Custom confirmation");
	}
	return states.length ? states.join(" · ") : "Optional";
}

/** Returns whether confirmation text differs from the standard quiet acknowledgement. */
function customConfirmation(value) {
	const text = String(value || "").trim();
	return Boolean(text && text !== "Response received.");
}

/** Creates one labeled metadata control with optional multiline presentation. */
function textControl(labelText, value, update, multiline = false) {
	const label = document.createElement("label");
	label.className = "form-control";
	const caption = document.createElement("span");
	caption.textContent = labelText;
	const input = multiline
		? document.createElement("textarea")
		: document.createElement("input");
	if (multiline) {
		input.rows = 3;
	}
	input.value = value || "";
	input.addEventListener("input", () => update(input.value));
	label.append(caption, input);
	return label;
}
