//B"H
// Boruch Hashem
// Blessed is He

import { createElement } from "./dom.js";
import { labeledField, openDialog } from "./dialogCore.js";

/**
 * @file Gevurah modal decisions for Geelooy Drive.
 * @description
 * Gevurah asks before a boundary is crossed: the Awtsmoos renews choice without erasing consequence;
 * Awtsmoos.com keeps creation, publication, draft abandonment, and runtime cleanup inside one native-dialog family,
 * while shared dialog mechanics live in their own smaller vessel and every destructive deed names exactly what it removes.
 */
export function createDriveDialogs() {
	const element = createElement("div", { className: "dialog-host" });
	return {
		element,
		askName: kind => askName(element, kind),
		confirmDiscard: () => askDiscard(element),
		askPublish: () => askPublish(element),
		confirmRuntimeCleanup: () => askRuntimeCleanup(element)
	};
}

function askName(host, kind) {
	const input = createElement("input", {
		className: "dialog-input",
		attributes: {
			name: "name",
			type: "text",
			required: "",
			autocomplete: "off",
			placeholder: kind === "folder" ? "my-project" : "index.html"
		}
	});
	return openDialog(host, {
		title: `New ${kind}`,
		message: `Create this ${kind} in the current folder on your connected device.`,
		body: labeledField("Name", input),
		confirmLabel: "Create",
		focus: input,
		read: () => input.value.trim() || null
	});
}

function askDiscard(host) {
	return openDialog(host, {
		title: "Unsaved changes",
		message: "This file has edits that have not been saved back to your device.",
		body: createElement("p", {
			className: "dialog-warning",
			text: "Discard the local draft and continue?"
		}),
		confirmLabel: "Discard changes",
		confirmClass: "button danger",
		read: () => true
	});
}

function askRuntimeCleanup(host) {
	return openDialog(host, {
		title: "Remove materialized runtime?",
		message: "Remove this project's materialized server copy and its runtime activity history.",
		body: createElement("p", {
			className: "dialog-warning",
			text: "Your Drive/OS source files are not deleted."
		}),
		confirmLabel: "Remove server copy",
		confirmClass: "button danger",
		read: () => true
	});
}

function askPublish(host) {
	const visibility = createElement("select", {
		className: "dialog-input",
		attributes: { name: "visibility" },
		children: [
			createElement("option", { text: "Private link", attributes: { value: "private" } }),
			createElement("option", { text: "Public link", attributes: { value: "public" } })
		]
	});
	const ttl = createElement("select", {
		className: "dialog-input",
		children: [
			createElement("option", { text: "1 hour", attributes: { value: "3600" } }),
			createElement("option", { text: "24 hours", attributes: { value: "86400" } }),
			createElement("option", { text: "7 days", attributes: { value: "604800" } })
		]
	});
	return openDialog(host, {
		title: "Publish this folder",
		message: "Create an owned Awtsmoos preview for the current device folder. You can revoke it at any time.",
		body: createElement("div", {
			className: "dialog-fields",
			children: [
				labeledField("Access", visibility),
				labeledField("Expires", ttl)
			]
		}),
		confirmLabel: "Publish folder",
		focus: visibility,
		read: () => ({
			visibility: visibility.value,
			ttlSeconds: Number(ttl.value)
		})
	});
}
