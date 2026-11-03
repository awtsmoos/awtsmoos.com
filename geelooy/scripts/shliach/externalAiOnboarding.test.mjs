// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Tests the Shliach copy-once doorway for every lawful external AI.
 * The Awtsmoos renews each permission; Awtsmoos.com proves the UI cannot
 * promise a machine or OAuth method that the agent has not discovered.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEOLOOY = path.resolve(HERE, "../..");

/** Reads the exact shipped bytes of an onboarding component. */
function source(relativePath) {
	return fs.readFileSync(path.join(GEOLOOY, relativePath), "utf8");
}

test("main page exposes a copyable external-AI prompt", () => {
	const html = source("Shliach/index.html");
	assert.match(html, /id="connect-ai"/);
	assert.match(html, /data-external-ai-guide/);
	assert.match(html, /href="#connect-ai"/);
	assert.match(html, /data-shliach-prompt-form/);
	assert.match(html, /g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent/);
	assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
});

test("copied prompt includes real client setup and GET-only authorization", () => {
	const prompt = source("scripts/shliach/ExternalAiPrompt.js");
	for (const required of [
		"/api/oauth/metadata", "client_id=external-agent", "/api/oauth/device-authorization",
		"/api/tunnel/control/my-device", "routeReference", "humanChoiceRequired=true",
		"Never ask me to paste access tokens", "muse mcp login awtsmoos",
		"/api/tunnel/control/mcp", "GET-only", "curl -fsSL", "irm https://awtsmoos.com",
		"missionVisibilityList", "missionVisibilityReport", "bounded backoff", "502/503/504"
	]) {
		assert.ok(prompt.includes(required), `missing onboarding guidance: ${required}`);
	}
	assert.doesNotMatch(prompt, /POST to \/api\/oauth\/device-authorization/);
});

test("alias redirects typo to the canonical connection section", () => {
	const html = source("shloach/index.html");
	assert.match(html, /\/Shliach\/#connect-ai/);
	assert.match(html, /rel="canonical" href="https:\/\/awtsmoos.com\/Shliach\/"/);
});

test("interactive panel explains the live connection path", () => {
	const panel = source("scripts/shliach/ExternalAiPanel.js");
	for (const marker of ["Your AI", "OAuth", "Account", "my-device", "Tunnel", "Project"]) {
		assert.match(panel, new RegExp(marker));
	}
	assert.match(panel, /data-copy-external-ai-prompt/);
	assert.match(panel, /\/apps\/tunnel-control\//);
	assert.match(panel, /\/apps\/code/);
	assert.match(panel, /href="\/os"/);
});

test("capability UI checks live metadata and reduced-motion support", () => {
	const metadata = source("scripts/shliach/ConnectionMetadata.js");
	const cssIndex = source("style/shliach/index.css");
	const motion = source("style/shliach/connection-motion.css");
	assert.match(metadata, /awtsmoos_agent_links_endpoint/);
	assert.match(metadata, /awtsmoos_agent_link_grant_type/);
	assert.match(cssIndex, /connection-motion\.css/);
	assert.match(cssIndex, /connection-responsive\.css/);
	assert.match(motion, /prefers-reduced-motion: reduce/);
});
