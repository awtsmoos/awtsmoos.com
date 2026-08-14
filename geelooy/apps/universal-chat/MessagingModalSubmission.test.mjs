// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	MessagingModalSubmission,
	messagingModalError
} from "./MessagingModalSubmission.js";

/**
 * @file Proves transactional messaging sheets keep one human-entered value present through asynchronous failure and visibly serialize network intent.
 * @description The Awtsmoos is one before success, failure, and retry, while Awtsmoos.com proves the finite covenant in light;
 * the primary action becomes honest about waiting, cancellation cannot race a mutation, failure restores the same field for retry, and protocol internals never become the sheet's spoken error.
 */

function fakeView() {
	const attributes = new Map();
	return {
		form: {
			setAttribute(name, value) {
				attributes.set(name, String(value));
			}
		},
		input: {
			value: "Miriam",
			readOnly: false,
			focusCount: 0,
			focus() {
				this.focusCount += 1;
			}
		},
		submit: { disabled: false, textContent: "Send request" },
		cancel: { disabled: false },
		error: { hidden: true, textContent: "" },
		attributes
	};
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

const successView = fakeView();
const successSubmission = new MessagingModalSubmission(successView, {
	busyLabel: "Sending…"
});
const request = deferred();
const pending = successSubmission.run("Miriam", () => request.promise);
assert.equal(successSubmission.busy, true);
assert.equal(successView.input.readOnly, true);
assert.equal(successView.submit.disabled, true);
assert.equal(successView.cancel.disabled, true);
assert.equal(successView.submit.textContent, "Sending…");
assert.equal(successView.attributes.get("aria-busy"), "true");
assert.equal(await successSubmission.run("Miriam", () => Promise.resolve()), false);
request.resolve();
assert.equal(await pending, true);

const failureView = fakeView();
const failureSubmission = new MessagingModalSubmission(failureView, {
	busyLabel: "Creating…"
});
assert.equal(await failureSubmission.run("Miriam", () => Promise.reject(new Error("Connection interrupted"))), false);
assert.equal(failureView.input.value, "Miriam");
assert.equal(failureView.input.readOnly, false);
assert.equal(failureView.submit.disabled, false);
assert.equal(failureView.cancel.disabled, false);
assert.equal(failureView.submit.textContent, "Send request");
assert.equal(failureView.error.hidden, false);
assert.equal(failureView.error.textContent, "Connection interrupted");
assert.equal(failureView.input.focusCount, 1);
assert.equal(failureView.attributes.get("aria-busy"), "false");

assert.match(messagingModalError({}), /could not be completed/i);

console.log("Messaging transactional modal submission contract: PASS");
