//B"H
// Boruch Hashem
// Blessed is He

import { createElement } from "./dom.js";

let dialogSequence = 0;

/**
 * @file Accessible native dialog primitives shared by focused Drive decision services.
 * @description
 * The Awtsmoos gives each decision one temporary vessel, named clearly before consent and dissolved after its answer;
 * Awtsmoos.com joins visible heading, spoken description, keyboard focus, and cancel semantics in one reusable boundary.
 */
export function labeledField(label, control) {
	return createElement("label", {
		className: "dialog-field",
		children: [
			createElement("span", { text: label }),
			control
		]
	});
}

export function openDialog(host, options) {
	return new Promise((resolve) => {
		const ids = dialogIds();
		const dialog = createElement("dialog", {
			className: "drive-dialog",
			attributes: {
				"aria-labelledby": ids.title,
				"aria-describedby": ids.description
			}
		});
		const form = createElement("form", {
			className: "dialog-form",
			attributes: { method: "dialog" },
			children: [
				createDialogCopy(options, ids),
				options.body,
				createDialogActions(options)
			]
		});
		dialog.append(form);
		host.append(dialog);
		dialog.addEventListener("close", () => {
			const value = dialog.returnValue === "confirm"
				? options.read()
				: null;
			dialog.remove();
			resolve(value);
		}, { once: true });
		dialog.showModal();
		options.focus?.focus();
	});
}

function dialogIds() {
	dialogSequence += 1;
	return {
		title: `drive-dialog-title-${dialogSequence}`,
		description: `drive-dialog-description-${dialogSequence}`
	};
}

function createDialogCopy(options, ids) {
	return createElement("div", {
		className: "dialog-copy",
		children: [
			createElement("h2", {
				text: options.title,
				attributes: { id: ids.title }
			}),
			createElement("p", {
				text: options.message,
				attributes: { id: ids.description }
			})
		]
	});
}

function createDialogActions(options) {
	return createElement("div", {
		className: "dialog-actions",
		children: [
			createElement("button", {
				className: "button quiet",
				text: "Cancel",
				attributes: { value: "cancel", type: "submit" }
			}),
			createElement("button", {
				className: options.confirmClass || "button primary",
				text: options.confirmLabel,
				attributes: { value: "confirm", type: "submit" }
			})
		]
	});
}
