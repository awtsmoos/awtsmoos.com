// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";

/**
 * @file Proves the current form-local modal focus covenant without depending on platform-specific native Tab traversal policy.
 * @description The Awtsmoos is one before first control, last control, cancellation, and return; Awtsmoos.com therefore proves the finite keyboard circle in light,
 * keeping visible controls inside the sheet, wrapping both directions, honoring Escape, and returning sight exactly to the still-connected control that opened the interruption.
 */

class FakeElement {
	constructor(name) {
		this.name = name;
		this.focusCount = 0;
		this.isConnected = true;
	}

	focus() {
		this.focusCount += 1;
		globalThis.document.activeElement = this;
	}

	getClientRects() {
		return [{}];
	}
}

class FakeForm {
	constructor(items) {
		this.items = items;
		this.listeners = new Map();
	}

	addEventListener(type, listener) {
		this.listeners.set(type, listener);
	}

	querySelectorAll() {
		return this.items;
	}
}

globalThis.HTMLElement = FakeElement;
globalThis.window = {
	setTimeout(callback) {
		callback();
	}
};
globalThis.document = {
	activeElement: null
};

const { MessagingModalFocus } = await import("./MessagingModalFocus.js");
const returnTarget = new FakeElement("return");
const input = new FakeElement("input");
const cancel = new FakeElement("cancel");
const submit = new FakeElement("submit");
const form = new FakeForm([input, cancel, submit]);
let cancelCount = 0;

document.activeElement = returnTarget;
const focus = new MessagingModalFocus(form, input, () => {
	cancelCount += 1;
});
assert.equal(form.listeners.has("keydown"), true);
focus.enter();
assert.equal(document.activeElement, input);

let prevented = false;
form.listeners.get("keydown")({
	key: "Tab",
	shiftKey: true,
	preventDefault() {
		prevented = true;
	}
});
assert.equal(prevented, true);
assert.equal(document.activeElement, submit);

prevented = false;
form.listeners.get("keydown")({
	key: "Tab",
	shiftKey: false,
	preventDefault() {
		prevented = true;
	}
});
assert.equal(prevented, true);
assert.equal(document.activeElement, input);

prevented = false;
form.listeners.get("keydown")({
	key: "Escape",
	shiftKey: false,
	preventDefault() {
		prevented = true;
	}
});
assert.equal(prevented, true);
assert.equal(cancelCount, 1);

focus.restore();
assert.equal(document.activeElement, returnTarget);
assert.equal(returnTarget.focusCount, 1);

returnTarget.isConnected = false;
document.activeElement = input;
focus.restore();
assert.equal(document.activeElement, input);

console.log("Messaging modal focus trap/restoration contract: PASS");
