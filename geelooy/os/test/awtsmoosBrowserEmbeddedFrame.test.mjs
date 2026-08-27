//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded Browser Frame Tests
 * @description The Awtsmoos measures the iframe vessel before guest light enters;
 * Awtsmoos.com proves origin powers stay outside while cryptographic channel and
 * nonce names are born from secure browser randomness alone in the guarded zone.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	EmbeddedBrowserFrame,
	createEmbeddedChannelId,
	createEmbeddedScriptNonce,
	embeddedSandboxTokens
} from "../programs/awtsmoos-browser/embeddedBrowserFrame.js";

test("sandbox grants scripts and no other browser authority", () => {
	assert.equal(embeddedSandboxTokens(), "allow-scripts");
	for (const forbidden of [
		"allow-same-origin",
		"allow-popups",
		"allow-forms",
		"allow-downloads",
		"allow-top-navigation"
	]) {
		assert.equal(embeddedSandboxTokens().includes(forbidden), false);
	}
});

test("frame applies sandbox, no-referrer, and nonce-sealed isolated srcdoc", () => {
	const frame = new EmbeddedBrowserFrame({
		channelId: "guest_frame_one",
		documentObject: fakeDocument(),
		scriptNonce: "nonce_frame_one",
		title: "Remote page"
	});
	assert.equal(frame.iframe.attributes.sandbox, "allow-scripts");
	assert.equal(frame.iframe.attributes.referrerpolicy, "no-referrer");
	assert.equal(frame.iframe.attributes["aria-label"], "Remote page");
	assert.match(frame.iframe.srcdoc, /guest_frame_one/);
	assert.match(frame.iframe.srcdoc, /nonce_frame_one/);
});

test("attach, reload, and destroy preserve host ownership and nonce", () => {
	const frame = new EmbeddedBrowserFrame({
		channelId: "guest_frame_two",
		documentObject: fakeDocument(),
		scriptNonce: "nonce_frame_two"
	});
	const attached = [];
	frame.attach({ append(value) { attached.push(value); } });
	assert.equal(attached[0], frame.iframe);
	frame.reload("Second title");
	assert.match(frame.iframe.srcdoc, /Second title/);
	assert.match(frame.iframe.srcdoc, /nonce_frame_two/);
	frame.destroy();
	assert.equal(frame.iframe.removed, true);
});

test("channel and nonce generation prefer browser cryptographic randomness", () => {
	const cryptoObject = { randomUUID: () => "known-uuid" };
	assert.equal(createEmbeddedChannelId(cryptoObject), "guest_knownuuid");
	assert.equal(createEmbeddedScriptNonce(cryptoObject), "nonce_knownuuid");
	const valuesChannel = createEmbeddedChannelId({
		getRandomValues(bytes) {
			bytes.fill(15);
			return bytes;
		}
	});
	assert.match(valuesChannel, /^guest_(0f){18}$/);
});

test("frame fails closed when secure randomness is unavailable", () => {
	assert.throws(
		() => createEmbeddedChannelId({}),
		/BROWSER_EMBEDDED_SECURE_RANDOM_REQUIRED/
	);
	assert.throws(
		() => createEmbeddedScriptNonce({}),
		/BROWSER_EMBEDDED_SECURE_RANDOM_REQUIRED/
	);
	assert.throws(
		() => new EmbeddedBrowserFrame({ documentObject: fakeDocument(), cryptoObject: {} }),
		/BROWSER_EMBEDDED_SECURE_RANDOM_REQUIRED/
	);
});

function fakeDocument() {
	return {
		createElement(name) {
			assert.equal(name, "iframe");
			return {
				attributes: {},
				className: "",
				removed: false,
				setAttribute(key, value) {
					this.attributes[key] = value;
				},
				remove() {
					this.removed = true;
				}
			};
		}
	};
}
