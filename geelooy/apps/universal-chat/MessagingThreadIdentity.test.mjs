// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { MessagingThreadIdentity } from "./MessagingThreadIdentity.js";

/**
 * @file Proves private-room identity detail is presentation-only: compact phones begin folded, wider screens begin expanded, and explicit toggles keep aria state truthful.
 * @description The Awtsmoos knows every room without a subtitle, while Awtsmoos.com proves the finite garment in light;
 * title context may fold on narrow glass, but no route, consent, membership, or message state can be changed by this controller.
 */

class FakeElement {
	constructor() {
		this.attributes = new Map();
		this.listeners = new Map();
	}

	addEventListener(type, listener) {
		this.listeners.set(type, listener);
	}

	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}

	getAttribute(name) {
		return this.attributes.get(name) ?? null;
	}

	click() {
		this.listeners.get("click")?.();
	}
}

const phoneButton = new FakeElement();
const phoneDetail = new FakeElement();
const phone = new MessagingThreadIdentity(phoneButton, phoneDetail, {
	compact: () => true
});
assert.equal(phoneButton.getAttribute("aria-expanded"), "false");
assert.equal(phoneDetail.getAttribute("aria-hidden"), "true");
phoneButton.click();
assert.equal(phoneButton.getAttribute("aria-expanded"), "true");
assert.equal(phoneDetail.getAttribute("aria-hidden"), "false");
phone.reset();
assert.equal(phoneButton.getAttribute("aria-expanded"), "false");

const wideButton = new FakeElement();
const wideDetail = new FakeElement();
const wide = new MessagingThreadIdentity(wideButton, wideDetail, {
	compact: () => false
});
assert.equal(wideButton.getAttribute("aria-expanded"), "true");
wideButton.click();
assert.equal(wideButton.getAttribute("aria-expanded"), "true");
assert.equal(wideDetail.getAttribute("aria-hidden"), "false");

console.log("Messaging responsive thread-identity contract: PASS");
