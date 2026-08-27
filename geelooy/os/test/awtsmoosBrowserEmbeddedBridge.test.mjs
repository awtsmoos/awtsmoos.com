//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded Browser Bridge Tests
 * @description The Awtsmoos proves identity by the exact vessel and measured channel;
 * Awtsmoos.com rejects forged sibling windows and foreign protocol garments, while
 * the true opaque guest may speak without pretending an origin string is its crown.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { EmbeddedBrowserBridge } from "../programs/awtsmoos-browser/embeddedBrowserBridge.js";
import {
	EMBEDDED_GUEST_PROTOCOL,
	GuestToHostType,
	HostToGuestType,
	guestMessage
} from "../programs/awtsmoos-browser/embeddedGuestProtocol.js";

test("accepts only exact contentWindow source and exact channel", () => {
	const fixture = bridgeFixture();
	const received = [];
	fixture.bridge.on(GuestToHostType.READY, payload => received.push(payload));
	const valid = guestMessage("guest_bridge", GuestToHostType.READY, { state: "ready" });
	assert.equal(fixture.bridge.receive({ source: fixture.contentWindow, data: valid, origin: "null" }), true);
	assert.equal(fixture.bridge.receive({ source: {}, data: valid, origin: "https://awtsmoos.com" }), false);
	assert.equal(fixture.bridge.receive({
		source: fixture.contentWindow,
		data: { ...valid, channelId: "guest_other" },
		origin: "null"
	}), false);
	assert.deepEqual(received, [{ state: "ready" }]);
});

test("forged protocol and host-only message types are rejected", () => {
	const fixture = bridgeFixture();
	const base = guestMessage("guest_bridge", GuestToHostType.NAVIGATE, { url: "https://example.com" });
	assert.equal(fixture.bridge.receive({
		source: fixture.contentWindow,
		data: { ...base, protocol: "forged" }
	}), false);
	assert.equal(fixture.bridge.receive({
		source: fixture.contentWindow,
		data: { ...base, type: HostToGuestType.RENDER }
	}), false);
});

test("event origin is not treated as identity for an opaque guest", () => {
	const fixture = bridgeFixture();
	let calls = 0;
	fixture.bridge.on(GuestToHostType.ERROR, () => { calls += 1; });
	const message = guestMessage("guest_bridge", GuestToHostType.ERROR, { message: "boom" });
	assert.equal(fixture.bridge.receive({
		source: fixture.contentWindow,
		data: message,
		origin: "https://attacker.invalid"
	}), true);
	assert.equal(calls, 1);
});

test("send emits a typed host message only to the guest contentWindow", () => {
	const fixture = bridgeFixture();
	const message = fixture.bridge.send(HostToGuestType.RENDER, { html: "<p>BH</p>" });
	assert.equal(message.protocol, EMBEDDED_GUEST_PROTOCOL);
	assert.equal(message.channelId, "guest_bridge");
	assert.deepEqual(fixture.posts, [[message, "*"]]);
});

test("destroy removes listener and invalid handler registration is rejected", () => {
	const fixture = bridgeFixture();
	assert.throws(() => fixture.bridge.on("unknown", () => {}), /BROWSER_EMBEDDED_HANDLER_INVALID/);
	assert.throws(() => fixture.bridge.on(GuestToHostType.READY, null), /BROWSER_EMBEDDED_HANDLER_INVALID/);
	fixture.bridge.destroy();
	assert.equal(fixture.windowObject.listener, null);
});

function bridgeFixture() {
	const posts = [];
	const contentWindow = {
		postMessage(message, targetOrigin) {
			posts.push([message, targetOrigin]);
		}
	};
	const windowObject = {
		listener: null,
		addEventListener(type, listener) {
			if (type === "message") this.listener = listener;
		},
		removeEventListener(type, listener) {
			if (type === "message" && this.listener === listener) this.listener = null;
		}
	};
	const frame = {
		channelId: "guest_bridge",
		iframe: { contentWindow }
	};
	return {
		bridge: new EmbeddedBrowserBridge({ frame, windowObject }),
		contentWindow,
		posts,
		windowObject
	};
}
