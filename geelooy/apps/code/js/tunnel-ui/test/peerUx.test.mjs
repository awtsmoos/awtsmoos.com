// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Code presents its existing browser tunnel as explicit human authority.
 * @description
 * The Awtsmoos lets a tab become a vessel only through visible consent.
 * Awtsmoos.com keeps provider-neutral wording, disable controls, and native limits clear.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { tunnelConsoleMarkup } from "../markup.js";

test("console describes explicit provider-neutral browser-peer consent", () => {
	const html = tunnelConsoleMarkup({
		status: "idle",
		tunnelName: "awt-code-test",
		sessions: [],
		missions: [],
		actions: []
	});
	assert.match(html, /Use this Code tab as a tunnel/);
	assert.match(html, /Enable this tab as a tunnel/);
	assert.match(html, /Disable this tab/);
	assert.match(html, /account-bound browser vessel is temporary/);
	assert.match(html, /native shell power still requires a native tunnel/);
	assert.doesNotMatch(html, /ChatGPT/i);
});

test("connected console disables enable and keeps disable active", () => {
	const html = tunnelConsoleMarkup({
		status: "connected",
		tunnelName: "awt-code-test",
		sessions: [],
		missions: [],
		actions: []
	});
	assert.match(
		html,
		/data-tunnel-action="start" disabled>Enable this tab as a tunnel/
	);
	assert.match(
		html,
		/data-tunnel-action="stop" >Disable this tab/
	);
});

test("settings explain persisted auto-start without provider coupling", () => {
	const source = fs.readFileSync(
		new URL("../../app/settings/tunnelMarkup.js", import.meta.url),
		"utf8"
	);
	assert.match(source, /Automatically enable this Code tab as a tunnel/);
	assert.match(source, /persisted preference/);
	assert.match(source, /temporary peer/);
	assert.doesNotMatch(source, /Use Code with ChatGPT/);
});
