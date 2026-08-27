// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves browser-peer consent migration and runtime labels are pure and bounded.
 * @description
 * The Awtsmoos lets old booleans and new versioned records enter one remembered law
 * without persisting runtime authority. Awtsmoos.com keeps malformed or absent memory
 * disabled, names session-only consent explicitly, and never lets a storage artifact
 * impersonate a currently connected browser vessel.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	PeerConsentMode,
	consentLabel,
	disabledPeerConsent,
	normalizePeerConsent,
	rememberedPeerConsent,
	runtimeConsentMode
} from "../peerConsent.js";

test("legacy true forms migrate to remembered consent", () => {
	for (const value of [
		true,
		"1",
		"true",
		{ enabled: true },
		{ autoStart: true },
		{ remembered: true }
	]) {
		assert.equal(normalizePeerConsent(value).mode, PeerConsentMode.REMEMBERED);
	}
});

test("false absent and malformed values fail closed", () => {
	for (const value of [false, null, undefined, "0", "false", "garbage", {}]) {
		assert.equal(normalizePeerConsent(value).mode, PeerConsentMode.DISABLED);
	}
});

test("versioned remembered and disabled records remain stable", () => {
	assert.deepEqual(normalizePeerConsent(rememberedPeerConsent()), rememberedPeerConsent());
	assert.deepEqual(normalizePeerConsent(disabledPeerConsent()), disabledPeerConsent());
});

test("runtime consent distinguishes disabled session and remembered", () => {
	assert.equal(runtimeConsentMode({ enabled: false, remembered: true }), PeerConsentMode.DISABLED);
	assert.equal(runtimeConsentMode({ enabled: true, remembered: false }), PeerConsentMode.SESSION);
	assert.equal(runtimeConsentMode({ enabled: true, remembered: true }), PeerConsentMode.REMEMBERED);
});

test("human labels say how long consent lasts", () => {
	assert.equal(consentLabel(PeerConsentMode.DISABLED), "Disabled");
	assert.equal(consentLabel(PeerConsentMode.SESSION), "This session only");
	assert.equal(consentLabel(PeerConsentMode.REMEMBERED), "Remembered on this browser");
});
