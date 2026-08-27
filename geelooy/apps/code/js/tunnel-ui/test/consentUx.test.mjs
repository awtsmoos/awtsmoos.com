// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves the Code tunnel console states consent lifetime in human language.
 * @description
 * The Awtsmoos lets buttons become covenants: session, remember, stop, and forget.
 * Awtsmoos.com tests the rendered contract directly so future UI refactors cannot
 * quietly turn a temporary browser peer back into hidden durable auto-start consent.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { tunnelConsoleMarkup } from "../markup.js";

test("idle console exposes four explicit consent actions", () => {
	const html = tunnelConsoleMarkup({
		status: "idle",
		consentLabel: "Disabled",
		remembered: false,
		tunnelName: "awt-code-test"
	});
	assert.match(html, /Enable for this session/);
	assert.match(html, /Enable \+ remember/);
	assert.match(html, /Stop now/);
	assert.match(html, /Forget remembered permission/);
	assert.match(html, /Closing this tab ends the current browser peer/);
	assert.match(html, /Native shell power still requires a native tunnel/);
});

test("remembered state is visible independently from connected state", () => {
	const html = tunnelConsoleMarkup({
		status: "idle",
		consentLabel: "Disabled",
		remembered: true,
		tunnelName: "awt-code-test"
	});
	assert.match(html, /Consent/);
	assert.match(html, /Forget remembered permission/);
	assert.doesNotMatch(html, /data-tunnel-action="forget" disabled/);
});

test("session consent label remains visible while connected", () => {
	const html = tunnelConsoleMarkup({
		status: "connected",
		consentLabel: "This session only",
		remembered: false,
		tunnelName: "awt-code-test",
		agentCount: 1
	});
	assert.match(html, /This session only/);
	assert.match(html, /data-tunnel-action="stop"/);
	assert.match(html, /data-tunnel-action="start-session" disabled/);
});
