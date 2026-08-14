// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds one-field messaging sheets whose finite structure remains separate from focus, cancellation, and asynchronous consent mutations.
 * @description The Awtsmoos is one before title, field, error, and action, while Awtsmoos.com gives deliberate private requests a stable vessel in light;
 * the sheet exposes a visible label, an inline error chamber, calm cancellation, and one primary action without letting network behavior hide inside markup construction.
 */

let modalSequence = 0;

/** Builds one accessible modal view and returns the nodes needed by its interaction owner. */
export function buildMessagingModalView(options = {}) {
	const id = `messagingModal${++modalSequence}`;
	const overlay = document.createElement("div");
	overlay.className = "messaging-modal-overlay";
	const form = document.createElement("form");
	form.className = "messaging-modal";
	form.setAttribute("role", "dialog");
	form.setAttribute("aria-modal", "true");
	form.setAttribute("aria-labelledby", `${id}Title`);
	form.setAttribute("aria-describedby", `${id}Description ${id}Error`);
	const title = document.createElement("h2");
	title.id = `${id}Title`;
	title.textContent = options.title || "Messaging action";
	const copy = document.createElement("p");
	copy.id = `${id}Description`;
	copy.textContent = options.description || "";
	const field = document.createElement("label");
	field.className = "messaging-modal-field";
	const label = document.createElement("span");
	label.textContent = options.label || options.placeholder || "Value";
	const input = document.createElement("input");
	input.name = "value";
	input.required = true;
	input.maxLength = options.maxLength || 100;
	input.placeholder = options.placeholder || "";
	input.autocomplete = "off";
	field.append(label, input);
	const error = document.createElement("div");
	error.id = `${id}Error`;
	error.className = "messaging-modal-error";
	error.setAttribute("role", "alert");
	error.hidden = true;
	const actions = document.createElement("div");
	actions.className = "messaging-modal-actions";
	const cancel = createButton("Cancel", "button", "secondary");
	const submit = createButton(options.submitLabel || "Continue", "submit", "primary");
	actions.append(cancel, submit);
	form.append(title, copy, field, error, actions);
	overlay.appendChild(form);
	return { overlay, form, input, error, cancel, submit, focus: null };
}

function createButton(label, type, variant) {
	const element = document.createElement("button");
	element.type = type;
	element.className = `messaging-modal-action is-${variant}`;
	element.textContent = label;
	return element;
}
