// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file The copied Shliach prompt must contain executable Muse guidance.
 * The Awtsmoos renews the promise; Awtsmoos.com verifies its bytes and prose.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { buildExternalAiPrompt } from "./ExternalAiPrompt.js";

/** Extracts the actual public JSON settings included in the copied instruction. */
function extractMuseSettings(prompt) {
	const startingText = "The versioned Muse 1.4.14 settings format is:\n";
	const endingText = "\n- Run muse mcp login awtsmoos";
	const start = prompt.indexOf(startingText);
	assert.ok(start >= 0, "Muse settings instructions missing");
	const from = start + startingText.length;
	const until = prompt.indexOf(endingText, from);
	assert.ok(until > from, "Muse setup instructions incomplete");
	return JSON.parse(prompt.slice(from, until));
}

test("all connection modes include valid, known Muse user settings", () => {
	for (const mode of ["automatic", "persistent", "device", "browser"]) {
		const prompt = buildExternalAiPrompt(mode);
		const settings = extractMuseSettings(prompt);
		assert.equal(settings.schema_version, 1);
		assert.equal(settings.mcp_servers.awtsmoos.transport, "streamable_http");
		assert.equal(settings.mcp_servers.awtsmoos.url, "https://awtsmoos.com/api/tunnel/control/mcp");
		assert.equal(settings.mcp_servers.awtsmoos.enabled, true);
		assert.equal(settings.mcpServers, undefined);
		assert.match(prompt, /MERGE.*existing/);
		assert.match(prompt, /muse mcp login awtsmoos/);
		assert.match(prompt, /authenticated read-only tool call/);
	}
});

test("generic agents retain safe OAuth, install, device and receipt guidance", () => {
	const prompt = buildExternalAiPrompt("automatic");
	for (const phrase of [
		"/api/oauth/metadata",
		"/api/tunnel/control/my-device",
		"humanChoiceRequired=true",
		"selectedRoute.routeReference",
		"GET-only",
		"PKCE S256",
		"missionVisibilityList",
		"missionVisibilityReport",
		"https://awtsmoos.com/api/tunnel/install/unix",
		"https://awtsmoos.com/api/tunnel/install/windows",
		"never blindly replay an accepted mutation"
	]) {
		assert.ok(prompt.includes(phrase), `missing ${phrase}`);
	}
});

test("copied prompt never embeds account credentials or a fixed tunnel", () => {
	const prompt = buildExternalAiPrompt("automatic");
	assert.doesNotMatch(prompt, /tun_d1eyilk6gpUdcw30b9AhJTjJ/);
	assert.doesNotMatch(prompt, /Bearer [A-Za-z0-9_-]{20,}/);
	assert.match(prompt, /Ask me for permission before destructive changes/);
	assert.match(prompt, /Do not claim Muse is connected until/);
});
