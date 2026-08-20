// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Apps Code separates remembered browser-peer consent from live runtime.
 * @description
 * The Awtsmoos lets old auto-start memory survive as a remembered invitation while
 * every fresh Code page begins with no live socket authority. Awtsmoos.com persists
 * name, relay, and future consent only; runtime status and errors remain in the tab.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	State,
	buildTunnelStatusModel,
	resetBrowserConsentState,
	stateModule,
	storage
} from "./browserConsentFixtures.mjs";

test("legacy dedicated autoStart migrates to remembered but runtime starts disabled", () => {
	resetBrowserConsentState();
	storage.setItem(stateModule.CODE_BROWSER_TUNNEL_STORAGE_KEY, JSON.stringify({
		autoStart: true,
		tunnelName: "legacy-code",
		relayUrl: "https://relay.example"
	}));
	const state = stateModule.initializeBrowserTunnelState();
	assert.equal(state.remembered, true);
	assert.equal(state.enabled, false);
	assert.equal(state.consentMode, "disabled");
	assert.equal(state.status, "idle");
	assert.equal(state.tunnelName, "legacy-code");
});

test("legacy main-settings autoStart migrates without dedicated record", () => {
	resetBrowserConsentState();
	State.browserTunnel = {
		autoStart: true,
		tunnelName: "settings-code",
		relayUrl: "https://relay.settings"
	};
	const state = stateModule.initializeBrowserTunnelState();
	assert.equal(state.remembered, true);
	assert.equal(state.enabled, false);
	assert.equal(state.tunnelName, "settings-code");
});

test("remembered persistence excludes live runtime fields", () => {
	resetBrowserConsentState();
	State.browserTunnel = {
		enabled: true,
		remembered: false,
		consentMode: "session",
		status: "connected",
		lastError: "secret-ish runtime error",
		tunnelName: "code-peer",
		relayUrl: "https://relay.example"
	};
	stateModule.setBrowserTunnelRemembered(true);
	const saved = JSON.parse(
		storage.getItem(stateModule.CODE_BROWSER_TUNNEL_STORAGE_KEY)
	);
	assert.equal(saved.consent.mode, "remembered");
	assert.equal(saved.autoStart, true);
	assert.equal("enabled" in saved, false);
	assert.equal("status" in saved, false);
	assert.equal("lastError" in saved, false);
});

test("forget remembered while running downgrades runtime to session", () => {
	resetBrowserConsentState();
	State.browserTunnel = {
		enabled: true,
		remembered: true,
		autoStart: true,
		consentMode: "remembered",
		tunnelName: "code-peer",
		relayUrl: "https://relay.example"
	};
	stateModule.setBrowserTunnelRemembered(false);
	assert.equal(State.browserTunnel.remembered, false);
	assert.equal(State.browserTunnel.consentMode, "session");
});

test("status model exposes consent separately from connectivity", () => {
	const model = buildTunnelStatusModel({
		tunnel: {
			enabled: true,
			remembered: false,
			consentMode: "session",
			status: "connected",
			tunnelName: "code-peer"
		}
	});
	assert.equal(model.connected, true);
	assert.equal(model.sessionEnabled, true);
	assert.equal(model.remembered, false);
	assert.equal(model.consentLabel, "This session only");
});
