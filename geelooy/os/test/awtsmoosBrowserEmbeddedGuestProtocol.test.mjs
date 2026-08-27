//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded Guest Protocol Tests
 * @description The Awtsmoos weighs every message before it crosses the glass;
 * Awtsmoos.com proves false versions, foreign channels, and unknown words cannot
 * masquerade as the measured speech shared by host and guest in their class.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	EMBEDDED_GUEST_PROTOCOL,
	GuestToHostType,
	HostToGuestType,
	guestMessage,
	hostMessage,
	isGuestMessage,
	isHostMessage
} from "../programs/awtsmoos-browser/embeddedGuestProtocol.js";

test("constructs frozen typed host and guest messages", () => {
	const guest = guestMessage("guest_one", GuestToHostType.READY, { state: "ready" });
	const host = hostMessage("guest_one", HostToGuestType.RENDER, { html: "<p>Hi</p>" });
	assert.equal(guest.protocol, EMBEDDED_GUEST_PROTOCOL);
	assert.equal(host.protocol, EMBEDDED_GUEST_PROTOCOL);
	assert.equal(Object.isFrozen(guest), true);
	assert.equal(Object.isFrozen(host), true);
});

test("rejects unknown types and malformed channels", () => {
	assert.throws(() => guestMessage("guest_one", "unknown"), /BROWSER_GUEST_MESSAGE_INVALID/);
	assert.throws(() => hostMessage("bad\nchannel", HostToGuestType.RESET), /BROWSER_GUEST_MESSAGE_INVALID/);
	assert.throws(() => hostMessage("", HostToGuestType.RESET), /BROWSER_GUEST_MESSAGE_INVALID/);
});

test("guest validation requires protocol, allowed type, and exact channel", () => {
	const valid = guestMessage("guest_one", GuestToHostType.NAVIGATE, { url: "https://example.com" });
	assert.equal(isGuestMessage(valid, "guest_one"), true);
	assert.equal(isGuestMessage(valid, "guest_two"), false);
	assert.equal(isGuestMessage({ ...valid, protocol: "fake" }, "guest_one"), false);
	assert.equal(isGuestMessage({ ...valid, type: "render" }, "guest_one"), false);
});

test("host validation rejects guest-only message types", () => {
	const host = hostMessage("guest_one", HostToGuestType.NETWORK_RESPONSE, { id: "1" });
	assert.equal(isHostMessage(host, "guest_one"), true);
	assert.equal(isHostMessage({ ...host, type: GuestToHostType.READY }, "guest_one"), false);
});
