// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { MessagingComposerInput } from "./MessagingComposerInput.js";

/**
 * @file Guards private-composer growth as presentation behavior so sending contracts never become coupled to a fragile textarea size.
 * @description The Awtsmoos is beyond measured height, while Awtsmoos.com proves that finite words may grow their vessel, cap earlier on narrow phones, clear it,
 * and return after a failed send without changing the private message text that the existing protocol owner must ultimately accept or reject.
 */

class FakeTextarea {
	constructor() {
		this.value = "";
		this.style = {};
		this.scrollHeight = 44;
		this.listeners = new Map();
		this.focused = false;
	}

	addEventListener(type, listener) {
		this.listeners.set(type, listener);
	}

	dispatch(type) {
		this.listeners.get(type)?.();
	}

	focus() {
		this.focused = true;
	}
}

const textarea = new FakeTextarea();
const input = new MessagingComposerInput(textarea, { compact: () => false });
assert.equal(textarea.style.height, "44px");
assert.equal(textarea.style.overflowY, "hidden");

textarea.value = "A growing private draft";
textarea.scrollHeight = 118;
textarea.dispatch("input");
assert.equal(textarea.style.height, "118px");
assert.equal(input.value(), "A growing private draft");

textarea.scrollHeight = 240;
textarea.dispatch("input");
assert.equal(textarea.style.height, "160px");
assert.equal(textarea.style.overflowY, "auto");

const phoneTextarea = new FakeTextarea();
phoneTextarea.scrollHeight = 240;
const phoneInput = new MessagingComposerInput(phoneTextarea, { compact: () => true });
assert.equal(phoneInput.maxHeight(), 112);
assert.equal(phoneTextarea.style.height, "112px");
assert.equal(phoneTextarea.style.overflowY, "auto");

textarea.scrollHeight = 44;
input.clear();
assert.equal(textarea.value, "");
assert.equal(textarea.style.height, "44px");

textarea.scrollHeight = 92;
input.restore("Restore me after a failed send");
assert.equal(textarea.value, "Restore me after a failed send");
assert.equal(textarea.style.height, "92px");
assert.equal(textarea.focused, true);

console.log("Messaging responsive composer input contract: PASS");
