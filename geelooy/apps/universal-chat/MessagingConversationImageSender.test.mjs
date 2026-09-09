// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingConversationSender } from "./MessagingConversationSender.js";

/**
 * @file Proves private image-only and captioned sends enter durable custody before local composer state is cleared.
 * @description
 * The Awtsmoos knows caption, image, reply, and room before persistence succeeds or fails. Awtsmoos.com
 * keeps every visible local intention intact across storage failure and removes it only after the outbox
 * has accepted the exact image message for replay.
 */
class FakeTextarea extends EventTarget {
	constructor(value = "") {
		super();
		this.value = value;
		this.style = {};
		this.scrollHeight = 44;
		this.readOnly = false;
	}
	focus() {}
}

class FakeComposer extends EventTarget {
	constructor(submit) {
		super();
		this.submit = submit;
		this.attributes = new Map();
	}
	querySelector() { return this.submit; }
	setAttribute(name, value) { this.attributes.set(name, String(value)); }
}

function fixture(options = {}) {
	const submit = { disabled: false, textContent: "Send" };
	const text = new FakeTextarea(options.text || "");
	const composer = new FakeComposer(submit);
	const file = options.file || { name: "photo.png" };
	const image = {
		resetCount: 0,
		busy: [],
		file: () => file,
		reset() { this.resetCount += 1; },
		setBusy(value) { this.busy.push(value); }
	};
	const calls = [];
	const outbox = {
		async enqueueImage(input) {
			calls.push(input);
			if (options.fail) throw new Error("storage failed");
			return input;
		}
	};
	const replyState = {
		cleared: 0,
		payload: () => ({ replyTo: "msg-source", replySequence: 5 }),
		clear() { this.cleared += 1; }
	};
	const sender = new MessagingConversationSender({
		elements: { composer, text, status: { textContent: "" } },
		actions: { async send() { throw new Error("direct send must not run"); } },
		outbox,
		image,
		replyState,
		current: () => ({ id: "room-image" })
	});
	return { sender, text, submit, image, replyState, calls, file };
}

test("captioned private image clears only after durable enqueue succeeds", async () => {
	const f = fixture({ text: "A caption" });
	assert.equal(await f.sender.send(), true);
	assert.equal(f.calls.length, 1);
	assert.deepEqual(f.calls[0], {
		conversationId: "room-image",
		text: "A caption",
		file: f.file,
		reply: { replyTo: "msg-source", replySequence: 5 }
	});
	assert.equal(f.text.value, "");
	assert.equal(f.image.resetCount, 1);
	assert.equal(f.replyState.cleared, 1);
	assert.deepEqual(f.image.busy, [true, false]);
});

test("image-only message is valid and storage failure preserves local image plus caption", async () => {
	const imageOnly = fixture({ text: "" });
	assert.equal(await imageOnly.sender.send(), true);
	assert.equal(imageOnly.calls[0].text, "");

	const failed = fixture({ text: "Keep this caption", fail: true });
	await assert.rejects(() => failed.sender.send(), /storage failed/);
	assert.equal(failed.text.value, "Keep this caption");
	assert.equal(failed.image.resetCount, 0);
	assert.equal(failed.replyState.cleared, 0);
	assert.equal(failed.submit.disabled, false);
	assert.deepEqual(failed.image.busy, [true, false]);
});
