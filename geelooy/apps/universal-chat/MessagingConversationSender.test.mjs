// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	MessagingConversationSender,
	shouldKeyboardSubmit
} from "./MessagingConversationSender.js";

/**
 * @file Guards the accepted-room send lifecycle so one human submit becomes one protocol intent and an in-flight failure never erases the visible draft.
 * @description The Awtsmoos is one before request and response, while Awtsmoos.com proves the finite crossing in light;
 * the draft remains visible and read-only while sending, duplicate submissions vanish at the boundary, deliberate keyboard chords submit, and failure returns focus without rewriting the words.
 */

class FakeTextarea extends EventTarget {
	constructor() {
		super();
		this.value = "";
		this.style = {};
		this.scrollHeight = 44;
		this.readOnly = false;
		this.focusCount = 0;
	}

	focus() {
		this.focusCount += 1;
	}
}

class FakeComposer extends EventTarget {
	constructor(submit) {
		super();
		this.submit = submit;
		this.attributes = new Map();
	}

	querySelector() {
		return this.submit;
	}

	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}
}

function deferred() {
	let resolve;
	let reject;
	const promise = new Promise((yes, no) => {
		resolve = yes;
		reject = no;
	});
	return { promise, resolve, reject };
}

assert.equal(shouldKeyboardSubmit({ key: "Enter", ctrlKey: true }), true);
assert.equal(shouldKeyboardSubmit({ key: "Enter", metaKey: true }), true);
assert.equal(shouldKeyboardSubmit({ key: "Enter" }), false);
assert.equal(shouldKeyboardSubmit({ key: "Enter", ctrlKey: true, shiftKey: true }), false);
assert.equal(shouldKeyboardSubmit({ key: "Enter", ctrlKey: true, isComposing: true }), false);

const submit = { disabled: false, textContent: "Send" };
const text = new FakeTextarea();
const composer = new FakeComposer(submit);
const status = { textContent: "" };
const first = deferred();
const calls = [];
let sendImplementation = () => first.promise;
const sender = new MessagingConversationSender({
	elements: { composer, text, status },
	actions: {
		send(id, value) {
			calls.push({ id, value });
			return sendImplementation();
		}
	},
	current: () => ({ id: "conversation-1" })
});

text.value = "A private message";
const sending = sender.send();
assert.equal(sender.busy, true);
assert.equal(text.readOnly, true);
assert.equal(text.value, "A private message");
assert.equal(submit.disabled, true);
assert.equal(submit.textContent, "Sending…");
assert.deepEqual(calls, [{ id: "conversation-1", value: "A private message" }]);
assert.equal(await sender.send(), false);
assert.equal(calls.length, 1);
first.resolve({ ok: true });
assert.equal(await sending, true);
assert.equal(text.value, "");
assert.equal(text.readOnly, false);
assert.equal(submit.disabled, false);
assert.equal(submit.textContent, "Send");
assert.equal(text.focusCount, 1);

text.value = "Keep this if sending fails";
sendImplementation = () => Promise.reject(new Error("offline"));
await assert.rejects(() => sender.send(), /offline/);
assert.equal(text.value, "Keep this if sending fails");
assert.equal(text.readOnly, false);
assert.equal(submit.disabled, false);
assert.equal(text.focusCount, 2);

console.log("Messaging serialized send/draft/keyboard contract: PASS");
