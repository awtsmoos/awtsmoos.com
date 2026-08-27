//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded Guest Document Tests
 * @description The Awtsmoos surrounds the guest with a nonce-sealed wall before life;
 * Awtsmoos.com proves ambient roads stay dark, hostile markup stays text, and only
 * the measured bootstrap flame may execute inside the opaque-origin light.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	buildEmbeddedGuestDocument,
	embeddedGuestCsp
} from "../programs/awtsmoos-browser/embeddedGuestDocument.js";

const CHANNEL = "guest_test_channel";
const NONCE = "nonce_test_value";

test("guest CSP denies ambient authority and grants only nonce scripts", () => {
	const csp = embeddedGuestCsp(NONCE);
	assert.match(csp, /default-src 'none'/);
	assert.match(csp, /connect-src 'none'/);
	assert.match(csp, /form-action 'none'/);
	assert.match(csp, /frame-src 'none'/);
	assert.match(csp, /object-src 'none'/);
	assert.match(csp, /worker-src 'none'/);
	assert.match(csp, /script-src 'nonce-nonce_test_value'/);
	assert.equal(csp.includes("script-src 'unsafe-inline'"), false);
	assert.equal(csp.includes("navigate-to"), false);
});

test("guest document embeds nonce CSP, local root, and nonce bootstrap only", () => {
	const documentText = guestDocument();
	assert.match(documentText, /Content-Security-Policy/);
	assert.match(documentText, /script-src 'nonce-nonce_test_value'/);
	assert.match(documentText, /<script nonce="nonce_test_value">/);
	assert.match(documentText, /id="awtsmoos-guest-root"/);
	assert.equal(documentText.includes("https://"), false);
	assert.equal(documentText.includes("http://"), false);
});

test("bootstrap validates parent source, protocol, and channel", () => {
	const documentText = guestDocument();
	assert.match(documentText, /event\.source\s*!==\s*parent/);
	assert.match(documentText, /message\.protocol\s*!==\s*protocol/);
	assert.match(documentText, /message\.channelId\s*!==\s*channelId/);
	assert.match(documentText, /parent\.postMessage/);
});

test("title markup is escaped instead of becoming guest DOM", () => {
	const documentText = buildEmbeddedGuestDocument({
		channelId: CHANNEL,
		scriptNonce: NONCE,
		title: "<img src=x onerror=alert(1)>"
	});
	assert.match(documentText, /&lt;img src=x onerror=alert\(1\)&gt;/);
	assert.equal(documentText.includes("<title><img"), false);
});

test("host channel cannot terminate bootstrap script markup", () => {
	const hostileChannel = "guest_</script><script>alert(1)</script>";
	const documentText = buildEmbeddedGuestDocument({
		channelId: hostileChannel,
		scriptNonce: NONCE
	});
	assert.equal(documentText.includes(hostileChannel), false);
	assert.match(documentText, /\\u003c\/script\\u003e/);
});

test("invalid channel testimony is rejected before document creation", () => {
	assert.throws(
		() => buildEmbeddedGuestDocument({ channelId: "bad\nchannel", scriptNonce: NONCE }),
		/BROWSER_GUEST_MESSAGE_INVALID/
	);
});

test("missing or malformed script nonce fails closed", () => {
	assert.throws(
		() => buildEmbeddedGuestDocument({ channelId: CHANNEL }),
		/BROWSER_GUEST_NONCE_INVALID/
	);
	assert.throws(
		() => embeddedGuestCsp("bad nonce!"),
		/BROWSER_GUEST_NONCE_INVALID/
	);
});

function guestDocument() {
	return buildEmbeddedGuestDocument({
		channelId: CHANNEL,
		scriptNonce: NONCE
	});
}
