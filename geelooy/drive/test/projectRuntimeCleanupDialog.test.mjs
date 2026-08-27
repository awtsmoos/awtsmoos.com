//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";

/**
 * @file Native-dialog accessibility and consent contract for destructive runtime cleanup.
 * @description
 * The Awtsmoos lets consent take visible and spoken form before a temporary server vessel is dissolved;
 * Awtsmoos.com proves the dialog names what is removed, links its accessible title and description, protects Drive/OS source truth, and distinguishes confirm from cancel.
 */
test("runtime cleanup dialog is named accessibly and resolves explicit consent", async () => {
	const environment = installFakeDom();
	try {
		const { createDriveDialogs } = await import("../ui/dialogs.js");
		const dialogs = createDriveDialogs();
		const resultPromise = dialogs.confirmRuntimeCleanup();
		const dialog = dialogs.element.children[0];
		const text = collectText(dialog);
		const titleId = dialog["aria-labelledby"];
		const descriptionId = dialog["aria-describedby"];
		assert.match(titleId, /^drive-dialog-title-/);
		assert.match(descriptionId, /^drive-dialog-description-/);
		assert.equal(findById(dialog, titleId)?.textContent, "Remove materialized runtime?");
		assert.match(findById(dialog, descriptionId)?.textContent || "", /materialized server copy/i);
		assert.match(text, /runtime activity history/i);
		assert.match(text, /Drive\/OS source files are not deleted/i);
		assert.match(text, /Remove server copy/i);
		assert.equal(findByClass(dialog, "button danger") !== null, true);
		dialog.returnValue = "confirm";
		dialog.dispatch("close");
		assert.equal(await resultPromise, true);
	} finally {
		environment.restore();
	}
});

test("runtime cleanup dialog resolves null when cancelled", async () => {
	const environment = installFakeDom();
	try {
		const { createDriveDialogs } = await import("../ui/dialogs.js?cancel");
		const dialogs = createDriveDialogs();
		const resultPromise = dialogs.confirmRuntimeCleanup();
		const dialog = dialogs.element.children[0];
		dialog.returnValue = "cancel";
		dialog.dispatch("close");
		assert.equal(await resultPromise, null);
	} finally {
		environment.restore();
	}
});

function installFakeDom() {
	const previousDocument = globalThis.document;
	const previousNode = globalThis.Node;
	globalThis.Node = FakeNode;
	globalThis.document = {
		createElement: tagName => new FakeNode(tagName),
		createTextNode: text => new FakeNode("#text", String(text))
	};
	return {
		restore() {
			globalThis.document = previousDocument;
			globalThis.Node = previousNode;
		}
	};
}

class FakeNode {
	constructor(tagName, text = "") {
		this.tagName = tagName;
		this.textContent = text;
		this.children = [];
		this.listeners = new Map();
		this.returnValue = "";
		this.className = "";
	}

	append(...children) {
		this.children.push(...children);
	}

	setAttribute(name, value) {
		this[name] = value;
	}

	addEventListener(name, listener) {
		this.listeners.set(name, listener);
	}

	dispatch(name) {
		this.listeners.get(name)?.();
	}

	showModal() {}
	focus() {}
	remove() {}
}

function collectText(node) {
	return [node.textContent, ...node.children.map(collectText)].join(" ");
}

function findById(node, id) {
	if (node.id === id) return node;
	for (const child of node.children) {
		const found = findById(child, id);
		if (found) return found;
	}
	return null;
}

function findByClass(node, className) {
	if (node.className === className) return node;
	for (const child of node.children) {
		const found = findByClass(child, className);
		if (found) return found;
	}
	return null;
}
