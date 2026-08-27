// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Geelooy OS remembers browser-peer permission without persisting runtime.
 * @description
 * The Awtsmoos lets the historical OS opt-in survive as remembered consent while
 * Awtsmoos.com removes storage mutation from the living state machine. A socket may
 * start and stop inside this tab; only the explicit remembered covenant crosses reload.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	forgetOsPeerConsent,
	OS_PEER_CONSENT_KEY,
	readOsPeerConsent,
	rememberOsPeerConsent
} from "../peerConsent.js";
import { VirtualOsTunnelState } from "../state.js";

function memoryStorage() {
	const values = new Map();
	return {
		getItem(key) {
			return values.get(key) || null;
		},
		setItem(key, value) {
			values.set(key, String(value));
		},
		values
	};
}

test("legacy OS enabled flag migrates to remembered consent", () => {
	const storage = memoryStorage();
	storage.setItem(OS_PEER_CONSENT_KEY, "1");
	assert.equal(readOsPeerConsent(storage).mode, "remembered");
});

test("remember and forget write versioned consent records", () => {
	const storage = memoryStorage();
	rememberOsPeerConsent(storage);
	let saved = JSON.parse(storage.getItem(OS_PEER_CONSENT_KEY));
	assert.equal(saved.schemaVersion, 1);
	assert.equal(saved.mode, "remembered");
	forgetOsPeerConsent(storage);
	saved = JSON.parse(storage.getItem(OS_PEER_CONSENT_KEY));
	assert.equal(saved.mode, "disabled");
});

test("runtime state enablement does not mutate remembered storage", () => {
	const storage = memoryStorage();
	storage.setItem(OS_PEER_CONSENT_KEY, "1");
	const before = storage.getItem(OS_PEER_CONSENT_KEY);
	const state = new VirtualOsTunnelState({ enabled: false });
	state.setConsentMode("session");
	state.setEnabled(true);
	assert.equal(state.snapshot().enabled, true);
	assert.equal(storage.getItem(OS_PEER_CONSENT_KEY), before);
	state.setEnabled(false);
	assert.equal(state.snapshot().consentMode, "disabled");
	assert.equal(storage.getItem(OS_PEER_CONSENT_KEY), before);
});

test("state distinguishes runtime consent from connection phase", () => {
	const state = new VirtualOsTunnelState();
	state.setConsentMode("session");
	state.setEnabled(true);
	state.markConnecting();
	assert.equal(state.snapshot().consentMode, "session");
	assert.equal(state.snapshot().phase, "connecting");
	state.markConnected();
	assert.equal(state.snapshot().connected, true);
	assert.equal(state.snapshot().consentMode, "session");
});
