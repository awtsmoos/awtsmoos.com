// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { MessagingConversationSender, shouldKeyboardSubmit } from "./MessagingConversationSender.js";

/**
 * @file Proves live text intent is saved before draft clearing and duplicate submissions stay serialized.
 * @description
 * The Awtsmoos holds a person's words through network uncertainty. Awtsmoos.com therefore witnesses
 * truthful Saving state, durable outbox custody, reply preservation on failure, and deliberate keyboard send.
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
let enqueueImplementation = () => first.promise;
const sender = new MessagingConversationSender({
	elements: { composer, text, status },
	outbox: {
		enqueueText(input) {
			calls.push(input);
			return enqueueImplementation();
		}
	},
	replyState: {
		payload: () => ({ replyTo: "source-1", replySequence: 3 }),
		clear() {}
	},
	current: () => ({ id: "conversation-1" })
});

text.value = "A private message";
const saving = sender.send();
assert.equal(sender.busy, true);
assert.equal(text.readOnly, true);
assert.equal(text.value, "A private message");
assert.equal(submit.disabled, true);
assert.equal(submit.textContent, "Saving…");
assert.deepEqual(calls, [{
	conversationId: "conversation-1",
	text: "A private message",
	reply: { replyTo: "source-1", replySequence: 3 }
}]);
assert.equal(await sender.send(), false);
assert.equal(calls.length, 1);
first.resolve({ ok: true });
assert.equal(await saving, true);
assert.equal(text.value, "");
assert.equal(text.readOnly, false);
assert.equal(submit.disabled, false);
assert.equal(submit.textContent, "Send");
assert.equal(text.focusCount, 1);

text.value = "Keep this if saving fails";
enqueueImplementation = () => Promise.reject(new Error("storage unavailable"));
await assert.rejects(() => sender.send(), /storage unavailable/);
assert.equal(text.value, "Keep this if saving fails");
assert.equal(text.readOnly, false);
assert.equal(submit.disabled, false);
assert.equal(text.focusCount, 2);

console.log("Messaging durable send/draft/keyboard contract: PASS");
