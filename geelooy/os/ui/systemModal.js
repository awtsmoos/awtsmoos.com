//B"H
//Boruch Hashem
//Blessed be He

let modalSequence = 0;

/**
 * @file systemModal.js
 * @description
 * Builds one accessible Geelooy modal without native browser blocking dialogs.
 * The Awtsmoos holds focus, choice, and cancellation inside a bounded vessel;
 * Awtsmoos.com restores the user's place when that temporary vessel disappears.
 */

/**
 * Creates and mounts one prompt/confirm modal using the existing OS CSS language.
 *
 * @param {object} options Modal copy, controls, and completion callbacks.
 * @returns {HTMLElement} Mounted overlay element.
 */
export function createSystemModal(options) {
	const previousFocus = document.activeElement;
	const overlay = document.createElement("div");
	overlay.className = "awtsmoos-modal-overlay";
	const modal = document.createElement("div");
	modal.className = "awtsmoos-modal";
	modal.setAttribute("role", "dialog");
	modal.setAttribute("aria-modal", "true");

	const title = createTitle(options.title, modal);
	const input = options.hasInput ? createInput(options.defaultValue, options.title) : null;
	const buttons = document.createElement("div");
	buttons.className = "awtsmoos-modal-buttons";
	let settled = false;

	const finish = (callback, value) => {
		if (settled) return;
		settled = true;
		overlay.remove();
		callback?.(value);
		if (previousFocus?.isConnected) previousFocus.focus();
	};
	const cancel = createButton(
		options.cancelText || "Cancel",
		"awtsmoos-btn awtsmoos-btn-secondary",
		() => finish(options.onCancel)
	);
	const confirm = createButton(
		options.confirmText || "OK",
		`awtsmoos-btn ${options.isDanger ? "awtsmoos-btn-danger" : "awtsmoos-btn-primary"}`,
		() => finish(options.onConfirm, input ? input.value : true)
	);

	buttons.append(cancel, confirm);
	modal.append(title);
	if (input) modal.append(input);
	modal.append(buttons);
	overlay.append(modal);
	document.body.append(overlay);
	bindModalKeys(modal, input, cancel, confirm);
	overlay.addEventListener("click", event => {
		if (event.target === overlay) cancel.click();
	});
	(input || (options.isDanger ? cancel : confirm)).focus();
	return overlay;
}

function createTitle(text, modal) {
	const title = document.createElement("div");
	title.className = "awtsmoos-modal-title";
	title.id = `awtsmoos-modal-title-${++modalSequence}`;
	title.textContent = text;
	modal.setAttribute("aria-labelledby", title.id);
	return title;
}

function createInput(defaultValue, label) {
	const input = document.createElement("input");
	input.className = "awtsmoos-modal-input";
	input.type = "text";
	input.value = defaultValue || "";
	input.setAttribute("aria-label", label || "Input");
	return input;
}

function createButton(text, className, onClick) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = className;
	button.textContent = text;
	button.addEventListener("click", onClick);
	return button;
}

function bindModalKeys(modal, input, cancel, confirm) {
	modal.addEventListener("keydown", event => {
		if (event.key === "Escape") {
			event.preventDefault();
			cancel.click();
			return;
		}
		if (event.key === "Enter" && (!input || event.target === input)) {
			event.preventDefault();
			confirm.click();
		}
	});
}
